import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function ShimmerBox({ style }: { style: object }) {
  const translateX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  return (
    <View style={[s.base, style]}>
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

// ─── Event Card ──────────────────────────────────────────────────────────────
export function EventCardSkeleton() {
  return (
    <View style={s.eventCard}>
      {/* Cover image */}
      <ShimmerBox style={s.eventImage} />
      <View style={s.eventBody}>
        {/* Title */}
        <ShimmerBox style={s.eventTitle} />
        {/* Meta row: date + time */}
        <View style={s.row}>
          <ShimmerBox style={s.iconBox} />
          <ShimmerBox style={[s.metaLine, { width: 90 }]} />
          <ShimmerBox style={s.iconBox} />
          <ShimmerBox style={[s.metaLine, { width: 60 }]} />
        </View>
        {/* Location row */}
        <View style={s.row}>
          <ShimmerBox style={s.iconBox} />
          <ShimmerBox style={[s.metaLine, { width: 140 }]} />
        </View>
        {/* Host row */}
        <View style={s.row}>
          <ShimmerBox style={s.hostAvatar} />
          <ShimmerBox style={[s.metaLine, { width: 120 }]} />
        </View>
        {/* Progress bar */}
        <ShimmerBox style={s.progressBar} />
      </View>
    </View>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────
export function GroupCardSkeleton() {
  return (
    <View style={s.groupCard}>
      {/* Overlapping avatars */}
      <View style={s.row}>
        {Array.from({ length: 3 }).map((_, i) => (
          <ShimmerBox key={i} style={[s.groupAvatar, { marginLeft: i > 0 ? -12 : 0 }]} />
        ))}
      </View>
      <ShimmerBox style={[s.line, { width: "60%", marginTop: 12 }]} />
      <ShimmerBox style={[s.line, { width: "80%", marginTop: 8 }]} />
      <ShimmerBox style={[s.line, { width: "40%", marginTop: 8 }]} />
    </View>
  );
}

// ─── Notification Row ─────────────────────────────────────────────────────────
export function NotifRowSkeleton() {
  return (
    <View style={s.notifRow}>
      <ShimmerBox style={s.notifAvatar} />
      <View style={s.notifContent}>
        <ShimmerBox style={[s.line, { width: "70%" }]} />
        <ShimmerBox style={[s.line, { width: "50%", marginTop: 6 }]} />
      </View>
      <ShimmerBox style={s.notifTime} />
    </View>
  );
}

// ─── Chat Row ─────────────────────────────────────────────────────────────────
export function ChatRowSkeleton() {
  return (
    <View style={s.chatRow}>
      <ShimmerBox style={s.chatAvatar} />
      <View style={s.chatContent}>
        <View style={s.chatTop}>
          <ShimmerBox style={[s.line, { width: "45%" }]} />
          <ShimmerBox style={s.chatTime} />
        </View>
        <ShimmerBox style={[s.line, { width: "70%", marginTop: 8 }]} />
      </View>
    </View>
  );
}

// ─── Venue Row (Search) ───────────────────────────────────────────────────────
export function VenueRowSkeleton() {
  return (
    <View style={s.venueRow}>
      <ShimmerBox style={s.venueThumb} />
      <View style={s.venueContent}>
        <ShimmerBox style={[s.line, { width: "60%" }]} />
        <ShimmerBox style={[s.line, { width: "40%", marginTop: 8 }]} />
      </View>
      <ShimmerBox style={s.venueBtn} />
    </View>
  );
}

// ─── User Profile Header ──────────────────────────────────────────────────────
export function UserProfileHeaderSkeleton() {
  return (
    <View style={s.profileHeader}>
      {/* Avatar + stats row */}
      <View style={s.profileTopRow}>
        <ShimmerBox style={s.profileAvatar} />
        <View style={s.profileStatsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={s.profileStatItem}>
              <ShimmerBox style={[s.line, { width: 32, height: 16 }]} />
              <ShimmerBox style={[s.line, { width: 40, marginTop: 4, height: 10 }]} />
            </View>
          ))}
        </View>
      </View>
      {/* Bio card */}
      <View style={s.profileBioCard}>
        <ShimmerBox style={[s.line, { width: "90%" }]} />
        <ShimmerBox style={[s.line, { width: "60%", marginTop: 8 }]} />
        <ShimmerBox style={[s.line, { width: "50%", marginTop: 8 }]} />
      </View>
      {/* Action buttons */}
      <View style={s.profileActions}>
        <ShimmerBox style={s.profileActionBtn} />
        <ShimmerBox style={s.profileActionBtn} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  base: {
    backgroundColor: "#2E3A3F",
    overflow: "hidden",
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  line: { height: 12, borderRadius: 6 },
  iconBox: { width: 20, height: 20, borderRadius: 4 },
  metaLine: { height: 12, borderRadius: 6 },

  // Event card
  eventCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },
  eventImage: { width: "100%", height: 180, borderRadius: 0 },
  eventBody: { padding: 14 },
  eventTitle: { height: 16, borderRadius: 8, width: "75%", marginBottom: 14 },
  hostAvatar: { width: 28, height: 28, borderRadius: 14 },
  progressBar: { height: 6, borderRadius: 3, width: "100%", marginTop: 4 },

  // Notification row
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  notifAvatar: { width: 46, height: 46, borderRadius: 23 },
  notifContent: { flex: 1 },
  notifTime: { width: 30, height: 10, borderRadius: 5 },

  // Group card
  groupCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  groupAvatar: { width: 44, height: 44, borderRadius: 22 },

  // Chat row
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  chatAvatar: { width: 50, height: 50, borderRadius: 25 },
  chatContent: { flex: 1 },
  chatTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatTime: { width: 28, height: 10, borderRadius: 5 },

  // Venue row
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 12,
    gap: 12,
    marginBottom: 10,
  },
  venueThumb: { width: 48, height: 48, borderRadius: 10 },
  venueContent: { flex: 1 },
  venueBtn: { width: 40, height: 40, borderRadius: 20 },

  // User profile header
  profileHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  profileTopRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  profileAvatar: { width: 72, height: 72, borderRadius: 36 },
  profileStatsRow: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  profileStatItem: { alignItems: "center" },
  profileBioCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 16,
  },
  profileActions: { flexDirection: "row", gap: 12 },
  profileActionBtn: { flex: 1, height: 44, borderRadius: 12 },
});
