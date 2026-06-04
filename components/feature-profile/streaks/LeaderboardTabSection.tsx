import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors } from "../../../constants/colors";
import FireIcon from "../../../assets/icons/fire.svg";
import QueenIcon from "../../../assets/icons/king.svg";
import { Avatar } from "../../primitives/Avatar";

export type ApiLeaderboardEntry = {
  rank: number;
  user_id: number;
  name: string;
  username: string;
  profile_picture: string | null;
  fire_score: number;
  locations_visited: number;
};

export type ApiLeaderboardData = {
  current_user_id: number;
  results: ApiLeaderboardEntry[];
};

function PodiumAvatar({
  entry,
  size,
  rank,
  rankColor,
  isFirst,
}: {
  entry: ApiLeaderboardEntry;
  size: number;
  rank: number;
  rankColor: string;
  isFirst?: boolean;
}) {
  return (
    <View style={styles.podiumItem}>
      {isFirst && (
        <QueenIcon width={24} height={24} color={Colors.primary} style={styles.crownIcon} />
      )}
      <View style={styles.avatarWrap}>
        <Avatar uri={entry.profile_picture} size={size} borderWidth={isFirst ? 3 : 2} />
        <View style={[styles.rankDot, { backgroundColor: rankColor }]}>
          <Text style={[styles.rankDotText, isFirst && { color: Colors.black }]}>{rank}</Text>
        </View>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{entry.name}</Text>
      <Text style={[styles.podiumSub, isFirst && { color: Colors.primary }]}>
        {entry.locations_visited} visited
      </Text>
    </View>
  );
}

export function LeaderboardTabSection({
  data,
  loading,
}: {
  data: ApiLeaderboardData | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!data || !data.results.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No leaderboard data</Text>
      </View>
    );
  }

  const top3 = data.results.slice(0, 3);
  const hasFullPodium = top3.length === 3;
  const [first, second, third] = top3;

  return (
    <>
      <Text style={styles.legendTitle}>LOKL LEGENDS</Text>

      {hasFullPodium && (
        <View style={styles.podium}>
          {/* 2nd place — left, aligned to bottom */}
          <PodiumAvatar entry={second} size={64} rank={2} rankColor="#9B9B9B" />

          {/* 1st place — center, elevated */}
          <View style={styles.podiumFirstWrap}>
            <PodiumAvatar entry={first} size={76} rank={1} rankColor={Colors.primary} isFirst />
          </View>

          {/* 3rd place — right, aligned to bottom */}
          <PodiumAvatar entry={third} size={64} rank={3} rankColor="#FF6B35" />
        </View>
      )}

      {data.results.map((entry) => {
        const isSelf = entry.user_id === data.current_user_id;
        const rankBg =
          entry.rank === 1 ? Colors.primary :
          entry.rank === 2 ? "#9B9B9B" :
          entry.rank === 3 ? "#FF6B35" :
          Colors.cardBorder;
        const rankTextColor = entry.rank <= 3 ? Colors.black : Colors.text;

        return (
          <View
            key={entry.user_id}
            style={[styles.leaderRow, isSelf && styles.leaderRowSelf]}
          >
            <View style={[styles.rankBadge, { backgroundColor: rankBg }]}>
              <Text style={[styles.rankText, { color: rankTextColor }]}>{entry.rank}</Text>
            </View>
            <Avatar uri={entry.profile_picture} size={46} borderWidth={1} />
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderName}>
                {isSelf ? "You" : entry.name}
              </Text>
              {/* <Text style={styles.leaderSub}>{entry.locations_visited} locations visited</Text> */}
            </View>
            <View style={styles.leaderScore}>
              <FireIcon width={16} height={16} color="rgba(255,105,0,1)" />
              <Text style={styles.leaderScoreNum}>{entry.fire_score}</Text>
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

  legendTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 24,
  },

  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 16,
    marginBottom: 28,
  },
  podiumFirstWrap: {
    marginBottom: 20,
  },
  podiumItem: {
    alignItems: "center",
    gap: 6,
  },
  crownIcon: {
    marginBottom: 0,
    position: "absolute",
    top: -12,
    left: "50%",
    transform: [{ translateX: -12 }],
    zIndex: 1,
  },
  avatarWrap: {
    position: "relative",
  },
  rankDot: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    transform: [{ translateX: -11 }],
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  rankDotText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  podiumName: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    maxWidth: 80,
    marginTop: 4,
  },
  podiumSub: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
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
  leaderRowSelf: {
    borderColor: Colors.cardBorder,
    // backgroundColor: "rgba(123,97,255,0.08)",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontSize: 13,
    fontWeight: "800",
  },
  leaderInfo: { flex: 1 },
  leaderName: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  leaderSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  leaderScore: { flexDirection: "row", alignItems: "center", gap: 6 },
  leaderScoreNum: { color: Colors.text, fontSize: 18, fontWeight: "800" },
});
