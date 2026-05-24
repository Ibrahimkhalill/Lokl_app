import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  AppState,
  AppStateStatus,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Colors } from "../constants/colors";
import { BASE_URL, getErrorMessage } from "../lib/api";
import { messageService } from "../services/messageService";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

const WS_BASE = BASE_URL.replace(/^https?/, "ws").replace("/api", "");

// setNotificationHandler — silently skip if native module is unavailable
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Native module not available — will fall back to in-app toast
}

export type Conversation = {
  type: "direct" | "group" | "event";
  id: number;
  name: string;
  avatar: string | null;
  last_message: { body: string; created_at: string } | null;
  unread_count: number;
  updated_at: string;
  meta: { user_id?: number; group_id?: number; event_id?: number };
};

type ToastData = {
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  content: string;
};

type MessageContextType = {
  conversations: Conversation[];
  unreadTotal: number;
  loading: boolean;
  refreshing: boolean;
  refreshInbox: () => Promise<void>;
  markRead: (type: Conversation["type"], id: number) => void;
};

const MessageContext = createContext<MessageContextType | null>(null);

// ── In-app toast banner ───────────────────────────────────────────────────────
function MessageToast({
  data,
  onPress,
  onDismiss,
}: {
  data: ToastData;
  onPress: () => void;
  onDismiss: () => void;
}) {
  const translateY = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -120,
        duration: 280,
        useNativeDriver: true,
      }).start(onDismiss);
    }, 4000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY }] }]}>
      <TouchableOpacity style={styles.toastInner} activeOpacity={0.9} onPress={onPress}>
        <View style={styles.toastAvatarWrap}>
          {data.senderAvatar ? (
            <Image source={{ uri: data.senderAvatar }} style={styles.toastAvatar} />
          ) : (
            <View style={[styles.toastAvatar, styles.toastAvatarPlaceholder]}>
              <Ionicons name="person" size={18} color={Colors.textSecondary} />
            </View>
          )}
          <View style={styles.toastDot} />
        </View>
        <View style={styles.toastBody}>
          <Text style={styles.toastName} numberOfLines={1}>{data.senderName}</Text>
          <Text style={styles.toastContent} numberOfLines={1}>{data.content}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={10} style={styles.toastClose}>
          <Ionicons name="close" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(2000);
  const isMounted = useRef(true);
  const nativeNotifAvailable = useRef(false);

  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  // Detect login state from AsyncStorage
  useEffect(() => {
    const check = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (isMounted.current) setIsLoggedIn(!!token);
    };
    check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => sub.remove();
  }, []);

  // Request native notification permission; record if available
  useEffect(() => {
    if (!isLoggedIn) return;
    Notifications.requestPermissionsAsync()
      .then(({ status }) => { nativeNotifAvailable.current = status === "granted"; })
      .catch(() => { nativeNotifAvailable.current = false; });
  }, [isLoggedIn]);

  // Tap on native notification → navigate
  useEffect(() => {
    let sub: ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null = null;
    try {
      sub = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as any;
        if (data?.user_id) {
          router.push(`/chat/id?user_id=${data.user_id}&name=${encodeURIComponent(data.name ?? "")}`);
        }
      });
    } catch {}
    return () => { sub?.remove(); };
  }, []);

  const notify = useCallback((toastData: ToastData) => {
    if (nativeNotifAvailable.current) {
      // Native push notification
      Notifications.scheduleNotificationAsync({
        content: {
          title: toastData.senderName,
          body: toastData.content,
          data: { user_id: toastData.senderId, name: toastData.senderName },
        },
        trigger: null,
      }).catch(() => {
        // If native fails at runtime, fall back to toast
        setToast(toastData);
      });
    } else {
      // In-app toast
      setToast(toastData);
    }
  }, []);

  const fetchInbox = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await messageService.getInbox();
      const raw = res.data?.data ?? res.data;
      const list: Conversation[] = Array.isArray(raw) ? raw : (raw?.results ?? []);
      if (isMounted.current) setConversations(list);
    } catch (e) {
      console.log("[MessageContext] inbox error:", getErrorMessage(e));
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isLoggedIn) return;
    const token = await AsyncStorage.getItem("accessToken");
    if (!token || !isMounted.current) return;

    const url = `${WS_BASE}/ws/inbox/?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelay.current = 2000;
      console.log("[InboxWS] connected");
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type !== "new_message") return;

        // Update conversation list
        const updated: Conversation = {
          type: data.chat_type ?? "direct",
          id: data.chat_id,
          name: data.name ?? data.sender_name,
          avatar: data.avatar ?? null,
          last_message: { body: data.content, created_at: data.created_at },
          unread_count: data.unread_count ?? 1,
          updated_at: data.created_at,
          meta: data.chat_type === "group"
            ? { group_id: data.chat_id }
            : data.chat_type === "event"
            ? { event_id: data.chat_id }
            : { user_id: data.sender_id },
        };
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.type === updated.type && c.id === updated.id);
          if (idx >= 0) {
            const next = [...prev];
            next.splice(idx, 1);
            return [updated, ...next];
          }
          return [updated, ...prev];
        });

        // Notify user
        notify({
          senderId: data.sender_id,
          senderName: data.sender_name,
          senderAvatar: data.avatar ?? null,
          content: data.content,
        });
      } catch {}
    };

    ws.onerror = () => console.log("[InboxWS] error");
    ws.onclose = () => {
      if (!isMounted.current) return;
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
        connect();
      }, reconnectDelay.current);
    };
  }, [isLoggedIn, notify]);

  useEffect(() => {
    isMounted.current = true;
    if (isLoggedIn) {
      fetchInbox();
      connect();
    }
    return () => {
      isMounted.current = false;
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [isLoggedIn, connect, fetchInbox]);

  useEffect(() => {
    const handleAppState = (next: AppStateStatus) => {
      if (next === "active" && isLoggedIn) {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) connect();
        fetchInbox();
      }
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [isLoggedIn, connect, fetchInbox]);

  const markRead = useCallback((type: Conversation["type"], id: number) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.type === type && c.id === id ? { ...c, unread_count: 0 } : c
      )
    );
  }, []);

  return (
    <MessageContext.Provider
      value={{
        conversations,
        unreadTotal,
        loading,
        refreshing,
        refreshInbox: () => fetchInbox(true),
        markRead,
      }}
    >
      {children}
      {toast && (
        <MessageToast
          data={toast}
          onPress={() => {
            setToast(null);
            router.push(
              `/chat/id?user_id=${toast.senderId}&name=${encodeURIComponent(toast.senderName)}`
            );
          }}
          onDismiss={() => setToast(null)}
        />
      )}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessages must be used within MessageProvider");
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 52,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  toastAvatarWrap: { position: "relative" },
  toastAvatar: { width: 42, height: 42, borderRadius: 21 },
  toastAvatarPlaceholder: {
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  toastDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#05DF72",
    borderWidth: 1.5,
    borderColor: Colors.card,
  },
  toastBody: { flex: 1 },
  toastName: { color: Colors.text, fontSize: 14, fontWeight: "700", marginBottom: 2 },
  toastContent: { color: Colors.textSecondary, fontSize: 13 },
  toastClose: { padding: 4 },
});
