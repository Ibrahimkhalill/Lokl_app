import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import PlusIcon from "../../assets/icons/plus.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import LocationIcon from "../../assets/icons/locations.svg";
import PhoneIcon from "../../assets/icons/call.svg";
import TimeIcon from "../../assets/icons/clock.svg";
import GlobeIcon from "../../assets/icons/website.svg";
import ShowerIcon from "../../assets/icons/shower.svg";
import LockerIcon from "../../assets/icons/loack.svg";
import WifiIcon from "../../assets/icons/wifi.svg";
import NavigateIcon from "../../assets/icons/navigate.svg";
import FriendsIcon from "../../assets/icons/friends.svg";

const REVIEWS = [
  {
    id: "1",
    name: "Sarah, Mike",
    time: "2 days ago",
    rating: "9.2/10",
    text: "Amazing instructors and peaceful atmosphere! The morning classes are perfect.",
    images: [
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=200&q=80",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&q=80",
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=200&q=80",
    ],
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
  },
  {
    id: "2",
    name: "Mike Rodriguez",
    time: "1 week ago",
    rating: "9/10",
    text: "Great facilities, very clean. Would love more evening class options.",
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80",
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=200&q=80",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&q=80",
    ],
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

export default function DetailsScreen() {
  const router = useRouter();
  const [imgIndex, setImgIndex] = useState(0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroWrap}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <SafeAreaView style={styles.heroOverlay}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroBtn}>
              <NavigateIcon width={20} height={20} color={Colors.text} />
            </TouchableOpacity>
          </SafeAreaView>
          {/* Prev/Next */}
          <View style={styles.slideBtnWrap}>
            <TouchableOpacity style={[styles.slideBtn, { left: 12 }]}>
              <Ionicons name="chevron-back" size={18} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.slideBtn, { right: 12 }]}>
              <Ionicons name="chevron-forward" size={18} color={Colors.text} />
            </TouchableOpacity>
          </View>
          {/* Dots */}
          <View style={styles.heroDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[styles.heroDot, i === imgIndex && styles.heroDotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.venueName}>ZEN YOGA STUDIO</Text>
          <View style={styles.metaRow}>
            <View style={styles.scoreChip}>
              <Text style={styles.scoreText}>9.2</Text>
            </View>
            <Text style={styles.metaText}>(3,558 ratings)</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>Yoga</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>$$</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>1.2 mi</Text>
          </View>

          {/* Action Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.actionsScroll}
          >
            <View style={styles.actionsRow}>
              <View style={styles.openBadge}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="rgba(5, 223, 114, 1)"
                />
                <Text style={styles.openText}>Open Now</Text>
              </View>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push("/home/share-event")}
              >
                <Text style={styles.actionBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconBtn}>
                <PlusIcon width={20} height={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconBtn}>
                <BookmarkIcon width={20} height={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Description */}
          <Text style={styles.description}>
            Experience the tranquility of Zen Yoga Studio, where ancient
            practices meet modern wellness. Our expert instructors guide you
            through transformative sessions in our serene, state-of-the-art
            facilities.
          </Text>

          {/* Friends Here */}
          <View style={styles.section}>
            <View style={styles.friendsHeader}>
              <FriendsIcon width={20} height={20} color={Colors.primary} />
              <Text style={styles.friendsTitle}>FRIENDS HERE</Text>
            </View>
            <View style={styles.friendRow}>
              <View style={styles.friendAvatars}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
                  }}
                  style={styles.friendAvatar}
                />
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
                  }}
                  style={[styles.friendAvatar, { marginLeft: -10 }]}
                />
              </View>
              <View>
                <Text style={styles.friendName}>Sarah, Mike</Text>
                <Text style={styles.friendStatus}>are here now</Text>
              </View>
            </View>
          </View>

          {/* Info Cards */}
          {[
            {
              icon: <TimeIcon width={24} height={24} color={Colors.primary} />,
              label: "Hours",
              value: "Mon-Fri: 6AM-10PM, Sat-Sun: 8AM-AM",
            },
            {
              icon: <PhoneIcon width={20} height={20} color={Colors.primary} />,
              label: "Phone",
              value: "(555) 123-4567",
            },
            {
              icon: <GlobeIcon width={20} height={20} color={Colors.primary} />,
              label: "Website",
              value: "Zenyogastudio.com",
              link: true,
            },
            {
              icon: (
                <LocationIcon width={20} height={20} color={Colors.primary} />
              ),
              label: "Address",
              value: "123 Main St",
            },
          ].map((info, i) => (
            <View key={i} style={styles.infoCard}>
              {info.icon}
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{info.label}</Text>
                <Text style={[styles.infoValue, info.link && styles.infoLink]}>
                  {info.value}
                </Text>
              </View>
            </View>
          ))}

          {/* Amenities */}
          <Text style={styles.sectionTitle}>AMENITIES</Text>
          <View style={styles.amenitiesGrid}>
            {AMENITIES.map((a, i) => (
              <View key={i} style={styles.amenityChip}>
                {a.icon}
                <Text style={styles.amenityText}>{a.label}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>REVIEWS (4)</Text>
            <TouchableOpacity onPress={() => router.push("/events/reviews")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Image
                  source={{ uri: review.avatar }}
                  style={styles.reviewAvatar}
                />
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <Text style={styles.reviewTime}>{review.time}</Text>
                  <Text style={styles.reviewText}>{review.text}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.reviewImages}
                  >
                    {review.images.map((img, i) => (
                      <Image
                        key={i}
                        source={{ uri: img }}
                        style={styles.reviewImg}
                      />
                    ))}
                  </ScrollView>
                </View>
                <Text style={styles.reviewRating}>{review.rating}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroWrap: { height: 280, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(17, 33, 32, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  slideBtnWrap: {
    position: "absolute",
    top: "50%",
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  slideBtn: {
    position: "absolute",
    top: "50%",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(17, 33, 32, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  heroDots: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
  },
  heroDot: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  heroDotActive: { width: 22, backgroundColor: Colors.primary },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  venueName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  scoreChip: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scoreText: { color: Colors.black, fontSize: 13, fontWeight: "800" },
  metaText: { color: Colors.textSecondary, fontSize: 13 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
  },
  actionsScroll: { marginBottom: 16 },
  actionsRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  openBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(16, 58, 37, 1)",
  },
  openText: { color: "rgba(5, 223, 114, 1)", fontSize: 13, fontWeight: "600" },
  actionBtn: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionBtnText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  actionIconBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  friendsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  friendsTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  friendRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  friendAvatars: { flexDirection: "row" },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  friendName: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  friendStatus: { color: Colors.textSecondary, fontSize: 12 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  infoText: { flex: 1 },
  infoLabel: { color: Colors.textMuted, fontSize: 12, marginBottom: 3 },
  infoValue: { color: Colors.text, fontSize: 14 },
  infoLink: { color: Colors.primary },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginTop: 20,
    marginBottom: 12,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
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
  },
  seeAll: { color: Colors.textSecondary, fontSize: 13 },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewInfo: { flex: 1 },
  reviewName: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  reviewTime: { color: Colors.textMuted, fontSize: 12 },
  reviewRating: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  reviewText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewImages: {},
  reviewImg: { width: 80, height: 60, borderRadius: 8, marginRight: 8 },
});
