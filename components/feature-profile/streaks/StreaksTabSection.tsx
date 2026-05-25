import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/colors";
import FireIcon from "../../../assets/icons/fire.svg";
import TrophyIcon from "../../../assets/icons/best.svg";
import TimeIcon from "../../../assets/icons/current.svg";
import ActivityIcon from "../../../assets/icons/activity.svg";
import ExploreStreaksIcon from "../../../assets/icons/explore_streaks.svg";
import NeighboIcon from "../../../assets/icons/neighbo.svg";
import StarIcon from "../../../assets/icons/star.svg";
import { WEEK_DAYS } from "./streaksData";

export type ApiStreak = {
  id: number;
  streak_type: string;
  label: string;
  current: number;
  best: number;
  goal: number;
  fire_score: number;
  last_active_label: string;
  progress_pct: number;
  calendar_days: { date: string; day_num: number; active: boolean }[];
  stats: { completed: number; missed: number; success_rate: number };
  streak_message: string;
};

const STREAK_ICON_MAP: Record<string, { icon: React.ReactNode; gradient: readonly [string, string] }> = {
  activity: {
    icon: <ActivityIcon width={24} height={24} />,
    gradient: ["#FF00D4", "#CC00A8"] as const,
  },
  explore: {
    icon: <ExploreStreaksIcon width={24} height={24} />,
    gradient: ["#00CED1", "#009EA0"] as const,
  },
  neighbo: {
    icon: <NeighboIcon width={24} height={24} />,
    gradient: ["#00FFD1", "#00BFA5"] as const,
  },
  lokl: {
    icon: <StarIcon width={24} height={24} />,
    gradient: ["#FFD700", "#FFA500"] as const,
  },
  category: {
    icon: <Ionicons name="grid-outline" size={22} color="#fff" />,
    gradient: ["#7B61FF", "#4A00E0"] as const,
  },
};

function getStreakMeta(type: string) {
  return STREAK_ICON_MAP[type] ?? {
    icon: <Ionicons name="flame-outline" size={22} color="#fff" />,
    gradient: ["#FF6900", "#CC4400"] as const,
  };
}

export function StreaksTabSection({
  streaks,
  loading,
}: {
  streaks: ApiStreak[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!streaks.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No streaks yet</Text>
      </View>
    );
  }

  return (
    <>
      {streaks.map((streak, index) => {
        const meta = getStreakMeta(streak.streak_type);
        const isFirst = index === 0;
        return (
          <View key={streak.id} style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <LinearGradient
                colors={meta.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.streakIconWrap}
              >
                {meta.icon}
              </LinearGradient>

              <View style={styles.streakTitleWrap}>
                <Text style={styles.streakTitle}>{streak.label.toUpperCase()}</Text>
                <Text style={styles.streakSub}>{streak.last_active_label}</Text>
              </View>

              <View style={styles.streakDayBadge}>
                <FireIcon width={14} height={14} color={meta.gradient[0]} />
                <Text style={styles.streakDayNum}>{String(streak.fire_score).padStart(2, "0")}</Text>
              </View>
            </View>

            <View style={styles.streakProgressRow}>
              <Text style={styles.streakProgressLabel}>Progress to goal</Text>
              <Text style={styles.streakProgressVal}>
                {String(streak.current).padStart(2, "0")}/{streak.goal} days
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${streak.progress_pct}%` }]} />
            </View>

            <View style={styles.streakStats}>
              <View style={styles.streakStatItem}>
                <View style={styles.streakStatLabelRow}>
                  <TimeIcon width={13} height={13} color={Colors.textSecondary} />
                  <Text style={styles.streakStatLabel}>Current</Text>
                </View>
                <Text style={styles.streakStatNum}>{String(streak.current).padStart(2, "0")}</Text>
              </View>
              <View style={styles.streakStatItem}>
                <View style={styles.streakStatLabelRow}>
                  <TrophyIcon width={13} height={13} color={Colors.textSecondary} />
                  <Text style={styles.streakStatLabel}>Best</Text>
                </View>
                <Text style={styles.streakStatNum}>{String(streak.best).padStart(2, "0")}</Text>
              </View>
            </View>

            {isFirst && streak.calendar_days.length > 0 && (
              <>
                <View style={styles.divider} />
                <Text style={styles.calendarTitle}>Last 30 Days Activity</Text>

                <View style={styles.calendarHeader}>
                  {WEEK_DAYS.map((d) => (
                    <Text key={d} style={styles.calendarDay}>{d}</Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {streak.calendar_days.map((day, i) => (
                    <View key={i} style={styles.calCellWrap}>
                      {day.active ? (
                        <LinearGradient
                          colors={["#D1FF00", "#A8CC00"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={[styles.calCell, styles.calCellActive]}
                        >
                          <Text style={styles.calCellTextActive}>{day.day_num}</Text>
                          <Ionicons name="flame-outline" size={9} color="#FF6900" style={styles.calFlame} />
                        </LinearGradient>
                      ) : (
                        <View style={styles.calCell}>
                          <Text style={styles.calCellText}>{day.day_num}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                <View style={styles.calSummary}>
                  <View style={styles.calSumItem}>
                    <Text style={[styles.calSumNum, { color: Colors.primary }]}>{streak.stats.completed}</Text>
                    <Text style={styles.calSumLabel}>Completed</Text>
                  </View>
                  <View style={styles.calSumItem}>
                    <Text style={styles.calSumNum}>{streak.stats.missed}</Text>
                    <Text style={styles.calSumLabel}>Missed</Text>
                  </View>
                  <View style={styles.calSumItem}>
                    <Text style={styles.calSumNum}>{streak.stats.success_rate.toFixed(1)}%</Text>
                    <Text style={styles.calSumLabel}>Success Rate</Text>
                  </View>
                </View>

                <LinearGradient
                  colors={["#D1FF00", "#A8CC00"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.currentStreakBanner}
                >
                  <View style={styles.currentStreakHeader}>
                    <FireIcon width={17} height={17} color={Colors.black} />
                    <Text style={styles.currentStreakLabel}>Current Streak</Text>
                    <Text style={styles.currentStreakDays}>{streak.current} days</Text>
                  </View>
                  <Text style={styles.currentStreakMsg}>{streak.streak_message}</Text>
                </LinearGradient>
              </>
            )}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: 60, alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  streakCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  streakHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
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
  streakProgressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  streakProgressLabel: { color: "#99A0AE", fontSize: 12 },
  streakProgressVal: { color: Colors.text, fontSize: 12, fontWeight: "600" },
  progressTrack: {
    height: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 16 },
  streakStats: { flexDirection: "row", gap: 12 },
  streakStatItem: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  streakStatLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  streakStatLabel: { color: "#99A0AE", fontSize: 12 },
  streakStatNum: { color: Colors.text, fontSize: 22, fontWeight: "800" },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 16 },
  calendarTitle: { color: Colors.text, fontSize: 14, fontWeight: "700", marginBottom: 12 },
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
  calCellText: { color: "#4B556A", fontSize: 12, fontWeight: "500" },
  calCellTextActive: { color: "#141516", fontSize: 12, fontWeight: "700" },
  calFlame: { position: "absolute", bottom: 1, right: 1 },
  calSummary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
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
  currentStreakHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  currentStreakLabel: { flex: 1, color: "#141516", fontSize: 13, fontWeight: "700" },
  currentStreakDays: { color: "#141516", fontSize: 16, fontWeight: "800" },
  currentStreakMsg: { color: "#2F3030", fontSize: 12 },
});
