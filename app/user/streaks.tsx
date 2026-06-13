import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { useFocusEffect } from "@react-navigation/native";
import {
  StreaksTabSection,
  AchievementsTabSection,
  LeaderboardTabSection,
} from "../../components/feature-profile/streaks";
import type { ApiStreak, ApiAchievementsData, ApiLeaderboardData } from "../../components/feature-profile/streaks";
import { userService } from "../../services/userService";
import { getErrorMessage } from "../../lib/api";

type Tab = "streaks" | "achievements" | "leaderboard";

const TABS: Tab[] = ["streaks", "achievements", "leaderboard"];

export default function StreaksScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: Tab }>();
  const [activeTab, setActiveTab] = useState<Tab>(TABS.includes(tab as Tab) ? (tab as Tab) : "streaks");

  const [streaks, setStreaks] = useState<ApiStreak[]>([]);
  const [achievements, setAchievements] = useState<ApiAchievementsData | null>(null);
  const [leaderboard, setLeaderboard] = useState<ApiLeaderboardData | null>(null);

  const [loadingStreaks, setLoadingStreaks] = useState(false);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState<"all" | "friends">("all");

  const fetchAll = useCallback(async (refresh = false, mode: "all" | "friends" = "all") => {
    if (refresh) setRefreshing(true);
    setLoadingStreaks(true);
    setLoadingAchievements(true);
    setLoadingLeaderboard(true);

    const [streaksRes, achievementsRes, leaderboardRes] = await Promise.allSettled([
      userService.getStreaks(),
      userService.getAchievements(),
      userService.getLeaderboard(mode),
    ]);

    if (streaksRes.status === "fulfilled") {
      const d = streaksRes.value.data?.data ?? streaksRes.value.data;
      setStreaks(Array.isArray(d) ? d : []);
    } else {
      console.log("[Streaks] error:", getErrorMessage(streaksRes.reason));
    }

    if (achievementsRes.status === "fulfilled") {
      const d = achievementsRes.value.data?.data ?? achievementsRes.value.data;
      setAchievements(d);
    } else {
      console.log("[Achievements] error:", getErrorMessage(achievementsRes.reason));
    }

    if (leaderboardRes.status === "fulfilled") {
      const d = leaderboardRes.value.data?.data ?? leaderboardRes.value.data;
      setLeaderboard(d);
    } else {
      console.log("[Leaderboard] error:", getErrorMessage(leaderboardRes.reason));
    }

    setLoadingStreaks(false);
    setLoadingAchievements(false);
    setLoadingLeaderboard(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchAll(false, leaderboardMode); }, [fetchAll, leaderboardMode]));

  const handleLeaderboardMode = (mode: "all" | "friends") => {
    setLeaderboardMode(mode);
    setLoadingLeaderboard(true);
    userService.getLeaderboard(mode).then((res) => {
      const d = res.data?.data ?? res.data;
      setLeaderboard(d);
    }).catch(() => {}).finally(() => setLoadingLeaderboard(false));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>YOUR STREAKS</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={Colors.primary} />
        }
      >
        {activeTab === "streaks" && (
          <StreaksTabSection streaks={streaks} loading={loadingStreaks} />
        )}
        {activeTab === "achievements" && (
          <AchievementsTabSection data={achievements} loading={loadingAchievements} />
        )}
        {activeTab === "leaderboard" && (
          <>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeBtn, leaderboardMode === "all" && styles.modeBtnActive]}
                onPress={() => handleLeaderboardMode("all")}
              >
                <Text style={[styles.modeBtnText, leaderboardMode === "all" && styles.modeBtnTextActive]}>
                  All Users
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, leaderboardMode === "friends" && styles.modeBtnActive]}
                onPress={() => handleLeaderboardMode("friends")}
              >
                <Text style={[styles.modeBtnText, leaderboardMode === "friends" && styles.modeBtnTextActive]}>
                  Friends
                </Text>
              </TouchableOpacity>
            </View>
            <LeaderboardTabSection data={leaderboard} loading={loadingLeaderboard} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "800", letterSpacing: 0.5 },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 50,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "600" },
  tabBtnTextActive: { color: Colors.black },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },

  modeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 50,
    padding: 4,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 50,
    alignItems: "center",
  },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "600" },
  modeBtnTextActive: { color: Colors.black },
});
