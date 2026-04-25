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
const REVIEWS = [
  {
    id: "r1",
    name: "Mike Rodriguez",
    time: "1 week ago",
    rating: "9.2",
    text: "Great facilities, very clean. Would love more evening class options.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
  {
    id: "r2",
    name: "Sarah, Mike",
    time: "2 days ago",
    rating: "9.2",
    text: "Amazing instructors and peaceful atmosphere! The morning classes are perfect.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  },
  {
    id: "r3",
    name: "Mike Rodriguez",
    time: "1 week ago",
    rating: "9.2",
    text: "Great facilities, very clean. Would love more evening class options.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
  {
    id: "r4",
    name: "Sarah, Mike",
    time: "2 days ago",
    rating: "9.2",
    text: "Amazing instructors and peaceful atmosphere! The morning classes are perfect.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  },
];

export default function ReviewsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>REVIEWS</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={REVIEWS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTop}>
              <Image source={{ uri: item.avatar }} style={s.avatar} />
              <View style={s.info}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.time}>{item.time}</Text>
                <Text style={s.reviewText}>{item.text}</Text>
              </View>
              <View style={s.scoreBadge}>
                <Text style={s.scoreText}>{item.rating}</Text>
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
  headerTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  info: { flex: 1 },
  name: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  time: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  scoreBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreText: { color: Colors.black, fontSize: 13, fontWeight: "800" },
  reviewText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
