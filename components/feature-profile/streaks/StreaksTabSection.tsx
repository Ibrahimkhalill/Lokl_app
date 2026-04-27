import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/colors";
import FireIcon from "../../../assets/icons/fire.svg";
import TrophyIcon from "../../../assets/icons/best.svg";
import TimeIcon from "../../../assets/icons/current.svg";
import { STREAKS, WEEK_DAYS } from "./streaksData";

export function StreaksTabSection() {
  return (
    <>
      {STREAKS.map((streak) => (
        <View key={streak.id} style={styles.streakCard}>
          <View style={styles.streakHeader}>
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

          {streak.id === "s1" && (
            <>
              <View style={styles.divider} />

              <Text style={styles.calendarTitle}>Last 30 Days Activity</Text>

              <View style={styles.calendarHeader}>
                {WEEK_DAYS.map((d) => (
                  <Text key={d} style={styles.calendarDay}>
                    {d}
                  </Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {Array(30)
                  .fill(null)
                  .map((_, i) => {
                    const dayNum = i + 1;
                    const isLimeActive = i >= 28 && i <= 34;
                    const isToday = i === 29;

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

              <View style={styles.calSummary}>
                <View style={styles.calSumItem}>
                  <Text style={[styles.calSumNum, { color: Colors.primary }]}>
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

              <LinearGradient
                colors={["#D1FF00", "#A8CC00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.currentStreakBanner}
              >
                <View style={styles.currentStreakHeader}>
                  <FireIcon width={17} height={17} color={Colors.black} />
                  <Text style={styles.currentStreakLabel}>Current Streak</Text>
                  <Text style={styles.currentStreakDays}>7 days</Text>
                </View>
                <Text style={styles.currentStreakMsg}>
                  Keep going! You&apos;re 7 days away from your goal.
                </Text>
              </LinearGradient>
            </>
          )}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
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
});
