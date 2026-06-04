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
import { AvatarListItem } from "../../components/events";
import { eventService } from "../../services/eventService";
import { getErrorMessage } from "../../lib/api";
import { EmptyState } from "../../components/primitives";

type Friend = {
  id: number;
  name: string;
  avatar?: string | null;
  profile_picture?: string | null;
  status?: string;
  rating?: string;
};

export default function FriendsHereScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!eventId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await eventService.getFriends(eventId);
      const payload = res.data?.data ?? res.data;
      const results: Friend[] = payload?.friends ?? payload?.results ?? (Array.isArray(payload) ? payload : []);
      console.log("[FriendsHere] fetched:", payload);
      setFriends(results);
    } catch (e) {
      console.log("[FriendsHere] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchFriends(); }, [fetchFriends]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Friends here</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          ListEmptyComponent={
            <EmptyState icon="people-outline" title="No friends attending yet" subtitle="Invite your friends to join this event" />
          }
          renderItem={({ item }) => (
            <AvatarListItem
              avatarUri={item.avatar || item.profile_picture || undefined}
              title={item.name}
              rightSlot={
                item.rating ? (
                  <Text style={s.rating}>{item.rating}</Text>
                ) : undefined
              }
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
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: "700" },
  sep: { height: 1, backgroundColor: Colors.cardBorder, marginHorizontal: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  rating: { color: Colors.primary, fontSize: 13, fontWeight: "700" },
});
