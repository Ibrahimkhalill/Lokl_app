import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import DollarIcon from "../../assets/icons/dollar.svg";
import FriendsIcon from "../../assets/icons/friends.svg";
import LocationIcon from "../../assets/icons/locations.svg";
import PhoneIcon from "../../assets/icons/call.svg";
import TimeIcon from "../../assets/icons/clock.svg";
import GlobeIcon from "../../assets/icons/website.svg";
import ShowerIcon from "../../assets/icons/shower.svg";
import LockerIcon from "../../assets/icons/loack.svg";
import WifiIcon from "../../assets/icons/wifi.svg";
import NavigateIcon from "../../assets/icons/navigate.svg";
import VenueIcon from "../../assets/icons/venue.svg";
const REVIEWS = [
  {
    id: "r1",
    name: "Sarah, Mike",
    time: "2 days ago",
    rating: "9.2",
    text: "Amazing instructors and peaceful atmosphere! The morning classes are perfect.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  },
  {
    id: "r2",
    name: "Mike Rodriguez",
    time: "1 week ago",
    rating: "9.2",
    text: "Great facilities, very clean. Would love more evening class options.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
];

const AMENITIES = [
  {
    icon: <ShowerIcon width={20} height={20} color={Colors.primary} />,
    label: "Shower",
  },
  {
    icon: <LockerIcon width={20} height={20} color={Colors.primary} />,
    label: "Locker",
  },
  {
    icon: <WifiIcon width={20} height={20} color={Colors.primary} />,
    label: "WiFi",
  },
];

export default function EventDetailsScreen() {
  const router = useRouter();
  const [joined, setJoined] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
            }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <View style={s.heroOverlay}>
            <TouchableOpacity
              style={s.heroBackBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[s.slideBtn, { left: 20 }]}>
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.slideBtn, { right: 20 }]}>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </TouchableOpacity>
          <View style={s.heroDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[s.heroDot, i === imgIdx && s.heroDotActive]}
              />
            ))}
          </View>
        </View>

        <View style={s.content}>
          {/* Join / Joined state */}
          {!joined ? (
            <TouchableOpacity style={s.joinBtn} onPress={() => setJoined(true)}>
              <Text style={s.joinBtnText}>Join Event</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.joinedActions}>
              <View style={s.openNowBadge}>
                <Ionicons name="time-outline" size={20} color="#05DF72" />
                <Text style={s.openNowText}>Open Now</Text>
              </View>
              <TouchableOpacity
                style={s.actionOutlineBtn}
                onPress={() => router.push("/events/share-event")}
              >
                <Text style={s.actionOutlineBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionOutlineBtn}
                onPress={() => router.push("/chat/id?id=1")}
              >
                <Text style={s.actionOutlineBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Title */}
          <Text style={s.title}>BOXING FUNDAMENTALS</Text>
          <View style={s.metaRow}>
            <View style={s.tagChip}>
              <Text style={s.tagChipText}>Yoga</Text>
            </View>
            <View style={s.scoreChip}>
              <Text style={s.scoreChipText}>9.2</Text>
            </View>
            <DollarIcon width={14} height={14} color={Colors.textSecondary} />

            <View style={s.metaDot} />
            <Text style={s.metaText}>1.2 mi</Text>
            <View style={{ flex: 1 }} />
            <DollarIcon width={14} height={14} color={Colors.primary} />
            <Text style={s.priceText}>$2500</Text>
          </View>

          {/* Description */}
          <Text style={s.description}>
            Experience the tranquility of Zen Yoga Studio, where ancient
            practices meet modern wellness. Our expert instructors guide you
            through transformative sessions in our serene, state-of-the-art
            facilities.
          </Text>

          {/* Hosted By */}
          <Text style={s.sectionTitle}>Hosted By</Text>
          <View style={s.hostRow}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
              }}
              style={s.hostAvatar}
            />
            <Text style={s.hostName}>Mike Rodriguez</Text>
          </View>

          {/* Friends Here */}
          <TouchableOpacity
            style={s.friendsCard}
            onPress={() => router.push("/events/friends-here")}
          >
            <View style={s.friendsHeader}>
              <FriendsIcon width={18} height={18} color={Colors.primary} />
              <Text style={s.friendsTitle}>FRIENDS HERE</Text>
            </View>
            <View style={s.friendRow}>
              <View style={s.friendAvatars}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
                  }}
                  style={s.friendAvatar}
                />
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
                  }}
                  style={[s.friendAvatar, s.friendAvatarOverlap]}
                />
              </View>
              <View>
                <Text style={s.friendName}>Sarah, Mike</Text>
                <Text style={s.friendStatus}>are here now</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Info Cards */}
          {[
            {
              icon: <VenueIcon width={20} height={20} color={Colors.primary} />,
              label: "Venue",
              value: "Central Park",
            },
            {
              icon: (
                <LocationIcon width={20} height={20} color={Colors.primary} />
              ),
              label: "Location",
              value: "New York",
            },
            {
              icon: <TimeIcon width={20} height={20} color={Colors.primary} />,
              label: "Time & Date",
              value: "Mon-Fri: 6AM-10PM, Sat-Sun: 8AM-AM",
            },
            {
              icon: (
                <FriendsIcon width={20} height={20} color={Colors.primary} />
              ),
              label: "Max Participants",
              value: "120",
            },
            {
              icon: <GlobeIcon width={20} height={20} color={Colors.primary} />,
              label: "Website",
              value: "Zenyogastudio.com",
              link: true,
            },
          ].map((info, i) => (
            <View key={i} style={s.infoCard}>
              {info.icon}
              <View style={s.infoText}>
                <Text style={s.infoLabel}>{info.label}</Text>
                <Text style={[s.infoValue, (info as any).link && s.infoLink]}>
                  {info.value}
                </Text>
              </View>
            </View>
          ))}

          {/* Amenities */}
          <Text style={s.sectionTitle}>AMENITIES</Text>
          <View style={s.amenitiesGrid}>
            {AMENITIES.map((a, i) => (
              <View key={i} style={s.amenityChip}>
                {a.icon}
                <Text style={s.amenityText}>{a.label}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <View style={s.reviewsHeader}>
            <Text style={s.sectionTitle}>REVIEWS ({joined ? 4 : 2})</Text>
            {joined && (
              <TouchableOpacity onPress={() => router.push("/events/reviews")}>
                <Text style={s.seeAll}>See all</Text>
              </TouchableOpacity>
            )}
          </View>
          {REVIEWS.map((rev) => (
            <View key={rev.id} style={s.reviewCard}>
              <View style={s.reviewTop}>
                <Image source={{ uri: rev.avatar }} style={s.reviewAvatar} />
                <View style={s.reviewInfo}>
                  <Text style={s.reviewName}>{rev.name}</Text>
                  <Text style={s.reviewTime}>{rev.time}</Text>
                  <Text style={s.reviewText}>{rev.text}</Text>
                </View>
                <View style={s.reviewScore}>
                  <Text style={s.reviewScoreText}>{rev.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { height: 280, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 16,
  },
  heroBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(20,22,26,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  slideBtn: {
    position: "absolute",
    top: "55%",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(20,22,26,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroDots: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  heroDot: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  heroDotActive: { width: 22, backgroundColor: Colors.primary },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40 },
  joinBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  joinBtnText: { color: Colors.black, fontSize: 16, fontWeight: "700" },
  joinedActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
    alignItems: "center",
  },
  openNowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 50,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: "#103A25",
  },
  openNowText: { color: "#05DF72", fontSize: 13, fontWeight: "600" },
  actionOutlineBtn: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 50,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  actionOutlineBtnText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  tagChip: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  tagChipText: { color: Colors.text, fontSize: 12 },
  scoreChip: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  scoreChipText: { color: Colors.black, fontSize: 12, fontWeight: "800" },
  metaText: { color: Colors.textSecondary, fontSize: 13 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
  },
  priceText: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 12,
    marginTop: 6,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  hostAvatar: { width: 42, height: 42, borderRadius: 21 },
  hostName: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  friendsCard: {
    backgroundColor: Colors.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 18,
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  friendsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  friendsTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  friendRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  friendAvatars: { flexDirection: "row" },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  friendAvatarOverlap: { marginLeft: -10 },
  friendName: { color: Colors.text, fontSize: 14, fontWeight: "500" },
  friendStatus: { color: Colors.textSecondary, fontSize: 15, marginTop: 2 },
  infoText: { flex: 1, paddingTop: 1 },
  infoLabel: { color: Colors.textSecondary, fontSize: 16.5, marginBottom: 4 },
  infoValue: { color: Colors.text, fontSize: 32 / 2, lineHeight: 31 },
  infoLink: { color: Colors.primary },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  amenityText: { color: Colors.text, fontSize: 13 },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  seeAll: { color: Colors.textSecondary, fontSize: 13 },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewInfo: { flex: 1 },
  reviewName: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  reviewTime: { color: Colors.textMuted, fontSize: 12 },
  reviewScore: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  reviewScoreText: { color: Colors.black, fontSize: 13, fontWeight: "800" },
  reviewText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
