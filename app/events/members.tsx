import React, { useMemo, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";

const MEMBERS = [
  {
    id: "m1",
    name: "Shane Martinez",
    location: "San Francisco,CA",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80",
  },
  {
    id: "m2",
    name: "Katie Keller",
    location: "San Francisco,CA",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
  },
  {
    id: "m3",
    name: "Stephen Mann",
    location: "San Francisco,CA",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
  },
  {
    id: "m4",
    name: "Melvin Pratt",
    location: "San Francisco,CA",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80",
  },
];

export default function MembersScreen() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MEMBERS;
    return MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Members</Text>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => {
            setShowSearch((prev) => !prev);
            if (showSearch) setQuery("");
          }}
        >
          <Ionicons name="search-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search member"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      )}

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        renderItem={({ item }) => (
          <View style={s.row}>
            <Image source={{ uri: item.avatar }} style={s.avatar} />
            <View style={s.info}>
              <Text style={s.name}>{item.name}</Text>
              <View style={s.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={Colors.textSecondary}
                />
                <Text style={s.location}>{item.location}</Text>
              </View>
            </View>
          </View>
        )}
      />
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
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  headerTitle: { color: Colors.text, fontSize: 44 / 2, fontWeight: "700" },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    backgroundColor: Colors.card,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 10 },
  separator: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginLeft: 16,
    marginRight: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatar: { width: 58, height: 58, borderRadius: 29 },
  info: { flex: 1 },
  name: { color: Colors.text, fontSize: 21 * 1.0, fontWeight: "700" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  location: { color: Colors.textSecondary, fontSize: 20 / 1.2 },
});

