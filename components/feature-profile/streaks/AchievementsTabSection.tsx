import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../../constants/colors";
import LoackIcon from "../../../assets/icons/loack.svg";
import { ACHIEVEMENTS, RARITY_COLORS } from "./streaksData";

export function AchievementsTabSection() {
  return (
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
          <Text style={[styles.achStatNum, { color: Colors.primary }]}>10%</Text>
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
            {ach.locked && (
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
                        width: `${(ach.progress / ach.total) * 100}%`,
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
  );
}

const styles = StyleSheet.create({
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
});
