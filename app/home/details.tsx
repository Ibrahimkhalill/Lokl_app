import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  Modal,
  FlatList,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";
import PlusIcon from "../../assets/icons/plus.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import BookmarkFilledIcon from "../../assets/icons/bookmark-filled.svg";
import LocationIcon from "../../assets/icons/locations.svg";
import PhoneIcon from "../../assets/icons/call.svg";
import TimeIcon from "../../assets/icons/clock.svg";
import GlobeIcon from "../../assets/icons/website.svg";
import ShowerIcon from "../../assets/icons/shower.svg";
import LockerIcon from "../../assets/icons/loack.svg";
import WifiIcon from "../../assets/icons/wifi.svg";
import NavigateIcon from "../../assets/icons/navigate.svg";
import FriendsIcon from "../../assets/icons/friends.svg";

const SCREEN_HEIGHT = Dimensions.get("window").height;


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
  is_bookmarked: boolean;
  cover: string | null;
  photos: VenuePhoto[];
  bookings: number;
  revenue: string;
  trend: string;
  reviews?: Review[];
}

interface Review {
  id: number;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  comment: string;
  image_url: string | null;
  created_at: string;
}

interface Friend {
  id: number;
  name: string;
  profile_picture: string | null;
  rating: number | null;
  comment?: string;
  image_url?: string | null;
  created_at?: string;
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
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [groups, setGroups] = useState<{ id: number; name: string; photo_url?: string | null }[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [sharingToGroup, setSharingToGroup] = useState<number | null>(null);

  // Drag-to-dismiss sheet animation
  const DISMISS_THRESHOLD = 140;
  const sheetY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const closeSheetRef = useRef<() => void>(() => {});

  const closeSheet = useCallback(() => {
    Animated.timing(sheetY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowShareModal(false);
    });
  }, [sheetY]);

  useEffect(() => { closeSheetRef.current = closeSheet; }, [closeSheet]);

  useEffect(() => {
    if (showShareModal) {
      sheetY.setValue(SCREEN_HEIGHT);
      Animated.spring(sheetY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      } as any).start();
    }
  }, [showShareModal, sheetY]);

  const sheetPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 8,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) sheetY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.8) {
          closeSheetRef.current();
        } else {
          Animated.spring(sheetY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const handleOpenShareToGroup = async () => {
    setShowShareModal(true);
    if (!groupsLoaded) {
      setLoadingGroups(true);
      try {
        const res = await api.get("/groups/?my=true&page_size=50");
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        setGroups(list.map((g: any) => ({ id: g.id, name: g.name, photo_url: g.photo_url ?? g.cover_image ?? null })));
        setGroupsLoaded(true);
      } catch { /* ignore */ } finally {
        setLoadingGroups(false);
      }
    }
  };

  const handleShareToGroup = async (groupId: number) => {
    if (!venue) return;
    setSharingToGroup(groupId);
    try {
      await api.post(`/groups/${groupId}/share_venue/`, { venue_id: venue.id });
    } catch { /* ignore */ } finally {
      setSharingToGroup(null);
      closeSheet();
    }
  };

  const handleToggleBookmark = async () => {
    if (!venue || bookmarking) return;
    setBookmarking(true);
    setBookmarked((prev) => !prev); // optimistic
    try {
      await api.post(`/venues/${venue.id}/toggle_save/`);
    } catch {
      setBookmarked((prev) => !prev); // revert on error
    } finally {
      setBookmarking(false);
    }
  };

  const fetchAll = useCallback(async (venueId: string) => {
    setLoading(true);
    try {
      const [venueRes, friendsRes] = await Promise.allSettled([
        api.get(`/venues/${venueId}/`),
        api.get(`/venues/${venueId}/friends/`),
      ]);

      if (venueRes.status === "fulfilled") {
        const v = venueRes.value.data?.data ?? venueRes.value.data ?? null;
        if (v && distanceParam) v.distance = decodeURIComponent(distanceParam);
        setVenue(v);
        setBookmarked(!!v?.is_bookmarked);
        const reviewList = Array.isArray(v?.reviews) ? v.reviews : [];
        setReviews(reviewList);
      }
      if (friendsRes.status === "fulfilled") {
        const fd = friendsRes.value.data?.data ?? friendsRes.value.data;
        setFriends(Array.isArray(fd?.friends) ? fd.friends : Array.isArray(fd) ? fd : []);
      }
    } catch (err) {
      console.error("[DetailsScreen] fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  }, [distanceParam]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      fetchAll(id);
    }, [id, fetchAll])
  );

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
        const R = 6371;
        const lat1 = loc.coords.latitude, lon1 = loc.coords.longitude;
        const lat2 = Number(venue.latitude), lon2 = Number(venue.longitude);
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const miles = dist * 0.621371;
        setUserDistance(miles < 0.1 ? "nearby" : `${miles.toFixed(1)} mi`);
      } catch {
        // GPS unavailable
      }
    })();
  }, [venue?.latitude, venue?.longitude]);

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

  // Opening hours — one line per day
  const allHours = Array.isArray(venue.hours) && venue.hours.length > 0
    ? venue.hours.join("\n")
    : null;

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
              ({venue.ratings_count.toLocaleString()} {venue.ratings_count === 1 ? "rating" : "ratings"})
            </Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{venue.type}</Text>
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
              {/* Open/Closed badge — always shown */}
              <View style={[styles.openBadge, !venue.is_open_now && styles.closedBadge]}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={venue.is_open_now ? "rgba(5, 223, 114, 1)" : "#f87171"}
                />
                <Text style={[styles.openText, !venue.is_open_now && styles.closedText]}>
                  {venue.is_open_now ? "Open Now" : "Closed"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  router.push(
                    `/events/share-event?title=${encodeURIComponent(venue.name)}&subtitle=${encodeURIComponent(venue.address ?? "")}&image=${encodeURIComponent(venue.cover ?? "")}&link=${encodeURIComponent(venue.website ?? "")}&type=venue`
                  )
                }
              >
                <Text style={styles.actionBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.shareGroupBtn]}
                onPress={handleOpenShareToGroup}
              >
                <Ionicons name="people-outline" size={14} color={Colors.black} />
                <Text style={[styles.actionBtnText]}>Share to Group</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => router.push(`/home/post?venueId=${venue.id}&venueName=${encodeURIComponent(venue.name)}&venueAddress=${encodeURIComponent(venue.address ?? "")}`)}
              >
                <PlusIcon width={20} height={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={handleToggleBookmark}
                disabled={bookmarking}
              >
                {bookmarked
                  ? <BookmarkFilledIcon width={20} height={20} color={Colors.primary} />
                  : <BookmarkIcon width={20} height={20} color={Colors.text} />
                }

           
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
          {!!allHours && (
            <View style={styles.infoCard}>
              <TimeIcon width={24} height={24} color={Colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoValue}>{allHours}</Text>
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

          {/* Friends' Rankings — shown above All Rankings */}
          {friends.length > 0 && (
            <>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>{"FRIENDS' RANKINGS"}</Text>
              </View>
              {friends.map((f) => (
                <View key={f.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    {f.profile_picture ? (
                      <Image source={{ uri: f.profile_picture }} style={styles.reviewAvatar} />
                    ) : (
                      <View style={[styles.reviewAvatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={18} color={Colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewName}>{f.name}</Text>
                      <Text style={styles.reviewTime}>
                        {f.created_at ? timeAgo(f.created_at) : "Friend"}
                      </Text>
                      {!!f.comment && (
                        <Text style={styles.reviewText}>{f.comment}</Text>
                      )}
                      {!!f.image_url && (
                        <Image source={{ uri: f.image_url }} style={styles.reviewImage} resizeMode="cover" />
                      )}
                    </View>
                    {f.rating != null && (
                      <View style={styles.reviewRatingBadge}>
                        <Text style={styles.reviewRatingText}>{Number(f.rating).toFixed(1)}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </>
          )}

          {/* All Rankings */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              ALL RANKINGS ({venue.ratings_count})
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/events/reviews?venueId=${venue.id}`)}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>
              No Raking yet. Be the first!
            </Text>
          ) : (
            reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  {review.user_avatar ? (
                    <Image source={{ uri: review.user_avatar }} style={styles.reviewAvatar} />
                  ) : (
                    <View style={[styles.reviewAvatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={18} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName}>{review.user_name ?? "Anonymous"}</Text>
                    <Text style={styles.reviewTime}>{timeAgo(review.created_at)}</Text>
                    {!!review.comment && (
                      <Text style={styles.reviewText}>{review.comment}</Text>
                    )}
                    {!!review.image_url && (
                      <Image source={{ uri: review.image_url }} style={styles.reviewImage} resizeMode="cover" />
                    )}
                  </View>
                  <View style={styles.reviewRatingBadge}>
                    <Text style={styles.reviewRatingText}>
                      {Number(review.rating).toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Share to Group modal — drag-to-dismiss */}
      <Modal visible={showShareModal} transparent animationType="none" onRequestClose={closeSheet}>
        <Pressable style={styles.modalBackdrop} onPress={closeSheet} />
        <Animated.View
          style={[styles.modalSheet, { transform: [{ translateY: sheetY }] }]}
        >
          {/* Drag handle — pan responder lives here */}
          <View style={styles.modalDragArea} {...sheetPan.panHandlers}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Share to Group</Text>
          </View>

          {loadingGroups ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={{ marginVertical: 32 }}
            />
          ) : groups.length === 0 ? (
            <Text style={styles.modalEmpty}>You haven't joined any groups yet.</Text>
          ) : (
            <FlatList
              data={groups}
              keyExtractor={(g) => String(g.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.groupRow}
                  onPress={() => handleShareToGroup(item.id)}
                  disabled={sharingToGroup === item.id}
                >
                  {item.photo_url ? (
                    <Image source={{ uri: item.photo_url }} style={styles.groupPhoto} />
                  ) : (
                    <View style={styles.groupIcon}>
                      <Ionicons name="people-outline" size={18} color={Colors.primary} />
                    </View>
                  )}
                  <Text style={styles.groupName}>{item.name}</Text>
                  {sharingToGroup === item.id
                    ? <ActivityIndicator size="small" color={Colors.primary} />
                    : <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />}
                </TouchableOpacity>
              )}
            />
          )}
        </Animated.View>
      </Modal>
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
    lineHeight: 10,
  },
  reviewRatingBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 48,
  },
  reviewRatingText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: "800",
  },
  reviewImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginTop: 8,
  },

  shareGroupBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    // borderColor: Colors.primary,
  },

  // Share to Group modal
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  modalDragArea: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    width: "100%",
    paddingHorizontal: 20,
  },
  modalEmpty: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 24,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  groupPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  groupName: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
