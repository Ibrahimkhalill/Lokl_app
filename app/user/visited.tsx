import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { api, getErrorMessage } from "../../lib/api";
import { userService } from "../../services/userService";
import { EmptyState } from "../../components/primitives";

type Row = {
  id: number;
  name: string;
  type?: string;
  neighborhood?: string;
  cover?: string | null;
  score_display?: string;
  user_rating?: number | null;
  visited_at?: string;
};

/** Everywhere a person has been, with a toggle for the venues they saved ("Want to Try"). */
export default function VisitedScreen() {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id?: string }>();
  const [tab, setTab] = useState<"visited" | "want">("visited");
  const [visited, setVisited] = useState<Row[]>([]);
  const [saved, setSaved] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/venues/visited/", { params: user_id ? { user_id } : {} });
      const d = res.data?.data ?? res.data;
      setVisited(d?.results ?? []);
      const profile = user_id ? await userService.getUserProfile(Number(user_id)) : await userService.getMe();
      const p = profile.data?.data ?? profile.data;
      setSaved(p?.saved_venues ?? []);
    } catch (e) {
      console.log("[Visited] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const data = tab === "visited" ? visited : saved;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>{tab === "visited" ? "Visited" : "Want to Try"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === "visited" && s.tabOn]} onPress={() => setTab("visited")}>
          <Text style={[s.tabText, tab === "visited" && s.tabTextOn]}>Visited ({visited.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === "want" && s.tabOn]} onPress={() => setTab("want")}>
          <Text style={[s.tabText, tab === "want" && s.tabTextOn]}>Want to Try ({saved.length})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          keyboardDismissMode="on-drag"
          data={data}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 16 }}
          ListEmptyComponent={
            <EmptyState
              icon={tab === "visited" ? "location-outline" : "bookmark-outline"}
              title={tab === "visited" ? "No places visited yet" : "No saved venues yet"}
              subtitle={tab === "visited" ? "Rank a venue and it shows up here" : "Tap the bookmark on a venue to add it here"}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.row} activeOpacity={0.85} onPress={() => router.push(`/home/details?id=${item.id}` as never)}>
              {item.cover ? (
                <Image source={{ uri: item.cover }} style={s.thumb} />
              ) : (
                <View style={[s.thumb, s.thumbEmpty]}>
                  <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                <Text style={s.meta} numberOfLines={1}>{[item.type, item.neighborhood].filter(Boolean).join(" · ")}</Text>
              </View>
              {tab === "visited" && item.user_rating != null ? (
                <View style={s.score}><Text style={s.scoreText}>{Number(item.user_rating).toFixed(1)}</Text></View>
              ) : !!item.score_display ? (
                <View style={s.score}><Text style={s.scoreText}>{item.score_display}</Text></View>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.cardBorder, justifyContent: "center", alignItems: "center" },
  title: { color: Colors.text, fontSize: 17, fontWeight: "800" },
  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.cardBorder },
  tabOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "600" },
  tabTextOn: { color: Colors.black, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  thumbEmpty: { backgroundColor: Colors.inputBg, justifyContent: "center", alignItems: "center" },
  name: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  score: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  scoreText: { color: Colors.black, fontSize: 12, fontWeight: "800" },
});
