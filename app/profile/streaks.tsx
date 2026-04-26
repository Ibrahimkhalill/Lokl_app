import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";

import FireIcon from "../../assets/icons/fire.svg";
import TrophyIcon from "../../assets/icons/best.svg";
import TimeIcon from "../../assets/icons/current.svg";
import LoackIcon from "../../assets/icons/loack.svg";
import NeighboIcon from "../../assets/icons/neighbo.svg";
import ExploreStreaksIcon from "../../assets/icons/explore_streaks.svg";
import ActivityIcon from "../../assets/icons/activity.svg";
import StarIcon from "../../assets/icons/star.svg";
import DiscoveryIcon from "../../assets/icons/discovery.svg";
import CameraIcon from "../../assets/icons/camera.svg";
import QueenIcon from "../../assets/icons/king.svg";

type Tab = "streaks" | "achievements" | "leaderboard";

const STREAKS = [
  {
    id: "s1",
    icon: <ActivityIcon width={24} height={24} />,
    title: "ACTIVITY STREAK",
    subtitle: "Last: 1 day ago",
    iconGradient: ["#FF00D4", "#CC00A8"] as const,
    current: 7,
    best: 14,
    goal: 14,
    days: 14,
  },
  {
    id: "s2",
    icon: <ExploreStreaksIcon width={24} height={24} />,
    title: "EXPLORE STREAK",
    subtitle: "Last: 2 hours ago",
    iconGradient: ["#00CED1", "#009EA0"] as const,
    current: 12,
    best: 12,
    goal: 30,
    days: 12,
  },
  {
    id: "s3",
    icon: <ActivityIcon width={24} height={24} />,
    title: "ACTIVITY STREAK",
    subtitle: "Last: 2 hours ago",
    iconGradient: ["#FF00D4", "#CC00A8"] as const,
    current: 12,
    best: 12,
    goal: 30,
    days: 12,
  },
  {
    id: "s4",
    icon: <StarIcon width={24} height={24} />,
    title: "LOKL STREAK",
    subtitle: "Last: 2 hours ago",
    iconGradient: ["#FFD700", "#FFA500"] as const,
    current: 6,
    best: 9,
    goal: 10,
    days: 6,
  },
  {
    id: "s6",
    icon: <NeighboIcon width={24} height={24} />,
    title: "NEIGHBO STREAK",
    subtitle: "Last: 1 week goal",
    iconGradient: ["#00FFD1", "#00FFD1"] as const,
    current: 5,
    best: 7,
    goal: 8,
    days: 5,
  },
];

const ACHIEVEMENTS = [
  {
    id: "a1",
    title: "Content Creator",
    desc: "Posted your first photo or video at a venue",
    rarity: "Rare",
    locked: false,
    icon: <FireIcon width={24} height={24} color={Colors.text} />,
    bgColor: "rgba(21, 93, 252, 1)",
  },
  {
    id: "a2",
    title: "First Discovery",
    desc: "visited your first new venue through LOKL",
    rarity: "Common",
    locked: false,
    icon: <DiscoveryIcon width={24} height={24} color={Colors.text} />,
    bgColor: "rgba(74, 85, 101, 1)",
  },
  {
    id: "a3",
    title: "First Lokl",
    desc: "Left your first review with a score",
    rarity: "Common",
    locked: false,
    icon: <StarIcon width={24} height={24} color={Colors.text} />,
    bgColor: "rgba(74, 85, 101, 1)",
  },
  {
    id: "a4",
    title: "Content Creator",
    desc: "posted your first photo or video at a venue",
    rarity: "Common",
    locked: false,
    icon: <CameraIcon width={24} height={24} color={Colors.text} />,
    bgColor: "rgba(74, 85, 101, 1)",
  },
  {
    id: "a5",
    title: "Social Butterfly",
    desc: "Followed your first 5 users on LOKL",
    rarity: "Common",
    locked: true,
    progress: 3,
    total: 5,
  },
  {
    id: "a6",
    title: "Explore",
    desc: "Discovered 10 new venues across NYC",
    rarity: "Rare",
    locked: true,
    progress: 7,
    total: 10,
  },
  {
    id: "a7",
    title: "Brought Hopper",
    desc: "Visited venues in 3 different boroughs",
    rarity: "Rare",
    locked: true,
    progress: 2,
    total: 3,
  },
  {
    id: "a8",
    title: "Multi-Sport",
    desc: "Checked in at 5 different activity categories",
    rarity: "Rare",
    locked: true,
    progress: 3,
    total: 5,
  },
  {
    id: "a9",
    title: "Week Warrior",
    desc: "Maintained any streak for 4 consecutive weeks",
    rarity: "Rare",
    locked: true,
    progress: 2,
    total: 4,
  },
  {
    id: "a10",
    title: "NYC Lokl",
    desc: "Visited venues in all 5 NYC boroughs",
    rarity: "Ultra",
    locked: true,
    progress: 2,
    total: 4,
  },
  {
    id: "a11",
    title: "Century Club",
    desc: "Discovered 100 different venues",
    rarity: "Ultra",
    locked: true,
    progress: 47,
    total: 100,
  },
  {
    id: "a12",
    title: "Top Reviewer",
    desc: "Left 50 scored reviews across the city",
    rarity: "Ultra",
    locked: true,
    progress: 28,
    total: 50,
  },
];

const LEADERBOARD = [
  {
    id: "l1",
    rank: 1,
    name: "Sarah Johnson",
    score: 55,
    days: "89 Locations visited",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    id: "l2",
    rank: 2,
    name: "Mike Chen",
    score: 45,
    days: "76 days",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
  },
  {
    id: "l3",
    rank: 3,
    name: "Emma Davis",
    score: 20,
    days: "65 days",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  },
  {
    id: "l4",
    rank: 4,
    name: "Mike Chen",
    score: 15,
    days: "50 days",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
  },
];

const RARITY_COLORS: Record<string, string> = {
  Rare: "#4A90E2",
  Common: "#666",
  Ultra: "#9B59B6",
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Active days from Figma: days 3,4,5,6,7 in last row = indices 30-34 area
// Calendar shows 5 weeks, active = last 7 days ending today (index 30 = day 1, 36 = today)
const ACTIVE_DAYS = [30, 31];
const TODAY_INDEX = 36;

export default function StreaksScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("streaks");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>YOUR STREAKS</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(["streaks", "achievements", "leaderboard"] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === tab && styles.tabBtnTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── STREAKS ── */}
        {activeTab === "streaks" &&
          STREAKS.map((streak) => (
            <View key={streak.id} style={styles.streakCard}>
              {/* Header Row */}
              <View style={styles.streakHeader}>
                {/* Gradient Icon */}
                <LinearGradient
                  colors={streak.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.streakIconWrap}
                >
                  {streak.icon}
                </LinearGradient>

                <View style={styles.streakTitleWrap}>
                  <Text style={styles.streakTitle}>{streak.title}</Text>
                  <Text style={styles.streakSub}>{streak.subtitle}</Text>
                </View>

                <View style={styles.streakDayBadge}>
                  <FireIcon
                    width={14}
                    height={14}
                    color={streak.iconGradient[0]}
                  />
                  <Text style={styles.streakDayNum}>
                    {String(streak.days).padStart(2, "0")}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <View style={styles.streakProgressRow}>
                <Text style={styles.streakProgressLabel}>Progress to goal</Text>
                <Text style={styles.streakProgressVal}>
                  {String(streak.current).padStart(2, "0")}/{streak.goal} days
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(streak.current / streak.goal) * 100}%` },
                  ]}
                />
              </View>

              {/* Current / Best */}
              <View style={styles.streakStats}>
                <View style={styles.streakStatItem}>
                  <View style={styles.streakStatLabelRow}>
                    <TimeIcon
                      width={13}
                      height={13}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.streakStatLabel}>Current</Text>
                  </View>
                  <Text style={styles.streakStatNum}>
                    {String(streak.current).padStart(2, "0")}
                  </Text>
                </View>
                <View style={styles.streakStatItem}>
                  <View style={styles.streakStatLabelRow}>
                    <TrophyIcon
                      width={13}
                      height={13}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.streakStatLabel}>Best</Text>
                  </View>
                  <Text style={styles.streakStatNum}>
                    {String(streak.best).padStart(2, "0")}
                  </Text>
                </View>
              </View>

              {/* Calendar only for first streak */}
              {streak.id === "s1" && (
                <>
                  <View style={styles.divider} />

                  <Text style={styles.calendarTitle}>
                    Last 30 Days Activity
                  </Text>

                  {/* Day headers */}
                  <View style={styles.calendarHeader}>
                    {WEEK_DAYS.map((d) => (
                      <Text key={d} style={styles.calendarDay}>
                        {d}
                      </Text>
                    ))}
                  </View>

                  {/* Calendar grid - 5 rows x 7 cols */}
                  <View style={styles.calendarGrid}>
                    {Array(30)
                      .fill(null)
                      .map((_, i) => {
                        const dayNum = i + 1;
                        const isActive =
                          [3, 4, 5, 6, 7, 8, 9].includes(dayNum) || // week 1 active
                          [
                            i === 29,
                            i === 30,
                            i === 31,
                            i === 32,
                            i === 33,
                          ].some(Boolean);
                        // From Figma: last row days 1-7 (indices 28-34) with lime gradient
                        const isLimeActive = i >= 28 && i <= 34;
                        const isToday = i === 29; // day "9" in Figma has special ring

                        return (
                          <View key={i} style={styles.calCellWrap}>
                            {isLimeActive ? (
                              <LinearGradient
                                colors={["#D1FF00", "#A8CC00"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={[styles.calCell, styles.calCellActive]}
                              >
                                <Text style={styles.calCellTextActive}>
                                  {dayNum}
                                </Text>
                                {i === 29 && (
                                  <View style={styles.calCellDot}>
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={10}
                                      color="#141516"
                                    />
                                  </View>
                                )}
                                <Ionicons
                                  name="flame-outline"
                                  size={9}
                                  color="#FF6900"
                                  style={styles.calFlame}
                                />
                              </LinearGradient>
                            ) : (
                              <View
                                style={[
                                  styles.calCell,
                                  isToday && styles.calCellToday,
                                ]}
                              >
                                <Text style={styles.calCellText}>
                                  {dayNum <= 28 ? dayNum : ""}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                  </View>

                  {/* Summary */}
                  <View style={styles.calSummary}>
                    <View style={styles.calSumItem}>
                      <Text
                        style={[styles.calSumNum, { color: Colors.primary }]}
                      >
                        7
                      </Text>
                      <Text style={styles.calSumLabel}>Completed</Text>
                    </View>
                    <View style={styles.calSumItem}>
                      <Text style={styles.calSumNum}>23</Text>
                      <Text style={styles.calSumLabel}>Missed</Text>
                    </View>
                    <View style={styles.calSumItem}>
                      <Text style={styles.calSumNum}>23%</Text>
                      <Text style={styles.calSumLabel}>Success Rate</Text>
                    </View>
                  </View>

                  {/* Current Streak Banner - lime gradient */}
                  <LinearGradient
                    colors={["#D1FF00", "#A8CC00"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.currentStreakBanner}
                  >
                    <View style={styles.currentStreakHeader}>
                      <FireIcon width={17} height={17} color={Colors.black} />
                      <Text style={styles.currentStreakLabel}>
                        Current Streak
                      </Text>
                      <Text style={styles.currentStreakDays}>7 days</Text>
                    </View>
                    <Text style={styles.currentStreakMsg}>
                      Keep going! You're 7 days away from your goal.
                    </Text>
                  </LinearGradient>
                </>
              )}
            </View>
          ))}

        {/* ── ACHIEVEMENTS ── */}
        {activeTab === "achievements" && (
          <>
            <View style={styles.achStats}>
              <View style={styles.achStat}>
                <Text style={styles.achStatNum}>8</Text>
                <Text style={styles.achStatLabel}>Unlocked</Text>
              </View>
              <View style={styles.achStat}>
                <Text style={styles.achStatNum}>12</Text>
                <Text style={styles.achStatLabel}>Total</Text>
              </View>
              <View style={styles.achStat}>
                <Text style={[styles.achStatNum, { color: Colors.primary }]}>
                  10%
                </Text>
                <Text style={styles.achStatLabel}>Complete</Text>
              </View>
            </View>

            {ACHIEVEMENTS.map((ach) => (
              <View key={ach.id} style={styles.achCard}>
                <View
                  style={[
                    styles.achIconWrap,
                    ach.locked && styles.achIconLocked,
                    !ach.locked && { backgroundColor: ach.bgColor },
                  ]}
                >
                  {ach.locked ? (
                    <LoackIcon
                      width={22}
                      height={22}
                      color={Colors.textMuted}
                    />
                  ) : (
                    <Text style={styles.achIcon}>{ach.icon}</Text>
                  )}
                </View>
                <View style={styles.achInfo}>
                  <View style={styles.achTitleRow}>
                    <Text style={styles.achTitle}>{ach.title}</Text>
                    <View
                      style={[
                        styles.rarityBadge,
                        { backgroundColor: RARITY_COLORS[ach.rarity] + "33" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rarityText,
                          { color: RARITY_COLORS[ach.rarity] },
                        ]}
                      >
                        {ach.rarity}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.achDesc}>{ach.desc}</Text>
                  {ach.locked && ach.progress !== undefined && (
                    <View style={styles.achProgressWrap}>
                      <View style={styles.achProgressRow}>
                        <Text style={styles.achProgressLabel}>Progress</Text>
                        <Text style={styles.achProgressVal}>
                          {ach.progress}/{ach.total}
                        </Text>
                      </View>
                      <View style={styles.achTrack}>
                        <View
                          style={[
                            styles.achFill,
                            {
                              width: `${(ach.progress! / ach.total!) * 100}%`,
                              backgroundColor: RARITY_COLORS[ach.rarity],
                            },
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── LEADERBOARD ── */}
        {activeTab === "leaderboard" && (
          <>
            <Text style={styles.legendTitle}>LOKL LEGENDS</Text>
            <View style={styles.podium}>
              <View style={styles.podiumItem}>
                <View style={styles.podiumRank2}>
                  <Text style={styles.podiumRankText}>2</Text>
                </View>
                <Image
                  source={{ uri: LEADERBOARD[1].avatar }}
                  style={styles.podiumAvatar}
                />
                <Text style={styles.podiumName}>{LEADERBOARD[1].name}</Text>
                <Text style={styles.podiumDays}>76 days</Text>
              </View>
              <View style={[styles.podiumItem, styles.podiumFirst]}>
                <QueenIcon
                  width={22}
                  height={22}
                  color={Colors.primary}
                  style={styles.podiumFirstIcon}
                />
                <View style={styles.podiumRank1}>
                  <Text style={styles.podiumFirstRankText}>1</Text>
                </View>
                <Image
                  source={{ uri: LEADERBOARD[0].avatar }}
                  style={[styles.podiumAvatar, styles.podiumAvatarFirst]}
                />
                <Text style={styles.podiumName}>{LEADERBOARD[0].name}</Text>
                <Text style={[styles.podiumDays, { color: Colors.primary }]}>
                  {LEADERBOARD[0].days}
                </Text>
              </View>
              <View style={styles.podiumItem}>
                <View style={styles.podiumRank3}>
                  <Text style={styles.podiumRankText}>3</Text>
                </View>
                <Image
                  source={{ uri: LEADERBOARD[2].avatar }}
                  style={styles.podiumAvatar}
                />
                <Text style={styles.podiumName}>Emma Davis</Text>
                <Text style={styles.podiumDays}>65 days</Text>
              </View>
            </View>

            {LEADERBOARD.map((entry) => (
              <View key={entry.id} style={styles.leaderRow}>
                <View
                  style={[
                    styles.rankBadge,
                    entry.rank === 1 && styles.rankBadge1,
                    entry.rank === 2 && styles.rankBadge2,
                    entry.rank === 3 && styles.rankBadge3,
                  ]}
                >
                  <Text
                    style={[
                      styles.rankText,
                      entry.rank > 3 && { color: Colors.text },
                    ]}
                  >
                    {entry.rank}
                  </Text>
                </View>
                <Image
                  source={{ uri: entry.avatar }}
                  style={styles.leaderAvatar}
                />
                <Text style={styles.leaderName}>{entry.name}</Text>
                <View style={styles.leaderScore}>
                  <FireIcon
                    width={16}
                    height={16}
                    color={"rgba(255, 105, 0, 1)"}
                  />
                  <Text style={styles.leaderScoreNum}>{entry.score}</Text>
                </View>
              </View>
            ))}
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
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 50,
    justifyContent: "space-between",
  },
  tabBtn: {
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "600" },
  tabBtnTextActive: { color: Colors.black },

  scroll: { paddingHorizontal: 16, paddingBottom: 100 },

  // ── Streak Card ──
  streakCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  streakIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  streakTitleWrap: { flex: 1 },
  streakTitle: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  streakSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  streakDayBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  streakDayNum: { color: "#fff", fontSize: 18, fontWeight: "800" },

  streakProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  streakProgressLabel: { color: "#99A0AE", fontSize: 12 },
  streakProgressVal: { color: Colors.text, fontSize: 12, fontWeight: "600" },

  progressTrack: {
    height: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },

  streakStats: { flexDirection: "row", gap: 12 },
  streakStatItem: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  streakStatLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  streakStatLabel: { color: "#99A0AE", fontSize: 12 },
  streakStatNum: { color: Colors.text, fontSize: 22, fontWeight: "800" },

  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 16,
  },

  // ── Calendar ──
  calendarTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  calendarHeader: { flexDirection: "row", marginBottom: 8 },
  calendarDay: { flex: 1, color: "#6A7185", fontSize: 11, textAlign: "center" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  calCellWrap: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  calCell: {
    flex: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
  },
  calCellActive: {},
  calCellToday: { borderWidth: 2, borderColor: Colors.primary },
  calCellText: { color: "#4B556A", fontSize: 12, fontWeight: "500" },
  calCellTextActive: { color: "#141516", fontSize: 12, fontWeight: "700" },
  calCellDot: { position: "absolute", bottom: 2, right: 2 },
  calFlame: { position: "absolute", bottom: 1, right: 1 },

  calSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  calSumItem: {},
  calSumNum: { color: Colors.text, fontSize: 20, fontWeight: "800" },
  calSumLabel: { color: "#99A0AE", fontSize: 12, marginTop: 2 },

  currentStreakBanner: {
    flexDirection: "column",
    gap: 10,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  currentStreakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currentStreakLabel: {
    flex: 1,
    color: "#141516",
    fontSize: 13,
    fontWeight: "700",
  },
  currentStreakDays: { color: "#141516", fontSize: 16, fontWeight: "800" },
  currentStreakMsg: { color: "#2F3030", fontSize: 12, textAlign: "center" },

  // ── Achievements ──
  achStats: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    justifyContent: "space-around",
    marginBottom: 16,
  },
  achStat: { alignItems: "center" },
  achStatNum: { color: Colors.text, fontSize: 22, fontWeight: "800" },
  achStatLabel: { color: Colors.textSecondary, fontSize: 12 },
  achCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  achIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#4A90E233",
    justifyContent: "center",
    alignItems: "center",
  },
  achIconLocked: {
    backgroundColor: Colors.cardBorder,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.cardBorder,
  },
  achIcon: { fontSize: 22 },
  achInfo: { flex: 1 },
  achTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  achTitle: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  rarityBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  rarityText: { fontSize: 11, fontWeight: "600" },
  achDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  achProgressWrap: {},
  achProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  achProgressLabel: { color: Colors.textSecondary, fontSize: 11 },
  achProgressVal: { color: Colors.textSecondary, fontSize: 11 },
  achTrack: { height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2 },
  achFill: { height: "100%", borderRadius: 2 },

  // ── Leaderboard ──
  legendTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  podiumItem: { alignItems: "center", gap: 6 },
  podiumFirst: { marginBottom: 0 },
  crown: { fontSize: 2 },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
  },
  podiumAvatarFirst: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  podiumName: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  podiumDays: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
  },
  podiumRank1: {
    position: "absolute",
    bottom: 37,
    zIndex: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  podiumRank2: {
    position: "absolute",
    bottom: 37,
    zIndex: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#9B9B9B",
    justifyContent: "center",
    alignItems: "center",
  },
  podiumRank3: {
    position: "absolute",
    bottom: 37,
    zIndex: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
  podiumRankText: {
    color: Colors.white,
    fontSize: 11,
  },
  podiumFirstRankText: {
    color: Colors.black,
    fontSize: 12,
  },
  podiumFirstIcon: {
    position: "absolute",
    top: -12,
    zIndex: 1,
    width: 22,
    height: 22,
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  rankBadge1: { backgroundColor: Colors.primary },
  rankBadge2: { backgroundColor: "#9B9B9B" },
  rankBadge3: { backgroundColor: "#FF6B35" },
  rankText: { color: Colors.black, fontSize: 13, fontWeight: "800" },
  leaderAvatar: { width: 46, height: 46, borderRadius: 23 },
  leaderName: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: "600" },
  leaderScore: { flexDirection: "row", alignItems: "center", gap: 6 },
  leaderScoreNum: { color: Colors.text, fontSize: 18, fontWeight: "800" },
});
