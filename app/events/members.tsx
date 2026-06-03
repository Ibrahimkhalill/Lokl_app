import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../../constants/colors";
import { eventService } from "../../services/eventService";
import { getErrorMessage } from "../../lib/api";
import { EmptyState } from "../../components/primitives";
import LocationIcon from "../../assets/icons/locations.svg";
type Member = {
  id: number;
  name: string;
  username?: string | null;
  avatar?: string | null;
  role?: string | null;
  location?: string | null;
};

export default function MembersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const fetchMembers = useCallback(async (refresh = false) => {
    if (!groupId) return;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await eventService.getGroupMembers(groupId);
      const data = res.data?.data ?? res.data;
      const list: Member[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.members)
        ? data.members
        : [];
      setMembers(list);
    } catch (e) {
      console.log("[Members] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId]);

  useFocusEffect(useCallback(() => { fetchMembers(); }, [fetchMembers]));

  const filtered = members.filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.username ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Members</Text>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => { setShowSearch((p) => !p); setQuery(""); }}
        >
          <Ionicons name="search-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search member"
            placeholderTextColor={Colors.textSecondary}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={filtered.length === 0 ? s.centerContent : s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchMembers(true)} tintColor={Colors.primary} />}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          ListEmptyComponent={
            <EmptyState icon="people-outline" title="No members found" subtitle="No one has joined this group yet" />
          }
          renderItem={({ item }) => (
            <View style={s.memberRow}>
              <View style={s.avatarWrap}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, s.avatarPlaceholder]}>
                    <Ionicons name="person" size={22} color={Colors.textSecondary} />
                  </View>
                )}
              </View>
              <View style={s.memberInfo}>
                <Text style={s.memberName}>{item.name}</Text>
                {!!item.username && (
                  <Text style={s.memberHandle}>@{item.username}</Text>
                )}
                
                {!!item.location && (
                  <View style={s.locationContainer}>
                    <LocationIcon width={16} height={16} color={Colors.textSecondary} />
                    <Text style={s.memberLocation}>{item.location}</Text>
                  </View>
                )}  
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingBottom: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  memberLocation : { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
    backgroundColor: Colors.card,
  },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: "700" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    height: 46,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14 },

  separator: { height: 1, backgroundColor: Colors.cardBorder, marginHorizontal: 16 },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatarWrap: {},
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  memberInfo: { flex: 1 },
  memberName: { color: Colors.text, fontSize: 15, fontWeight: "700", marginBottom: 2 },
  memberHandle: { color: Colors.textSecondary, fontSize: 13 },
  memberRole: { color: Colors.primary, fontSize: 12, fontWeight: "600", marginTop: 2 },
});
