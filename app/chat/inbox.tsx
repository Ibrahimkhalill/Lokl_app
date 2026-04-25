import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchIcon from "../../assets/icons/search.svg";

const CHATS = [
  {
    id: "c1",
    name: "Shane Martinez",
    last: "On my way home but i needed to stop by books store to...",
    time: "5 min",
    unread: 1,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    isGroup: false,
  },
  {
    id: "c2",
    name: "Katie Keller",
    last: "I'm watching friends. What are you doing?",
    time: "15 min",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    isGroup: false,
  },
  {
    id: "c3",
    name: "Stephen Mann",
    last: "I'm working now. I'm marking a deposit for our company.",
    time: "20 min",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    isGroup: false,
  },
  {
    id: "c4",
    name: "Melvin Pratt",
    last: "Great seeing you. i have to go now. I'll talk to you late.",
    time: "1hour",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
    isGroup: false,
  },
  {
    id: "c5",
    name: "Sports Club Group",
    last: "Great seeing you. i have to go now. I'll talk to you late.",
    time: "2hour",
    unread: 1,
    avatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=100&q=80",
    isGroup: true,
  },
];

type ChatItem = (typeof CHATS)[0];

export default function MessagesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

  const filtered = CHATS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        {showSearch ? (
          <View style={styles.headerSearchWrap}>
            <SearchIcon width={18} height={18} color={Colors.textSecondary} />
            <TextInput
              ref={searchInputRef}
              style={styles.headerSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search messages"
              placeholderTextColor={Colors.textSecondary}
            />
            <TouchableOpacity
              style={styles.headerSearchClose}
              onPress={() => {
                setShowSearch(false);
                setSearch("");
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.headerTitle}>Messages</Text>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowSearch(true)}
            >
              <SearchIcon width={20} height={20} color={Colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: ChatItem }) => (
          <TouchableOpacity
            style={styles.chatRow}
            activeOpacity={0.8}
            onPress={() => router.push(`/chat/id`)}
          >
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            </View>

            {/* Info */}
            <View style={styles.chatInfo}>
              <View style={styles.chatTop}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>
              <View style={styles.chatBottom}>
                <Text style={styles.chatLast} numberOfLines={2}>
                  {item.last}
                </Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

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
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  headerSearchWrap: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 21,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
  },
  headerSearchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  headerSearchClose: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  listContent: { paddingBottom: 120 },
  separator: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginLeft: 80,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  chatInfo: { flex: 1 },
  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  chatName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  chatTime: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  chatBottom: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  chatLast: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    marginTop: 2,
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
});
