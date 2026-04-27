import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Colors } from "../../constants/colors";

export type ReviewListCardVariant = "eventDetail" | "reviewsList";

export interface ReviewListCardProps {
  variant: ReviewListCardVariant;
  avatarUri: string;
  name: string;
  time: string;
  rating: string;
  text: string;
}

/** Avatar + review body + score — styles match each screen (no design drift). */
export function ReviewListCard({
  variant,
  avatarUri,
  name,
  time,
  rating,
  text,
}: ReviewListCardProps) {
  const v = variant === "eventDetail" ? eventStyles : reviewsStyles;
  return (
    <View style={v.card}>
      <View style={v.cardTop}>
        <Image source={{ uri: avatarUri }} style={v.avatar} />
        <View style={v.info}>
          <Text style={v.name}>{name}</Text>
          <Text style={v.time}>{time}</Text>
          <Text style={v.reviewText}>{text}</Text>
        </View>
        <View style={v.scoreBadge}>
          <Text style={v.scoreText}>{rating}</Text>
        </View>
      </View>
    </View>
  );
}

const eventStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  info: { flex: 1 },
  name: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  time: { color: Colors.textMuted, fontSize: 12 },
  reviewText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  scoreBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  scoreText: { color: Colors.black, fontSize: 13, fontWeight: "800" },
});

const reviewsStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  info: { flex: 1 },
  name: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  time: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  reviewText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  scoreBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreText: { color: Colors.black, fontSize: 13, fontWeight: "800" },
});
