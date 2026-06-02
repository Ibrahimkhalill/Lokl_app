import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/colors";
import SendIcon from "../../assets/icons/navigate.svg";
import ImageIcon from "../../assets/icons/image.svg";
import { pickPostMedia } from "../../lib/mediaPicker";
import { messageService } from "../../services/messageService";
import { BASE_URL, fixMediaUrl, getErrorMessage } from "../../lib/api";

const WS_BASE = BASE_URL.replace(/^https?/, "ws").replace("/api", "");

type ChatMessage = {
  id: number | string;
  sender_id: number;
  sender_name: string;
  sender_avatar?: string | null;
  content: string;
  created_at: string;
  localImageUri?: string;
};

type ChatMode = "dm" | "group" | "event";

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    user_id?: string;
    group_id?: string;
    event_id?: string;
    name?: string;
  }>();

  const userId = params.user_id ? Number(params.user_id) : null;
  const groupId = params.group_id ? Number(params.group_id) : null;
  const eventId = params.event_id ? Number(params.event_id) : null;
  const headerName = params.name ?? "Chat";

  const mode: ChatMode = userId ? "dm" : groupId ? "group" : "event";

  const [myId, setMyId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [attachmentDraft, setAttachmentDraft] = useState<{ uri: string; kind: "image" | "video" } | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("user").then((raw) => {
      if (raw) {
        const u = JSON.parse(raw);
        setMyId(u.id ?? null);
      }
    });
  }, []);

  const normalizeMessages = useCallback((raw: any[]): ChatMessage[] =>
    raw.map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      sender_name: m.sender_name ?? "",
      sender_avatar: fixMediaUrl(m.sender_avatar ?? m.avatar),
      content: m.content ?? m.body ?? "",
      created_at: m.created_at,
    })).reverse(),
    []
  );

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (mode === "dm" && userId) {
        res = await messageService.getDmThread(userId);
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : (data?.messages ?? data?.results ?? []);
        setMessages(normalizeMessages(list));
        messageService.markAsRead(userId).catch(() => {});
      } else if (mode === "group" && groupId) {
        res = await messageService.getGroupMessages(groupId);
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : (data?.results ?? data?.messages ?? []);
        setMessages(normalizeMessages(list));
      } else if (mode === "event" && eventId) {
        res = await messageService.getEventChat(eventId);
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : (data?.messages ?? data?.results ?? []);
        setMessages(normalizeMessages(list));
      }
    } catch (e) {
      console.log("[Chat] history error:", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [mode, userId, groupId, eventId, normalizeMessages]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  useEffect(() => {
    let wsUrl = "";
    if (mode === "dm" && userId) wsUrl = `${WS_BASE}/ws/messages/${userId}/`;
    else if (mode === "group" && groupId) wsUrl = `${WS_BASE}/ws/groups/${groupId}/chat/`;
    else if (mode === "event" && eventId) wsUrl = `${WS_BASE}/ws/events/${eventId}/chat/`;
    if (!wsUrl) return;

    AsyncStorage.getItem("accessToken").then((token) => {
      const url = token ? `${wsUrl}?token=${token}` : wsUrl;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {};
      ws.onclose = () => {};
      ws.onerror = () => {};

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "message") {
            const msg: ChatMessage = {
              id: data.id ?? Date.now(),
              sender_id: data.sender_id,
              sender_name: data.sender_name ?? "",
              sender_avatar: fixMediaUrl(data.avatar ?? data.sender_avatar),
              content: data.content ?? "",
              created_at: data.created_at ?? new Date().toISOString(),
            };
            setMessages((prev) => {
              // Replace optimistic entry if this is our own message echoed back
              const tmpIdx = prev.findIndex(
                (m) => String(m.id).startsWith("tmp-") && m.content === msg.content && m.sender_id === msg.sender_id
              );
              if (tmpIdx >= 0) {
                const next = [...prev];
                next[tmpIdx] = msg;
                return next;
              }
              return [msg, ...prev];
            });
          } else if (data.type === "typing") {
            if (data.is_typing) {
              setTypingUser(data.user_name ?? "Someone");
            } else {
              setTypingUser(null);
            }
          } else if (data.type === "read") {
            // could mark messages as read here
          }
        } catch {}
      };
    });

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [mode, userId, groupId, eventId]);

  const sendTyping = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing" }));
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      wsRef.current?.send(JSON.stringify({ type: "read" }));
    }, 2000);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !attachmentDraft) return;

    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      sender_id: myId ?? -1,
      sender_name: "Me",
      content: text || (attachmentDraft?.kind === "video" ? "Sent a video" : ""),
      created_at: new Date().toISOString(),
      localImageUri: attachmentDraft?.kind === "image" ? attachmentDraft.uri : undefined,
    };

    setMessages((prev) => [optimistic, ...prev]);
    setInput("");
    setAttachmentDraft(null);
    setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);

    console.log("[Chat] WS state:", wsRef.current?.readyState, "OPEN=", WebSocket.OPEN);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("[Chat] sending via WS:", text);
      wsRef.current.send(JSON.stringify({ type: "message", content: text }));
    } else {
      console.log("[Chat] WS not open, falling back to REST");
      try {
        if (mode === "dm" && userId) await messageService.sendDm(userId, text);
        else if (mode === "group" && groupId) await messageService.sendGroupMessage(groupId, text);
        else if (mode === "event" && eventId) await messageService.sendEventMessage(eventId, text);
      } catch (e) {
        console.log("[Chat] send error:", getErrorMessage(e));
      }
    }
  };

  const displayName = decodeURIComponent(headerName);
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* Participant avatars — fixed at top of message area */}
      

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            inverted
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messageList}
            ListFooterComponent={
              typingUser ? (
                <View style={styles.typingRow}>
                  <Text style={styles.typingText}>{typingUser} is typing…</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const isMe = item.sender_id === myId;
              return (
                <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                  {!isMe && (
                    item.sender_avatar ? (
                      <Image source={{ uri: item.sender_avatar }} style={styles.msgAvatar} />
                    ) : (
                      <View style={[styles.msgAvatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarInitial}>
                          {item.sender_name?.[0]?.toUpperCase() ?? "?"}
                        </Text>
                      </View>
                    )
                  )}
                  <View style={isMe ? styles.bubbleWrapMe : styles.bubbleWrapOther}>
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                      {item.localImageUri ? (
                        <Image source={{ uri: item.localImageUri }} style={styles.bubbleImage} resizeMode="cover" />
                      ) : null}
                      {item.content ? (
                        <Text style={[styles.bubbleText, item.localImageUri ? { marginTop: 8 } : null]}>
                          {item.content}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                      {timeLabel(item.created_at)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputWrapper}>
          {attachmentDraft ? (
            <View style={styles.draftAttachRow}>
              {attachmentDraft.kind === "image" ? (
                <Image source={{ uri: attachmentDraft.uri }} style={styles.draftThumb} />
              ) : (
                <View style={styles.draftVideoBadge}>
                  <Ionicons name="videocam" size={20} color={Colors.primary} />
                </View>
              )}
              <TouchableOpacity onPress={() => setAttachmentDraft(null)} hitSlop={10}>
                <Text style={styles.draftRemove}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.inputBar}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your message"
                placeholderTextColor="#4a5568"
                value={input}
                onChangeText={(t) => { setInput(t); sendTyping(); }}
                multiline
              />
              <TouchableOpacity
                style={styles.mediaBtn}
                onPress={async () => {
                  const picked = await pickPostMedia();
                  if (!picked) return;
                  setAttachmentDraft({ uri: picked.uri, kind: picked.type === "video" ? "video" : "image" });
                }}
              >
                <ImageIcon width={22} height={22} color="#4a5568" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <SendIcon width={20} height={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: "700", textAlign: "center" },
  messageList: { paddingHorizontal: 16, paddingVertical: 20 },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18,
    paddingBottom: 14,
  },
  initialsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  initialsText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 14,
  },
  msgRowMe: { justifyContent: "flex-end" },
  msgAvatar: { width: 40, height: 34, borderRadius: 17 },
  avatarPlaceholder: {
    backgroundColor: "#1e2a3a",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: Colors.text, fontSize: 13, fontWeight: "700" },
  bubbleWrapOther: { alignItems: "flex-start", maxWidth: "75%" },
  bubbleWrapMe: { alignItems: "flex-end", maxWidth: "75%", },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOther: {
    backgroundColor: "#1e2a3a",
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: "#2b3a55",
    borderBottomRightRadius: 4,
  },
  bubbleText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  bubbleImage: { width: 200, height: 140, borderRadius: 12 },
  msgTime: { color: Colors.textMuted, fontSize: 10, marginTop: 4, marginLeft: 2 },
  msgTimeMe: { textAlign: "right", marginRight: 2 },
  typingRow: { paddingHorizontal: 16, paddingBottom: 4 },
  typingText: { color: Colors.textSecondary, fontSize: 12, fontStyle: "italic" },
  draftAttachRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  draftThumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: Colors.card },
  draftVideoBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  draftRemove: { color: Colors.textSecondary, fontSize: 14 },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
  inputBar: { flexDirection: "row", alignItems: "center", gap: 10 },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#131e2e",
    borderRadius: 28,
    paddingLeft: 18,
    paddingRight: 8,
    minHeight: 52,
  },
  input: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 10, maxHeight: 100 },
  mediaBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#131e2e",
    justifyContent: "center",
    alignItems: "center",
  },
});
