import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Image, TextInput, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    text: 'How can I improve my sleep?',
    sender: 'other',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
  },
  {
    id: 'm2',
    text: 'How can I improve my sleep?',
    sender: 'me',
  },
  {
    id: 'm3',
    text: 'lorem. sed volutpat lacus ullamcorper Sed hendrerit ullamcorper elit adipiscing urna. Ut ipsum orci libero, consectetur at.',
    sender: 'other',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
  },
];

type Message = typeof INITIAL_MESSAGES[0];

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      text: input.trim(),
      sender: 'me',
    };

    // 🔥 important for inverted list
    setMessages((prev) => [newMsg, ...prev]);

    setInput('');

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            const isMe = item.sender === 'me';

            return (
              <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                {!isMe && (
                  <Image source={{ uri: item.avatar }} style={styles.msgAvatar} />
                )}

                <View
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleOther,
                  ]}
                >
                  <Text style={styles.bubbleText}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />

        {/* Input Area */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Type your message"
              placeholderTextColor="#94a3b8"
              value={input}
              onChangeText={setInput}
              multiline
            />

            <TouchableOpacity style={styles.mediaBtn}>
              <Ionicons name="image-outline" size={22} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={18} color="#fff" />
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
    backgroundColor: '#0f1720',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1e2a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  messageList: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 12,
  },

  msgRowMe: {
    justifyContent: 'flex-end',
  },

  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  bubble: {
    maxWidth: '75%',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  bubbleOther: {
    backgroundColor: '#1e2a3a',
    borderBottomLeftRadius: 6,
  },

  bubbleMe: {
    backgroundColor: '#2b3a55',
    borderBottomRightRadius: 6,
  },

  bubbleText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },

  inputWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#0f1720',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    backgroundColor: '#1e2a3a',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 100,
  },

  mediaBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e2a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2b3a55',
    justifyContent: 'center',
    alignItems: 'center',
  },
});