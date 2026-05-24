import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReviewListCard } from "../../components/events";
import { eventService } from "../../services/eventService";
import { getErrorMessage } from "../../lib/api";

type Review = {
  id: number;
  user_name: string;
  user_avatar: string | null;
  rating: number | string;
  comment: string;
  image_url: string | null;
  created_at: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export default function ReviewsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(async (refresh = false) => {
    if (!eventId) { setLoading(false); return; }
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await eventService.getReviews(eventId);
      const payload = res.data?.data ?? res.data;
      const results: Review[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      setReviews(results);
    } catch (e) {
      console.log("[Reviews] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>REVIEWS</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={reviews.length === 0 ? s.centerContent : s.list}
          showsVerticalScrollIndicator={false}
          onRefresh={() => fetchReviews(true)}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyText}>No reviews yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ReviewListCard
              variant="reviewsList"
              avatarUri={item.user_avatar ?? ""}
              name={item.user_name}
              time={timeAgo(item.created_at)}
              rating={String(item.rating)}
              text={item.comment}
              imageUri={item.image_url}
            />
          )}
        />
      )}
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
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },
  list: { padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});
