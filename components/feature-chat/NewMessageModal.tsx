import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { userService } from "../../services/userService";

type Friend = { id: number; name: string; avatar?: string | null; username?: string | null };

/** "+" in Messages: pick a friend and open a chat with them. */
export function NewMessageModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!visible) return;
    setSearch("");
    setLoading(true);
    userService
      .getFriends()
      .then((res) => {
        const raw = res.data?.data ?? res.data;
        setFriends(Array.isArray(raw) ? raw : raw?.results ?? []);
      })
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, [visible]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? friends.filter((f) => (f.name ?? "").toLowerCase().includes(q) || (f.username ?? "").toLowerCase().includes(q)) : friends;
  }, [friends, search]);

  const open = (f: Friend) => {
    onClose();
    router.push(`/chat/id?user_id=${f.id}&name=${encodeURIComponent(f.name ?? "")}` as never);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>New message</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={s.searchBox}>
            <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search friends"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 30 }} />
          ) : (
            <FlatList
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              data={list}
              keyExtractor={(f) => String(f.id)}
              style={{ maxHeight: 400 }}
              ListEmptyComponent={<Text style={s.empty}>No friends to message yet.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.row} onPress={() => open(item)} activeOpacity={0.8}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={s.avatar} />
                  ) : (
                    <View style={[s.avatar, s.avatarEmpty]}>
                      <Ionicons name="person" size={16} color={Colors.textSecondary} />
                    </View>
                  )}
                  <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 34 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { color: Colors.text, fontSize: 18, fontWeight: "800" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 8 },
  searchInput: { flex: 1, color: Colors.text, paddingVertical: 10, fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarEmpty: { backgroundColor: Colors.card, justifyContent: "center", alignItems: "center" },
  name: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: "600" },
  empty: { color: Colors.textSecondary, textAlign: "center", paddingVertical: 24 },
});
