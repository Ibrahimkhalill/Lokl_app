import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/colors";
import StarIcon from "../../../assets/icons/star.svg";
import StudentsIcon from "../../../assets/icons/students.svg";
import CourseIcon from "../../../assets/icons/course.svg";
import { BusinessProfile } from "./types";

interface Props {
  profile: BusinessProfile | null;
  eventsCount: number;
  isOwner: boolean;
  tab: "about" | "event";
  onTabChange: (tab: "about" | "event") => void;
  localCoverUri: string | null;
  localAvatarUri: string | null;
  uploadingCover: boolean;
  uploadingAvatar: boolean;
  onPickCover: () => void;
  onPickAvatar: () => void;
  userAvatar?: string | null;
  onSettingsPress: () => void;
  onBackPress: () => void;
  onCreateEvent: () => void;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i + 0.5 < rating || i + 1 <= rating;
    return (
      <StarIcon
        key={i}
        width={13}
        height={13}
        color={filled ? "#D1FF00" : "#2A2A2A"}
      />
    );
  });
}

export function BusinessHeader({
  profile,
  eventsCount,
  isOwner,
  tab,
  onTabChange,
  localCoverUri,
  localAvatarUri,
  uploadingCover,
  uploadingAvatar,
  onPickCover,
  onPickAvatar,
  userAvatar,
  onSettingsPress,
  onBackPress,
  onCreateEvent,
}: Props) {
  const coverUri = localCoverUri ?? profile?.cover_photo_url ?? null;
  const avatarUri = localAvatarUri ?? profile?.profile_photo_url ?? userAvatar ?? null;

  const reviewCount = profile?.review_count ?? 0;
  const clientsCount = profile?.clients_count ?? 0;
  const ratingValue = profile?.average_rating ?? profile?.rating ?? 0;
  const ratingDisplay =
    typeof ratingValue === "number"
      ? ratingValue.toFixed(1)
      : String(ratingValue ?? "0.0");

  const displayName = profile?.owner_name ?? "";
  const displayRole = profile?.business_type ?? "";

  console.log("BusinessHeader render", {
  profile
  });

  return (
    <>
      {/* Cover photo hero banner */}
      <TouchableOpacity
        activeOpacity={isOwner ? 0.85 : 1}
        onPress={isOwner ? onPickCover : undefined}
        style={styles.heroBanner}
        disabled={uploadingCover}
      >
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder} />
        )}

        {isOwner && (
          <View style={styles.coverOverlay}>
            {uploadingCover ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <View style={styles.coverEditBadge}>
                <Ionicons name="camera" size={16} color={Colors.white} />
                <Text style={styles.coverEditText}>Edit Cover</Text>
              </View>
            )}
          </View>
        )}

        {isOwner ? (
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={onSettingsPress}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBackPress}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Profile info section */}
      <View style={styles.topSection}>
        {/* Avatar + name row */}
        <View style={styles.profileRow}>
          <TouchableOpacity
            onPress={isOwner ? onPickAvatar : undefined}
            activeOpacity={isOwner ? 0.85 : 1}
            disabled={uploadingAvatar}
            style={styles.avatarWrap}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={Colors.textMuted} />
              </View>
            )}
            {isOwner && (
              <View style={styles.avatarEditBadge}>
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="camera" size={12} color={Colors.black} />
                )}
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              {displayRole}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {/* Reviews */}
          <View style={styles.statItem}>
            <View style={styles.statIconCircle}>
              <StudentsIcon width={16} height={16} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {reviewCount > 999
                ? `${(reviewCount / 1000).toFixed(1)}k`
                : reviewCount}
            </Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>

          {/* Clients — owner only */}
          {isOwner && (
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.statValue}>
                {clientsCount > 999
                  ? `${(clientsCount / 1000).toFixed(1)}k`
                  : clientsCount}
              </Text>
              <Text style={styles.statLabel}>Clients</Text>
            </View>
          )}

          {/* Events */}
          <View style={styles.statItem}>
            <View style={styles.statIconCircle}>
              <CourseIcon width={16} height={16} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {String(eventsCount).padStart(2, "0")}
            </Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>

          {/* Rating */}
          <View style={styles.statItem}>
            <View style={styles.scoreBlock}>
              <View style={styles.coachPill}>
                <Text style={styles.coachPillText} numberOfLines={1}>
                  Business
                </Text>
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{ratingDisplay}</Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Create Event button — owner only */}
        {isOwner && (
          <TouchableOpacity style={styles.createBtn} onPress={onCreateEvent}>
            <Ionicons name="add" size={24} color={Colors.white} />
            <Text style={styles.createBtnText}>Create New Event</Text>
          </TouchableOpacity>
        )}

        {/* About / Events tab switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "about" && styles.tabBtnActive]}
            onPress={() => onTabChange("about")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "about" && styles.tabTextActive,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "event" && styles.tabBtnActive]}
            onPress={() => onTabChange("event")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "event" && styles.tabTextActive,
              ]}
            >
              Events
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroBanner: { height: 200, overflow: "hidden" },
  heroImage: { width: "100%", height: "100%" },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.card,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  coverEditBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  coverEditText: { color: Colors.white, fontSize: 13, fontWeight: "600" },

  settingsBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  topSection: {
    backgroundColor: Colors.background,
    marginTop: -2,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -28,
    marginBottom: 16,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 76, height: 76, borderRadius: 14 },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  profileInfo: { flex: 1, marginTop: 20 },
  name: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  role: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },

  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 18,
    paddingHorizontal: 8,
    justifyContent: "space-between",
  },
  statItem: { gap: 8, alignItems: "center", paddingVertical: 6 },
  statIconCircle: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  statLabel: { color: Colors.textSecondary, fontSize: 11 },
  scoreBlock: { alignItems: "center", justifyContent: "center" },
  ratingBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  ratingText: { color: Colors.black, fontSize: 12, fontWeight: "800" },
  coachPill: {
    backgroundColor: "#248BFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coachPillText: { color: Colors.white, fontSize: 11, fontWeight: "700" },

  createBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#1677E6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
  },
  createBtnText: { color: Colors.white, fontSize: 14, fontWeight: "700" },

  tabRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  tabBtn: {
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: Colors.black, fontWeight: "700" },
});
