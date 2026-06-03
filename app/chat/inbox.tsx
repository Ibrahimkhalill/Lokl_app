import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchIcon from "../../assets/icons/search.svg";
import { useMessages } from "../../context/MessageContext";
import { EmptyState } from "../../components/primitives";

function timeLabel(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { conversations, loading, refreshing, refreshInbox } = useMessages();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
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
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => { setShowSearch(false); setSearch(""); }}
            >
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.headerTitle}>Messages</Text>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(true)}>
              <SearchIcon width={20} height={20} color={Colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={filtered.length === 0 ? styles.centerContent : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshInbox}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="No messages yet"
              subtitle="Start a conversation with someone"
            />
          }
          renderItem={({ item }) => {
            const chatRoute =
              item.type === "group"
                ? `/chat/id?group_id=${item.meta.group_id}&name=${encodeURIComponent(item.name)}`
                : item.type === "event"
                ? `/chat/id?event_id=${item.meta.event_id}&name=${encodeURIComponent(item.name)}`
                : `/chat/id?user_id=${item.meta.user_id}&name=${encodeURIComponent(item.name)}`;

            return (
              <TouchableOpacity
                style={styles.chatRow}
                activeOpacity={0.8}
                onPress={() => router.push(chatRoute as any)}
              >
                <View style={styles.avatarWrap}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={22} color={Colors.textSecondary} />
                    </View>
                  )}
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatTop}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatTime}>{timeLabel(item.updated_at)}</Text>
                  </View>
                  <View style={styles.chatBottom}>
                    <Text style={styles.chatLast} numberOfLines={2}>
                      {item.last_message?.body ?? ""}
                    </Text>
                    {item.unread_count > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread_count}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingTop: 80 },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
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
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
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
  headerSearchInput: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 0 },
  listContent: { paddingBottom: 120 },
  separator: { height: 1, backgroundColor: Colors.cardBorder, marginLeft: 80 },
  chatRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 40, height: 40, borderRadius: 27 },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  chatInfo: { flex: 1 },
  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  chatName: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  chatTime: { color: Colors.textSecondary, fontSize: 12 },
  chatBottom: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  chatLast: { color: Colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    marginTop: 2,
  },
  unreadText: { color: Colors.black, fontSize: 11, fontWeight: "800" },
});
