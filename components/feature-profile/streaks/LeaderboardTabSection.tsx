import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Colors } from "../../../constants/colors";
import FireIcon from "../../../assets/icons/fire.svg";
import QueenIcon from "../../../assets/icons/king.svg";
import { LEADERBOARD } from "./streaksData";

export function LeaderboardTabSection() {
  return (
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
          <Image source={{ uri: entry.avatar }} style={styles.leaderAvatar} />
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
  );
}

const styles = StyleSheet.create({
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
