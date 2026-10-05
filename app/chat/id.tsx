import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/colors";
import SendIcon from "../../assets/icons/navigate.svg";
import { messageService } from "../../services/messageService";
import { WS_BASE, fixMediaUrl, getErrorMessage } from "../../lib/api";
import { useMessages } from "@/context/MessageContext";
import { useAuth } from "@/context/AuthContext";

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

// function timeLabel(iso: string) {
//   const d = new Date(iso);
//   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// }

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

  const { user } = useAuth();
  const myId: number | null = user?.id ?? null;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [attachmentDraft, setAttachmentDraft] = useState<{ uri: string; kind: "image" | "video" } | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const { refreshInbox, markRead, setActiveChat } = useMessages();
  const refreshInboxRef = useRef(refreshInbox);
  refreshInboxRef.current = refreshInbox;
  const sendingRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tell the inbox which chat is open so it doesn't notify for messages we're already seeing.
  useEffect(() => {
    const target =
      mode === "dm" && userId ? { type: "direct" as const, id: userId }
      : mode === "group" && groupId ? { type: "group" as const, id: groupId }
      : mode === "event" && eventId ? { type: "event" as const, id: eventId }
      : null;
    setActiveChat(target);
    return () => setActiveChat(null);
  }, [mode, userId, groupId, eventId, setActiveChat]);

const normalizeMessages = useCallback((raw: any[]): ChatMessage[] => {
  return raw
    .map((m) => {
      // Extract sender ID with multiple fallbacks
      let senderId = m.sender_id;
      
      if (!senderId && m.sender?.id) {
        senderId = m.sender.id;
      }
      if (!senderId && m.send_id) {
        // send_id seems to be message ID in some cases, but sometimes matches sender
        // Only use it if we don't have better info and it looks like a user ID
        senderId = m.send_id;
      }

      return {
        id: m.id,
        sender_id: senderId,
        sender_name: m.sender?.name ?? m.sender_name ?? "",
        sender_avatar: fixMediaUrl(
          m.sender?.profile_picture ?? m.sender_avatar ?? m.avatar
        ),
        content: m.content ?? m.body ?? "",
        created_at: m.created_at,
      };
    })
    .reverse();
}, []);

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
        markRead("direct", userId);
        refreshInboxRef.current();
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
  }, [mode, userId, groupId, eventId, normalizeMessages, markRead]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  useEffect(() => {
    let wsUrl = "";
    if (mode === "dm" && userId) wsUrl = `${WS_BASE}/ws/messages/${userId}/`;
    else if (mode === "group" && groupId) wsUrl = `${WS_BASE}/ws/groups/${groupId}/chat/`;
    else if (mode === "event" && eventId) wsUrl = `${WS_BASE}/ws/events/${eventId}/chat/`;
    if (!wsUrl) return;

    let cancelled = false;
    AsyncStorage.getItem("accessToken").then((token) => {
      // Screen left (or chat changed) before the token resolved — don't open an orphan socket.
      if (cancelled) return;
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
              if (prev.some((m) => m.id === msg.id)) return prev; // already have it
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
      cancelled = true;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [mode, userId, groupId, eventId]);



  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !attachmentDraft) return;
    if (sendingRef.current) return; // guard against double taps
    sendingRef.current = true;

    const tmpId = `tmp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tmpId,
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

    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "message", content: text }));
      } else {
        let res;
        if (mode === "dm" && userId) res = await messageService.sendDm(userId, text);
        else if (mode === "group" && groupId) res = await messageService.sendGroupMessage(groupId, text);
        else if (mode === "event" && eventId) res = await messageService.sendEventMessage(eventId, text);
        // Swap the optimistic bubble for the saved message (no WS echo will arrive).
        const saved = res?.data?.data ?? res?.data;
        if (saved?.id != null) {
          const [msg] = normalizeMessages([saved]);
          setMessages((prev) => prev.map((m) => (m.id === tmpId ? { ...msg, sender_id: msg.sender_id ?? optimistic.sender_id } : m)));
        }
      }
    } catch (e) {
      // Roll back the optimistic bubble and give the text back so the user can retry.
      setMessages((prev) => prev.filter((m) => m.id !== tmpId));
      setInput(text);
      Alert.alert("Message not sent", getErrorMessage(e));
    } finally {
      sendingRef.current = false;
    }
  };
useEffect(() => {
  return () => {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    // Optional: send stop typing on leave
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing", is_typing: false }));
    }
  };
}, []);

const stopTyping = useCallback(() => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: "typing",
      is_typing: false     // ← Must be false
    }));
  }
}, []);

const handleTyping = useCallback(() => {
  if (wsRef.current?.readyState !== WebSocket.OPEN) return;

  wsRef.current.send(JSON.stringify({
    type: "typing",
    is_typing: true
  }));

  if (typingTimer.current) clearTimeout(typingTimer.current);

  typingTimer.current = setTimeout(stopTyping, 2000);
}, [stopTyping]);


  // expo-router already decodes params; decoding again throws on names like "100% Fitness".
  const displayName = headerName;
  // const initials = displayName
  //   .split(/\s+/)
  //   .slice(0, 2)
  //   .map((w) => w[0]?.toUpperCase() ?? "")
  //   .join("");

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
          
            renderItem={({ item }) => {
              console.log("[Chat] rendering message:", item);
         
              const isMe = 
                item.sender_id === myId || 
                item.sender_id === myId?.toString() || 
                (item.id && String(item.id).startsWith('tmp-'))
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
                   
                  </View>
                </View>
              );
            }}
          />
        )}

        {typingUser && (
          <View style={styles.typingRow}>
            <Text style={styles.typingText}>{typingUser} is typing...</Text>
          </View>
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
                onChangeText={(t) => { setInput(t); handleTyping(); }}
                multiline
                onBlur={stopTyping}
              />
              {/* <TouchableOpacity
                style={styles.mediaBtn}
                onPress={async () => {
                  const picked = await pickPostMedia();
                  if (!picked) return;
                  setAttachmentDraft({ uri: picked.uri, kind: picked.type === "video" ? "video" : "image" });
                }}
              >
                <ImageIcon width={22} height={22} color="#4a5568" />
              </TouchableOpacity> */}
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
  msgAvatar: { width: 40, height: 40, borderRadius: 20 },
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
