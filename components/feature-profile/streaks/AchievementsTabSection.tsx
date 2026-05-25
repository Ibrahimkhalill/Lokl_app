import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/colors";
import LoackIcon from "../../../assets/icons/loack.svg";

export type ApiAchievement = {
  id: number;
  title: string;
  description: string;
  rarity: string;
  category: string;
  icon: string;
  key: string;
  progress: number;
  goal: number;
  progress_pct: number;
  unlocked: boolean;
  unlocked_at: string | null;
};

export type ApiAchievementsData = {
  unlocked: number;
  total: number;
  complete_pct: number;
  achievements: ApiAchievement[];
};

const RARITY_COLORS: Record<string, string> = {
  common: "#888",
  rare: "#4A90E2",
  epic: "#9B59B6",
  legend: "#FFD700",
};

const RARITY_BG: Record<string, string> = {
  common: "#44444433",
  rare: "#4A90E233",
  epic: "#9B59B633",
  legend: "#FFD70033",
};

export function AchievementsTabSection({
  data,
  loading,
}: {
  data: ApiAchievementsData | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No achievements yet</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.achStats}>
        <View style={styles.achStat}>
          <Text style={styles.achStatNum}>{data.unlocked}</Text>
          <Text style={styles.achStatLabel}>Unlocked</Text>
        </View>
        <View style={styles.achStat}>
          <Text style={styles.achStatNum}>{data.total}</Text>
          <Text style={styles.achStatLabel}>Total</Text>
        </View>
        <View style={styles.achStat}>
          <Text style={[styles.achStatNum, { color: Colors.primary }]}>{data.complete_pct.toFixed(1)}%</Text>
          <Text style={styles.achStatLabel}>Complete</Text>
        </View>
      </View>

      {data.achievements.map((ach) => {
        const rarityColor = RARITY_COLORS[ach.rarity] ?? "#888";
        const rarityBg = RARITY_BG[ach.rarity] ?? "#44444433";
        return (
          <View key={ach.id} style={styles.achCard}>
            <View style={[styles.achIconWrap, ach.unlocked ? { backgroundColor: rarityBg } : styles.achIconLocked]}>
              {ach.unlocked ? (
                <Ionicons name={ach.icon as any} size={22} color={rarityColor} />
              ) : (
                <LoackIcon width={22} height={22} color={Colors.textMuted} />
              )}
            </View>
            <View style={styles.achInfo}>
              <View style={styles.achTitleRow}>
                <Text style={styles.achTitle}>{ach.title}</Text>
                <View style={[styles.rarityBadge, { backgroundColor: rarityBg }]}>
                  <Text style={[styles.rarityText, { color: rarityColor }]}>{ach.rarity}</Text>
                </View>
              </View>
              <Text style={styles.achDesc}>{ach.description}</Text>
              {!ach.unlocked && (
                <View style={styles.achProgressWrap}>
                  <View style={styles.achProgressRow}>
                    <Text style={styles.achProgressLabel}>Progress</Text>
                    <Text style={styles.achProgressVal}>{ach.progress}/{ach.goal}</Text>
                  </View>
                  <View style={styles.achTrack}>
                    <View
                      style={[
                        styles.achFill,
                        { width: `${ach.progress_pct}%`, backgroundColor: rarityColor },
                      ]}
                    />
                  </View>
                </View>
              )}
              {ach.unlocked && ach.unlocked_at && (
                <Text style={styles.unlockedAt}>
                  Unlocked {new Date(ach.unlocked_at).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: 60, alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
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
    justifyContent: "center",
    alignItems: "center",
  },
  achIconLocked: {
    backgroundColor: Colors.cardBorder,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
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
  achDesc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17, marginBottom: 8 },
  achProgressWrap: {},
  achProgressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  achProgressLabel: { color: Colors.textSecondary, fontSize: 11 },
  achProgressVal: { color: Colors.textSecondary, fontSize: 11 },
  achTrack: { height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2 },
  achFill: { height: "100%", borderRadius: 2 },
  unlockedAt: { color: Colors.textSecondary, fontSize: 11 },
});
