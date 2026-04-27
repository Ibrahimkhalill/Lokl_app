import React, { useState, useRef } from "react";
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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import SendIcon from "../../assets/icons/navigate.svg";
import { pickPostMedia } from "../../lib/mediaPicker";

const INITIAL_MESSAGES = [
  {
    id: "m1",
    text: "How can I improve my sleep?",
    sender: "other" as const,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
  },
  {
    id: "m2",
    text: "How can I improve my sleep?",
    sender: "me" as const,
  },
  {
    id: "m3",
    text: "lorem. sed volutpat lacus ullamcorper Sed hendrerit ullamcorper elit adipiscing urna. Ut ipsum orci libero, consectetur at.",
    sender: "other" as const,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
  },
];

type Message = (typeof INITIAL_MESSAGES)[number] & {
  localImageUri?: string;
};

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [attachmentDraft, setAttachmentDraft] = useState<{
    uri: string;
    kind: "image" | "video";
  } | null>(null);
  const listRef = useRef<FlatList>(null);

  const sendMessage = () => {
    const text = input.trim();
    const hasAttach = Boolean(attachmentDraft);
    if (!text && !hasAttach) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      text:
        text ||
        (attachmentDraft?.kind === "video" ? "Sent a video" : ""),
      sender: "me",
      localImageUri:
        attachmentDraft?.kind === "image"
          ? attachmentDraft.uri
          : undefined,
    };

    setMessages((prev) => [newMsg, ...prev]);
    setInput("");
    setAttachmentDraft(null);

    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pixcraft_132</Text>
        <View style={{ width: 42 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }: { item: Message }) => {
            const isMe = item.sender === "me";

            return (
              <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                {!isMe && (
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.msgAvatar}
                  />
                )}

                <View
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleOther,
                  ]}
                >
                  {"localImageUri" in item && item.localImageUri ? (
                    <Image
                      source={{ uri: item.localImageUri }}
                      style={styles.bubbleImage}
                      resizeMode="cover"
                    />
                  ) : null}
                  {item.text ? (
                    <Text
                      style={[
                        styles.bubbleText,
                        "localImageUri" in item && item.localImageUri
                          ? styles.bubbleTextBelowImage
                          : null,
                      ]}
                    >
                      {item.text}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          }}
        />

        {/* Input Area */}
        <View style={styles.inputWrapper}>
          {attachmentDraft ? (
            <View style={styles.draftAttachRow}>
              {attachmentDraft.kind === "image" ? (
                <Image
                  source={{ uri: attachmentDraft.uri }}
                  style={styles.draftThumb}
                />
              ) : (
                <View style={styles.draftVideoBadge}>
                  <Ionicons name="videocam" size={20} color={Colors.primary} />
                </View>
              )}
              <TouchableOpacity
                onPress={() => setAttachmentDraft(null)}
                hitSlop={10}
              >
                <Text style={styles.draftRemove}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.inputBar}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your message"
                placeholderTextColor="#94a3b8"
                value={input}
                onChangeText={setInput}
                multiline
              />

              <TouchableOpacity
                style={styles.mediaBtn}
                onPress={async () => {
                  const picked = await pickPostMedia();
                  if (!picked) return;
                  setAttachmentDraft({
                    uri: picked.uri,
                    kind: picked.type === "video" ? "video" : "image",
                  });
                }}
              >
                <Ionicons name="image-outline" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <SendIcon width={24} height={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
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

  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  messageList: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 12,
  },

  msgRowMe: {
    justifyContent: "flex-end",
  },

  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  bubble: {
    maxWidth: "75%",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  bubbleOther: {
    backgroundColor: "#1e2a3a",
    borderBottomLeftRadius: 6,
  },

  bubbleMe: {
    backgroundColor: "#2b3a55",
    borderBottomRightRadius: 6,
  },

  bubbleText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleImage: {
    width: 200,
    height: 140,
    borderRadius: 14,
    marginBottom: 0,
  },
  bubbleTextBelowImage: {
    marginTop: 8,
  },

  draftAttachRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  draftThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.card,
  },
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
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#223154",
    borderRadius: 32,
    paddingLeft: 18,
    paddingRight: 8,
    minHeight: 50,
  },

  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 32 / 2,
    paddingVertical: 12,
    maxHeight: 100,
  },

  mediaBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 32,
    backgroundColor: "#223154",
    justifyContent: "center",
    alignItems: "center",
  },
});
