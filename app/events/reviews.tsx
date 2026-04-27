import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReviewListCard } from "../../components/events";
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
          <ReviewListCard
            variant="reviewsList"
            avatarUri={item.avatar}
            name={item.name}
            time={item.time}
            rating={item.rating}
            text={item.text}
          />
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
});
