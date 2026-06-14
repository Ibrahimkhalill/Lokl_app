import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;

function ShimmerBox({ style }: { style: object }) {
  const translateX = useRef(new Animated.Value(-CARD_WIDTH)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: CARD_WIDTH,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  return (
    <View style={[s.shimmerBase, style]}>
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.07)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
}

export function PostCardSkeleton() {
  return (
    <View style={s.card}>
      {/* Header row: avatar + name + follow btn */}
      <View style={s.header}>
        <ShimmerBox style={s.avatar} />
        <ShimmerBox style={s.nameLine} />
        <ShimmerBox style={s.followBtn} />
      </View>

      {/* Image placeholder */}
      <ShimmerBox style={s.image} />

      {/* Text lines */}
      <ShimmerBox style={s.line} />
      <ShimmerBox style={[s.line, { width: "65%" }]} />

      {/* Action row */}
      <View style={s.actions}>
        <ShimmerBox style={s.actionChip} />
        <ShimmerBox style={s.actionChip} />
        <ShimmerBox style={s.actionChip} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  shimmerBase: {
    backgroundColor: "#2E3A3F",
    overflow: "hidden",
    borderRadius: 8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  nameLine: {
    flex: 1,
    height: 14,
    borderRadius: 7,
  },
  followBtn: {
    width: 72,
    height: 28,
    borderRadius: 14,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
  line: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
    width: "90%",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 6,
  },
  actionChip: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },
});
