import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const FRIENDS = [
  {
    id: "f1",
    name: "Shane Martinez",
    time: "5 min",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
  },
  {
    id: "f2",
    name: "Katie Keller",
    time: "15 min",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  },
  {
    id: "f3",
    name: "Stephen Mann",
    time: "20 min",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
  {
    id: "f4",
    name: "Melvin Pratt",
    time: "1hour",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
  },
];

export default function FriendsHereScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Friends here</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={FRIENDS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        renderItem={({ item }) => (
          <View style={s.row}>
            <Image source={{ uri: item.avatar }} style={s.avatar} />
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.time}>{item.time}</Text>
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
  sep: { height: 1, backgroundColor: Colors.cardBorder, marginHorizontal: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  name: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: "600" },
  time: { color: Colors.textMuted, fontSize: 13 },
});
