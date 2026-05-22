import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
import { Colors } from "../../constants/colors";
import DollarIcon from "../../assets/icons/dollar.svg";
import FriendsIcon from "../../assets/icons/friends.svg";
import LocationIcon from "../../assets/icons/locations.svg";
import TimeIcon from "../../assets/icons/clock.svg";
import GlobeIcon from "../../assets/icons/website.svg";
import ShowerIcon from "../../assets/icons/shower.svg";
import LockerIcon from "../../assets/icons/loack.svg";
import WifiIcon from "../../assets/icons/wifi.svg";
import VenueIcon from "../../assets/icons/venue.svg";
import StarIcon from "../../assets/icons/star.svg";
import { eventService } from "../../services/eventService";
import { businessService } from "../../services/businessService";
import { getErrorMessage } from "../../lib/api";

type EventData = {
  id: number;
  title: string;
  host_display?: string;
  event_type?: string;
  sport_type?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  venue?: string;
  capacity?: number;
  registered?: number;
  price?: string;
  website?: string;
  amenities?: string[];
  status?: string;
  cover_image_url?: string | null;
  average_rating?: number;
  review_count?: number;
  latitude?: string;
  longitude?: string;
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  shower: <ShowerIcon width={20} height={20} color={Colors.primary} />,
  Shower: <ShowerIcon width={20} height={20} color={Colors.primary} />,
  locker: <LockerIcon width={20} height={20} color={Colors.primary} />,
  Locker: <LockerIcon width={20} height={20} color={Colors.primary} />,
  wifi: <WifiIcon width={20} height={20} color={Colors.primary} />,
  WiFi: <WifiIcon width={20} height={20} color={Colors.primary} />,
};

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

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(timeStr?: string) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <StarIcon key={i} width={13} height={13} color={i < Math.round(rating) ? "#D1FF00" : "#2A2A2A"} />
  ));
}

export default function HostEventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await eventService.getEvent(eventId);
      const data = res.data?.data ?? res.data;
      setEvent(data);
    } catch (e) {
      console.log("[HostEventDetail]", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  useEffect(() => {
    if (!event?.latitude || !event?.longitude) return;
    (async () => {
      try {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.High,
        });
        console.log("[Location] Device:", loc.coords.latitude, loc.coords.longitude);
        console.log("[Location] Event:", event.latitude, event.longitude);
        const geo = await ExpoLocation.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo.length > 0) {
          const g = geo[0];
          console.log("[Location] Device city:", g.city, g.region, g.country);
        }
        const km = haversineKm(
          loc.coords.latitude,
          loc.coords.longitude,
          Number(event.latitude),
          Number(event.longitude)
        );
        console.log("[Location] Distance km:", km);
        setDistance(formatDistance(km));
      } catch {
        // location not available
      }
    })();
  }, [event?.latitude, event?.longitude]);

  const handleDelete = () => {
    if (!event) return;
    Alert.alert("Delete Event", `Delete "${event.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await businessService.deleteEvent(eventId);
            router.back();
          } catch (e) {
            Alert.alert("Error", getErrorMessage(e));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={s.safe}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={s.centered}>
          <Text style={{ color: Colors.textSecondary }}>Event not found</Text>
        </View>
      </View>
    );
  }

  const category = event.event_type || event.sport_type || "";
  const amenities: string[] = Array.isArray(event.amenities) ? event.amenities : [];
  const avgRating = event.average_rating ?? 0;
  const score10 = (avgRating * 2).toFixed(1);
  const priceNum = Number(event.price ?? 0);
  const priceTier = priceNum === 0 ? "Free" : priceNum <= 100 ? "$" : priceNum <= 500 ? "$$" : "$$$";

  const infoCards = [
    event.venue && {
      icon: <VenueIcon width={20} height={20} color={Colors.primary} />,
      label: "Venue",
      value: event.venue,
    },
    event.location && {
      icon: <LocationIcon width={20} height={20} color={Colors.primary} />,
      label: "Location",
      value: event.location,
    },
    (event.date || event.time) && {
      icon: <TimeIcon width={20} height={20} color={Colors.primary} />,
      label: "Date & Time",
      value: [formatDate(event.date), formatTime(event.time)].filter(Boolean).join("  ·  "),
    },
    event.capacity && {
      icon: <FriendsIcon width={20} height={20} color={Colors.primary} />,
      label: "Max Participants",
      value: String(event.capacity),
    },
    event.website && {
      icon: <GlobeIcon width={20} height={20} color={Colors.primary} />,
      label: "Website",
      value: event.website,
      link: true,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; link?: boolean }[];

  return (
    <View style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={s.hero}>
          {event.cover_image_url ? (
            <Image source={{ uri: event.cover_image_url }} style={s.heroImage} resizeMode="cover" />
          ) : (
            <View style={[s.heroImage, s.heroPlaceholder]}>
              <Ionicons name="calendar-outline" size={60} color={Colors.textMuted} />
            </View>
          )}
          <View style={s.heroOverlay} />
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          {event.status ? (
            <View style={s.statusBadge}>
              <Text style={s.statusText}>{event.status}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.content}>
          <Text style={s.title}>{event.title.toUpperCase()}</Text>

          {/* Meta row: [Yoga] [9.2] [$$] [• 1.2 km]   $ $440 */}
          <View style={s.metaRow}>
            {category ? (
              <View style={s.tagChip}>
                <Text style={s.tagChipText}>{category}</Text>
              </View>
            ) : null}
            {avgRating > 0 ? (
              <View style={s.ratingBadge}>
                <Text style={s.ratingText}>{score10}</Text>
              </View>
            ) : null}
            <Text style={s.priceTierText}>{priceTier}</Text>
            {distance ? (
              <>
                <View style={s.metaDot} />
                <Text style={s.distanceText}>{distance}</Text>
              </>
            ) : null}
            <View style={{ flex: 1 }} />
            {priceNum > 0 ? (
              <View style={s.priceBlock}>
                <DollarIcon width={13} height={13} color={Colors.primary} />
                <Text style={s.priceText}>${event.price}</Text>
              </View>
            ) : null}
          </View>

          {/* Stars + review count */}
          <View style={s.starsRow}>
            {renderStars(avgRating)}
            <Text style={s.reviewCount}>({event.review_count ?? 0} reviews)</Text>
          </View>

          {/* Description */}
          {event.description ? (
            <Text style={s.description}>{event.description}</Text>
          ) : null}

          {/* Info cards */}
          {infoCards.map((info, i) => (
            <View key={i} style={s.infoCard}>
              {info.icon}
              <View style={s.infoTextWrap}>
                <Text style={s.infoLabel}>{info.label}</Text>
                <Text style={[s.infoValue, info.link && s.infoLink]}>{info.value}</Text>
              </View>
            </View>
          ))}

          {/* Amenities */}
          {amenities.length > 0 ? (
            <>
              <Text style={s.sectionTitle}>AMENITIES</Text>
              <View style={s.amenitiesGrid}>
                {amenities.map((a, i) => (
                  <View key={i} style={s.amenityChip}>
                    {AMENITY_ICONS[a] || (
                      <Ionicons name="checkmark-circle-outline" size={20} color={Colors.primary} />
                    )}
                    <Text style={s.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Host quick links */}
          <View style={s.actionGroup}>
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push(`/events/gallery?id=${eventId}`)}>
              <Ionicons name="images-outline" size={18} color={Colors.primary} />
              <Text style={s.actionBtnText}>View Gallery</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push(`/events/reviews?id=${eventId}`)}>
              <Ionicons name="star-outline" size={18} color={Colors.primary} />
              <Text style={s.actionBtnText}>Reviews ({event.review_count ?? 0})</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push(`/events/share-event?id=${eventId}`)}>
              <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
              <Text style={s.actionBtnText}>Share Event</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Delete */}
          <TouchableOpacity style={s.deleteBtn} onPress={handleDelete} disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color="#FF3B30" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                <Text style={s.deleteBtnText}>Delete Event</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingBottom: 48 },

  hero: { height: 280, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroPlaceholder: { backgroundColor: Colors.card, justifyContent: "center", alignItems: "center" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(20,22,26,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 52,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 20 },
  title: { color: Colors.text, fontSize: 22, fontWeight: "800", letterSpacing: 0.3, marginBottom: 12 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  tagChip: {
    borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 8,
    paddingVertical: 3, paddingHorizontal: 10,
  },
  tagChipText: { color: Colors.text, fontSize: 12 },
  ratingBadge: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingVertical: 3, paddingHorizontal: 10,
  },
  ratingText: { color: Colors.black, fontSize: 12, fontWeight: "800" },
  priceTierText: { color: Colors.textSecondary, fontSize: 13 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textSecondary },
  distanceText: { color: Colors.textSecondary, fontSize: 13 },
  priceBlock: { flexDirection: "row", alignItems: "center", gap: 4 },
  priceText: { color: Colors.text, fontSize: 14, fontWeight: "700" },

  starsRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 14 },
  reviewCount: { color: Colors.textSecondary, fontSize: 12, marginLeft: 4 },
  description: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 20 },

  sectionTitle: { color: Colors.text, fontSize: 14, fontWeight: "800", letterSpacing: 0.4, marginBottom: 12, marginTop: 6 },
  infoCard: {
    backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.cardBorder, paddingVertical: 16, paddingHorizontal: 16,
    marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 14,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },
  infoValue: { color: Colors.text, fontSize: 15, lineHeight: 22 },
  infoLink: { color: Colors.primary },

  amenitiesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  amenityChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  amenityText: { color: Colors.text, fontSize: 13 },

  actionGroup: { gap: 10, marginBottom: 16 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1,
    borderColor: Colors.cardBorder, paddingVertical: 14, paddingHorizontal: 16,
  },
  actionBtnText: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: "600" },

  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1, borderColor: "#FF3B30", borderRadius: 14,
    paddingVertical: 14, marginTop: 8,
  },
  deleteBtnText: { color: "#FF3B30", fontSize: 15, fontWeight: "700" },
});
