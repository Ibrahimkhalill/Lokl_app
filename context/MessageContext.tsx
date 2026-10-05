import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { WS_BASE, getErrorMessage } from "../lib/api";
import { messageService } from "../services/messageService";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useAuth } from "./AuthContext";

// The notification handler is registered once in app/_layout.tsx.

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

type ChatTarget = {
  type: Conversation["type"];
  /** user id for direct chats, group id / event id otherwise */
  id: number;
  name: string;
};

type ToastData = {
  key: number;
  target: ChatTarget;
  senderName: string;
  senderAvatar: string | null;
  content: string;
};

/** Route to the chat screen for a conversation target. */
export function chatRoute(target: ChatTarget) {
  const param = target.type === "group" ? "group_id" : target.type === "event" ? "event_id" : "user_id";
  return `/chat/id?${param}=${target.id}&name=${encodeURIComponent(target.name ?? "")}` as const;
}

type MessageContextType = {
  conversations: Conversation[];
  unreadTotal: number;
  loading: boolean;
  refreshing: boolean;
  refreshInbox: () => Promise<void>;
  markRead: (type: Conversation["type"], id: number) => void;
  /** Chat screen reports which conversation is open so we don't notify for it. */
  setActiveChat: (target: { type: Conversation["type"]; id: number } | null) => void;
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
  const { isLoggedIn } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(2000);
  const isMounted = useRef(true);
  const loggedInRef = useRef(isLoggedIn);
  loggedInRef.current = isLoggedIn;
  const nativeNotifAvailable = useRef(false);
  const activeChat = useRef<{ type: Conversation["type"]; id: number } | null>(null);
  const toastSeq = useRef(0);

  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Record whether native notifications are permitted (permission is requested in _layout)
  useEffect(() => {
    if (!isLoggedIn) return;
    Notifications.getPermissionsAsync()
      .then(({ status }) => { nativeNotifAvailable.current = status === "granted"; })
      .catch(() => { nativeNotifAvailable.current = false; });
  }, [isLoggedIn]);

  // Tap on native notification → navigate to the right chat
  useEffect(() => {
    let sub: ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null = null;
    try {
      sub = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as any;
        const type: Conversation["type"] = data?.chat_type ?? "direct";
        const id = type === "direct" ? (data?.user_id ?? data?.sender_id) : data?.chat_id;
        if (id) router.push(chatRoute({ type, id: Number(id), name: data?.name ?? "" }));
      });
    } catch {}
    return () => { sub?.remove(); };
  }, []);

  const notify = useCallback((toastData: Omit<ToastData, "key">) => {
    const open = activeChat.current;
    if (open && open.type === toastData.target.type && open.id === toastData.target.id) return;

    const showToast = () => setToast({ ...toastData, key: ++toastSeq.current });
    if (nativeNotifAvailable.current) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: toastData.senderName,
          body: toastData.content,
          data: {
            chat_type: toastData.target.type,
            chat_id: toastData.target.id,
            user_id: toastData.target.type === "direct" ? toastData.target.id : undefined,
            name: toastData.target.name,
          },
        },
        trigger: null,
      }).catch(showToast); // If native fails at runtime, fall back to toast
    } else {
      showToast();
    }
  }, []);

  const fetchInbox = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await messageService.getInbox();
      const raw = res.data?.data ?? res.data;
      const list: Conversation[] = Array.isArray(raw) ? raw : (raw?.results ?? []);
      if (isMounted.current && loggedInRef.current) setConversations(list);
    } catch (e) {
      console.log("[MessageContext] inbox error:", getErrorMessage(e));
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const refreshInbox = useCallback(() => fetchInbox(true), [fetchInbox]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    const ws = wsRef.current;
    wsRef.current = null; // detach first so its onclose won't schedule a reconnect
    ws?.close();
  }, []);

  const connect = useCallback(async () => {
    if (!loggedInRef.current) return;
    const existing = wsRef.current;
    if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) return;
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    const token = await AsyncStorage.getItem("accessToken");
    if (!token || !isMounted.current || !loggedInRef.current) return;
    // Another connect() may have won the race while we awaited the token.
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) return;

    const ws = new WebSocket(`${WS_BASE}/ws/inbox/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelay.current = 2000;
    };

    ws.onmessage = (e) => {
      if (wsRef.current !== ws) return;
      try {
        const data = JSON.parse(e.data);
        if (data.type !== "new_message") return;

        const type: Conversation["type"] = data.chat_type ?? "direct";
        const name = data.name ?? data.sender_name ?? "Unknown";
        const updated: Conversation = {
          type,
          id: data.chat_id,
          name,
          avatar: data.avatar ?? null,
          last_message: { body: data.content, created_at: data.created_at },
          unread_count: data.unread_count ?? 1,
          updated_at: data.created_at,
          meta: type === "group"
            ? { group_id: data.chat_id }
            : type === "event"
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

        notify({
          target: {
            type,
            id: type === "direct" ? data.sender_id : data.chat_id,
            name: type === "direct" ? (data.sender_name ?? name) : name,
          },
          senderName: data.sender_name ?? name,
          senderAvatar: data.avatar ?? null,
          content: data.content,
        });
      } catch {}
    };

    ws.onerror = () => {};
    ws.onclose = () => {
      // Ignore sockets we intentionally replaced/closed.
      if (wsRef.current !== ws || !isMounted.current || !loggedInRef.current) return;
      wsRef.current = null;
      reconnectTimer.current = setTimeout(() => {
        reconnectTimer.current = null;
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
        connect();
      }, reconnectDelay.current);
    };
  }, [notify]);

  // Follow the auth state: connect on login, tear down + forget the inbox on logout.
  useEffect(() => {
    if (isLoggedIn) {
      fetchInbox();
      connect();
    } else {
      setConversations([]);
      setToast(null);
    }
    return disconnect;
  }, [isLoggedIn, connect, disconnect, fetchInbox]);

  useEffect(() => {
    const handleAppState = (next: AppStateStatus) => {
      if (next === "active" && loggedInRef.current) {
        connect();
        fetchInbox();
      }
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [connect, fetchInbox]);

  const markRead = useCallback((type: Conversation["type"], id: number) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.type === type && c.id === id ? { ...c, unread_count: 0 } : c
      )
    );
  }, []);

  const setActiveChat = useCallback((target: { type: Conversation["type"]; id: number } | null) => {
    activeChat.current = target;
  }, []);

  const value = useMemo(
    () => ({ conversations, unreadTotal, loading, refreshing, refreshInbox, markRead, setActiveChat }),
    [conversations, unreadTotal, loading, refreshing, refreshInbox, markRead, setActiveChat]
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
      {toast && (
        <MessageToast
          key={toast.key}
          data={toast}
          onPress={() => {
            setToast(null);
            router.push(chatRoute(toast.target));
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
