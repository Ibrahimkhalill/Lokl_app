import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";
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

const { width } = Dimensions.get("window");

// ── Types ─────────────────────────────────────────────────────────────────────

interface VenuePhoto {
  id: number;
  url: string;
  order: number;
}

interface VenueDetail {
  id: number;
  name: string;
  type: string;
  description: string;
  score: number;
  score_display: string;
  ratings_count: number;
  price_level: string;
  plan_tier: string;
  amenities: string; // comma-separated e.g. "shower,locker,wifi"
  latitude: number | null;
  longitude: number | null;
  distance: string;
  address: string;
  phone: string;
  website: string;
  hours: string[]; // ["Monday: 6:00 AM – 10:00 PM", ...]
  is_open_now: boolean | null;
  cover: string | null;
  photos: VenuePhoto[];
  bookings: number;
  revenue: string;
  trend: string;
}

interface ReviewUser {
  id: number;
  name: string;
  profile_picture: string | null;
}

interface Review {
  id: number;
  user: ReviewUser;
  rating: string;
  comment: string;
  created_at: string;
}

interface Friend {
  id: number;
  name: string;
  profile_picture: string | null;
  rating: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return "Just now";
}

function getTodayHours(hours: string[]): string | null {
  if (!hours || hours.length === 0) return null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const entry = hours.find((h) => h.startsWith(today));
  if (!entry) return null;
  const parts = entry.split(": ");
  return parts[1] ?? null;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  shower:  <ShowerIcon width={20} height={20} color={Colors.primary} />,
  locker:  <LockerIcon width={20} height={20} color={Colors.primary} />,
  wifi:    <WifiIcon   width={20} height={20} color={Colors.primary} />,
  parking: <Ionicons name="car-outline"   size={20} color={Colors.primary} />,
  pool:    <Ionicons name="water-outline" size={20} color={Colors.primary} />,
  sauna:   <Ionicons name="flame-outline" size={20} color={Colors.primary} />,
};

const AMENITY_LABELS: Record<string, string> = {
  shower: "Shower", locker: "Locker", wifi: "WiFi",
  parking: "Parking", pool: "Pool", sauna: "Sauna",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DetailsScreen() {
  const router = useRouter();
  const { id, distance: distanceParam } = useLocalSearchParams<{ id: string; distance?: string }>();

  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [userDistance, setUserDistance] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchAll(id);
  }, [id]);

  // Calculate GPS distance once venue lat/lng is loaded
  useEffect(() => {
    if (!venue?.latitude || !venue?.longitude) return;
    (async () => {
      try {
        const { status } = await import("expo-location").then(m =>
          m.requestForegroundPermissionsAsync()
        );
        if (status !== "granted") return;
        const loc = await import("expo-location").then(m =>
          m.getCurrentPositionAsync({ accuracy: 3 })
        );
        const dist = haversineKm(
          loc.coords.latitude, loc.coords.longitude,
          Number(venue.latitude), Number(venue.longitude)
        );
        const miles = dist * 0.621371;
        setUserDistance(miles < 0.1 ? "nearby" : `${miles.toFixed(1)} mi`);
      } catch {
        // GPS unavailable — keep distanceParam from navigation
      }
    })();
  }, [venue?.latitude, venue?.longitude]);

  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function fetchAll(venueId: string) {
    setLoading(true);
    try {
      const [venueRes, reviewsRes, friendsRes] = await Promise.allSettled([
        api.get(`/venues/${venueId}/`),
        api.get(`/venues/${venueId}/reviews/`),
        api.get(`/venues/${venueId}/friends/`),
      ]);

      if (venueRes.status === "fulfilled") {
        const v = venueRes.value.data?.data ?? null;
        // Inject distance from navigation param — detail endpoint doesn't calculate it
        if (v && distanceParam) v.distance = decodeURIComponent(distanceParam);
        setVenue(v);
      }
      if (reviewsRes.status === "fulfilled") {
        const rd = reviewsRes.value.data?.data;
        // Backend returns { count, results } or just an array
        const list = Array.isArray(rd) ? rd : (rd?.results ?? rd?.reviews ?? []);
        setReviews(list);
      }
      if (friendsRes.status === "fulfilled") {
        const fd = friendsRes.value.data?.data;
        setFriends(fd?.friends ?? []);
      }
    } catch (err) {
      console.error("[DetailsScreen] fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading venue…</Text>
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.textSecondary} />
        <Text style={styles.loadingText}>Venue not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, marginTop: 12 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Build photos carousel: cover first, then gallery photos
  const allPhotos: string[] = [];
  if (venue.cover) allPhotos.push(venue.cover);
  (venue.photos ?? []).forEach((p) => {
    if (p.url && p.url !== venue.cover) allPhotos.push(p.url);
  });

  // Amenities list
  const amenityList = venue.amenities
    ? venue.amenities.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean)
    : [];

  // Today's hours
  const todayHours = getTodayHours(venue.hours);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero Image Carousel ───────────────────────────────────────── */}
        <View style={styles.heroWrap}>
          {allPhotos.length > 0 ? (
            <Image
              source={{ uri: allPhotos[imgIndex] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.noImagePlaceholder]}>
              <Ionicons name="image-outline" size={60} color={Colors.textSecondary} />
            </View>
          )}

          <SafeAreaView style={styles.heroOverlay}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Colors.text} />
            </TouchableOpacity>
            {venue.latitude && venue.longitude && (
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => {
                  const url = `maps://?q=${venue.latitude},${venue.longitude}`;
                  Linking.openURL(url).catch(() =>
                    Linking.openURL(
                      `https://maps.google.com/?q=${venue.latitude},${venue.longitude}`
                    )
                  );
                }}
              >
                <NavigateIcon width={20} height={20} color={Colors.text} />
              </TouchableOpacity>
            )}
          </SafeAreaView>

          {/* Prev / Next */}
          {allPhotos.length > 1 && (
            <View style={styles.slideBtnWrap}>
              <TouchableOpacity
                style={[styles.slideBtn, { left: 12 }]}
                onPress={() =>
                  setImgIndex((i) => (i > 0 ? i - 1 : allPhotos.length - 1))
                }
              >
                <Ionicons name="chevron-back" size={18} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.slideBtn, { right: 12 }]}
                onPress={() =>
                  setImgIndex((i) => (i < allPhotos.length - 1 ? i + 1 : 0))
                }
              >
                <Ionicons name="chevron-forward" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          )}

          {/* Dots */}
          {allPhotos.length > 1 && (
            <View style={styles.heroDots}>
              {allPhotos.slice(0, 6).map((_, i) => (
                <View
                  key={i}
                  style={[styles.heroDot, i === imgIndex && styles.heroDotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Title + Meta */}
          <Text style={styles.venueName}>{venue.name.toUpperCase()}</Text>
          <View style={styles.metaRow}>
            <View style={styles.scoreChip}>
              <Text style={styles.scoreText}>
                {Number(venue.score).toFixed(1)}
              </Text>
            </View>
            <Text style={styles.metaText}>
              ({venue.ratings_count.toLocaleString()} ratings)
            </Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{venue.type}</Text>
            {!!venue.price_level && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.metaText}>{venue.price_level}</Text>
              </>
            )}
            {!!(userDistance || venue.distance) && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.metaText}>{userDistance ?? venue.distance}</Text>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.actionsScroll}
          >
            <View style={styles.actionsRow}>
              {/* Open/Closed badge */}
              {venue.is_open_now !== null && (
                <View
                  style={[
                    styles.openBadge,
                    !venue.is_open_now && styles.closedBadge,
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={venue.is_open_now ? "rgba(5, 223, 114, 1)" : "#f87171"}
                  />
                  <Text
                    style={[
                      styles.openText,
                      !venue.is_open_now && styles.closedText,
                    ]}
                  >
                    {venue.is_open_now ? "Open Now" : "Closed"}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push("/home/share-event")}
              >
                <Text style={styles.actionBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => router.push(`/home/post?venueId=${venue.id}`)}
              >
                <PlusIcon width={20} height={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconBtn}>
                <BookmarkIcon width={20} height={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Description */}
          {!!venue.description && (
            <Text style={styles.description}>{venue.description}</Text>
          )}

          {/* Friends Here */}
          {friends.length > 0 && (
            <View style={styles.section}>
              <View style={styles.friendsHeader}>
                <FriendsIcon width={20} height={20} color={Colors.primary} />
                <Text style={styles.friendsTitle}>FRIENDS HERE</Text>
              </View>
              <View style={styles.friendRow}>
                <View style={styles.friendAvatars}>
                  {friends.slice(0, 3).map((f, idx) => (
                    f.profile_picture ? (
                      <Image
                        key={f.id}
                        source={{ uri: f.profile_picture }}
                        style={[
                          styles.friendAvatar,
                          idx > 0 && { marginLeft: -10 },
                        ]}
                      />
                    ) : (
                      <View
                        key={f.id}
                        style={[
                          styles.friendAvatar,
                          styles.avatarPlaceholder,
                          idx > 0 && { marginLeft: -10 },
                        ]}
                      >
                        <Ionicons name="person" size={14} color={Colors.textSecondary} />
                      </View>
                    )
                  ))}
                </View>
                <View>
                  <Text style={styles.friendName}>
                    {friends
                      .slice(0, 2)
                      .map((f) => f.name.split(" ")[0])
                      .join(", ")}
                    {friends.length > 2 ? ` +${friends.length - 2}` : ""}
                  </Text>
                  <Text style={styles.friendStatus}>
                    {friends.length === 1 ? "has" : "have"} been here
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Info Cards */}
          {todayHours && (
            <View style={styles.infoCard}>
              <TimeIcon width={24} height={24} color={Colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Hours Today</Text>
                <Text style={styles.infoValue}>{todayHours}</Text>
              </View>
            </View>
          )}
          {!!venue.phone && (
            <TouchableOpacity
              style={styles.infoCard}
              onPress={() => Linking.openURL(`tel:${venue.phone}`)}
            >
              <PhoneIcon width={20} height={20} color={Colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{venue.phone}</Text>
              </View>
            </TouchableOpacity>
          )}
          {!!venue.website && (
            <TouchableOpacity
              style={styles.infoCard}
              onPress={() => Linking.openURL(venue.website)}
            >
              <GlobeIcon width={20} height={20} color={Colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Website</Text>
                <Text style={[styles.infoValue, styles.infoLink]}>
                  {venue.website.replace(/^https?:\/\//, "")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {!!venue.address && (
            <View style={styles.infoCard}>
              <LocationIcon width={20} height={20} color={Colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{venue.address}</Text>
              </View>
            </View>
          )}

          {/* Amenities */}
          {amenityList.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>AMENITIES</Text>
              <View style={styles.amenitiesGrid}>
                {amenityList.map((key) => (
                  <View key={key} style={styles.amenityChip}>
                    {AMENITY_ICONS[key] ?? (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color={Colors.primary}
                      />
                    )}
                    <Text style={styles.amenityText}>
                      {AMENITY_LABELS[key] ?? key}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              REVIEWS ({venue.ratings_count})
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/events/reviews?venueId=${venue.id}`)}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>
              No reviews yet. Be the first!
            </Text>
          ) : (
            reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  {review.user.profile_picture ? (
                    <Image
                      source={{ uri: review.user.profile_picture }}
                      style={styles.reviewAvatar}
                    />
                  ) : (
                    <View style={[styles.reviewAvatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={18} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName}>{review.user.name}</Text>
                    <Text style={styles.reviewTime}>
                      {timeAgo(review.created_at)}
                    </Text>
                    {!!review.comment && (
                      <Text style={styles.reviewText}>{review.comment}</Text>
                    )}
                  </View>
                  <Text style={styles.reviewRating}>{review.rating}/10</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14, marginTop: 8 },

  heroWrap: { height: 280, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  noImagePlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
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
    backgroundColor: "rgba(17, 33, 32, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  slideBtnWrap: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: -16,
  },
  slideBtn: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(17, 33, 32, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
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
  closedBadge: { backgroundColor: "rgba(60, 20, 20, 1)" },
  openText: {
    color: "rgba(5, 223, 114, 1)",
    fontSize: 13,
    fontWeight: "600",
  },
  closedText: { color: "#f87171" },
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
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
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
  infoLabel: { color: Colors.textSecondary, fontSize: 12, marginBottom: 3 },
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
  noReviews: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
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
  },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewInfo: { flex: 1 },
  reviewName: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  reviewTime: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4 },
  reviewText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  reviewRating: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
});
