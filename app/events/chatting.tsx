import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  mine: boolean;
  avatar?: string;
  time?: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    text: "How can I improve my sleep?",
    mine: false,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  },
  { id: "2", text: "How can I improve my sleep?", mine: true },
  {
    id: "3",
    text: "lorem. sed volutpat lacus ullamcorper Sed hendrerit ullamcorper elit adipiscing urna. Ut ipsum orci libero, consectetur at.",
    mine: false,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
  },
];

export default function ChattingScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input.trim(), mine: true },
    ]);
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Pixcraft_132</Text>
        <TouchableOpacity style={s.backBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.messagesList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[s.messageRow, item.mine && s.messageRowMine]}>
              {!item.mine && item.avatar && (
                <Image source={{ uri: item.avatar }} style={s.msgAvatar} />
              )}
              <View
                style={[s.bubble, item.mine ? s.bubbleMine : s.bubbleOther]}
              >
                <Text style={[s.bubbleText, item.mine && s.bubbleTextMine]}>
                  {item.text}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Input Bar */}
        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            placeholder="Type your message"
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={s.emojiBtn}>
            <Ionicons
              name="happy-outline"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={s.sendBtn} onPress={send}>
            <Ionicons name="send" size={18} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: "700" },
  messagesList: { paddingHorizontal: 16, paddingVertical: 20, gap: 14 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  messageRowMine: { justifyContent: "flex-end" },
  msgAvatar: { width: 34, height: 34, borderRadius: 17 },
  bubble: {
    maxWidth: "72%",
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  bubbleOther: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleMine: { backgroundColor: "#2A2D80", borderBottomRightRadius: 4 },
  bubbleText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  bubbleTextMine: { color: Colors.white },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.background,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
    maxHeight: 100,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
