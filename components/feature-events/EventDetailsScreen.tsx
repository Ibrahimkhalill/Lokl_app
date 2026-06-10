import React, { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import DollarIcon from "../../assets/icons/dollar.svg";
import FriendsIcon from "../../assets/icons/friends.svg";
import LocationIcon from "../../assets/icons/locations.svg";
import TimeIcon from "../../assets/icons/clock.svg";
import GlobeIcon from "../../assets/icons/website.svg";
import VenueIcon from "../../assets/icons/venue.svg";
import { ReviewListCard } from "../events";
import PlusIcon from "../../assets/icons/plus.svg";
import { eventService } from "../../services/eventService";
import { getErrorMessage } from "../../lib/api";

type Participant = { id: number; name: string; avatar: string | null };
type Review = {
  id: number;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  comment: string;
  image_url: string | null;
  created_at: string;
};
type EventDetail = {
  id: number;
  title: string;
  host_display: string;
  host_avatar: string | null;
  host_id?: number;
  business_id?: number;
  host?: { id?: number };
  venue: string;
  date: string;
  time: string;
  capacity: number;
  max_participants?: number | null;
  registered: number;
  is_registered: boolean;
  status: string;
  description: string;
  location: string;
  phone?: string;
  website?: string;
  event_type: string;
  neighborhood?: string;
  is_private: boolean;
  join_request_status?: "Pending" | "Approved" | "Declined" | null;
  price: string;
  cover_image_url: string | null;
  latitude?: string;
  longitude?: string;
  average_rating: number;
  review_count: number;
  reviews: Review[];
  participants: Participant[];
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
}


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

function priceTier(price: string) {
  const n = parseFloat(price);
  if (!n || n === 0) return "Free";
  if (n < 100) return "$";
  if (n < 500) return "$$";
  return "$$$";
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [requestingJoin, setRequestingJoin] = useState(false);
  const [distanceStr, setDistanceStr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    })();
  }, []);

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!userCoords || !event?.latitude || !event?.longitude) return;
    const km = haversineKm(userCoords.lat, userCoords.lon, Number(event.latitude), Number(event.longitude));
    setDistanceStr(km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);
  }, [userCoords, event]);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await eventService.getEvent(Number(id));
      const data = res.data?.data ?? res.data;
      setEvent(data);
    } catch (e) {
      console.log("[EventDetails] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { fetchEvent(); }, [fetchEvent]));

  const handleRegister = async () => {
    if (!event || registering) return;
    setRegistering(true);
    try {
      if (event.is_registered) {
        await eventService.cancelRegistration(event.id);
      } else {
        await eventService.registerForEvent(event.id);
      }
      await fetchEvent();
    } catch (e) {
      console.log("[EventDetails] register error:", getErrorMessage(e));
    } finally {
      setRegistering(false);
    }
  };

  /** For private events — submit a join request */
  const handleRequestToJoin = async () => {
    if (!event || requestingJoin) return;
    setRequestingJoin(true);
    try {
      await eventService.requestToJoinEvent(event.id);
      await fetchEvent();
    } catch (e) {
      const msg = getErrorMessage(e);
      Alert.alert("Join Request", msg);
      console.log("[EventDetails] join request error:", msg);
    } finally {
      setRequestingJoin(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: Colors.textSecondary }}>Event not found</Text>
      </View>
    );
  }

  const infoCards = [
    {
      icon: <VenueIcon width={20} height={20} color={Colors.primary} />,
      label: "Venue",
      value: event.venue,
    },
    {
      icon: <LocationIcon width={20} height={20} color={Colors.primary} />,
      label: "Location",
      value: event.location,
    },
    {
      icon: <TimeIcon width={20} height={20} color={Colors.primary} />,
      label: "Time & Date",
      value: [formatDate(event.date), formatTime(event.time)].filter(Boolean).join("  ·  "),
    },
    {
      icon: <FriendsIcon width={20} height={20} color={Colors.primary} />,
      label: "Max Participants",
      value: `${event.registered} / ${event.capacity}`,
    },
    ...(event.website
      ? [{
          icon: <GlobeIcon width={20} height={20} color={Colors.primary} />,
          label: "Website",
          value: event.website,
          link: true,
        }]
      : []),
  ].filter((c) => c.value);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          {event.cover_image_url ? (
            <Image source={{ uri: event.cover_image_url }} style={s.heroImage} resizeMode="cover" />
          ) : (
            <View style={[s.heroImage, { backgroundColor: Colors.cardBorder, justifyContent: "center", alignItems: "center" }]}>
              <Ionicons name="calendar-outline" size={60} color={Colors.textMuted} />
            </View>
          )}
          <View style={s.heroOverlay}>
            <TouchableOpacity style={s.heroBackBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.content}>
          {/* Join / Join Request / Joined */}
          {!event.is_registered && !event.is_private && (
            <TouchableOpacity style={s.joinBtn} onPress={handleRegister} disabled={registering}>
              {registering
                ? <ActivityIndicator size="small" color={Colors.black} />
                : <Text style={s.joinBtnText}>Join Event</Text>
              }
            </TouchableOpacity>
          )}
          {!event.is_registered && event.is_private && !event.join_request_status && (
            <TouchableOpacity style={s.joinBtn} onPress={handleRequestToJoin} disabled={requestingJoin}>
              {requestingJoin
                ? <ActivityIndicator size="small" color={Colors.black} />
                : <Text style={s.joinBtnText}>Request to Join</Text>
              }
            </TouchableOpacity>
          )}
          {event.is_private && event.join_request_status === "Pending" && (
            <View style={s.joinRequestBadge}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={s.joinRequestText}>Request Pending</Text>
            </View>
          )}
          {event.is_private && event.join_request_status === "Declined" && (
            <View style={[s.joinRequestBadge, s.joinRequestDeclined]}>
              <Ionicons name="close-circle-outline" size={16} color="#FF3B30" />
              <Text style={[s.joinRequestText, { color: "#FF3B30" }]}>Request Declined</Text>
            </View>
          )}

          {/* Title */}
          <Text style={s.title}>{event.title.toUpperCase()}</Text>

          {/* Meta row: [9.2]  (N ratings) • Yoga • $$ • price */}
          <View style={s.metaRow}>
             {event.event_type ? (
              <>
                <View style={s.metaTypeView} >
                <Text style={s.metaText}>{event.event_type}</Text>
                </View>
              </>
            ) : null}
            <View style={s.scoreChip}>
              <Text style={s.scoreChipText}>
                {event.average_rating > 0 ? event.average_rating.toFixed(1) : "0.0"}
              </Text>
            </View>
            {/* {event.review_count > 0 && (
              <Text style={s.metaText}>({event.review_count})</Text>
            )} */}
           
            {event.price ? (
              <>
                <Text style={s.metaText}>{priceTier(event.price)}</Text>
              </>
            ) : null}
            {distanceStr ? (
              <>
                <View style={s.metaDot} />
                <Text style={s.metaText}>{distanceStr}</Text>
              </>
            ) : null}
            <View style={{ flex: 1 }} />
            {event.price && parseFloat(event.price) > 0 ? (
              <View style={s.priceRow}>
                <DollarIcon width={14} height={14} color={Colors.primary} />
                <Text style={s.priceText}>{Math.round(parseFloat(event.price) * 100) / 100}</Text>
              </View>
            ) : null}
          </View>
           {event.is_registered && (
             <View style={s.joinedActions}>
               <View style={s.openNowBadge}>
                 <Ionicons name="time-outline" size={20} color="#05DF72" />
                 <Text style={s.openNowText}>{event.status}</Text>
               </View>
              <TouchableOpacity
                style={s.actionOutlineBtn}
                onPress={() =>
                  router.push(
                    `/events/share-event?title=${encodeURIComponent(event.title)}&subtitle=${encodeURIComponent(event.location)}&image=${encodeURIComponent(event.cover_image_url ?? "")}&link=${encodeURIComponent(`https://lokl.app/event/${event.id}`)}&type=event`
                  )
                }
              >
                <Text style={s.actionOutlineBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionCircleBtn}
                onPress={() => router.push(`/chat/id?event_id=${event.id}&name=${encodeURIComponent(event.title)}`)}
              >
                <Text style={s.actionOutlineBtnText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionCircleBtn}
                onPress={() => router.push(`/(tabs)/post?event_id=${event.id}`)}
              >
                <PlusIcon width={20} height={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
           )}

          {/* Description */}
          <Text style={s.description}>{event.description}</Text>

          {/* Hosted By */}
          <Text style={s.sectionTitle}>Hosted By</Text>
          <TouchableOpacity
            style={s.hostRow}
            activeOpacity={0.7}
            onPress={() => {
              const e = event as any;
              const hostId =
                e.host_id ??
                e.business_id ??
                e.host?.id ??
                e.business?.id ??
                e.created_by_id ??
                e.organizer_id ??
                e.creator_id;
                console.log("Determined host ID:", e, hostId);
              if (hostId) router.push(`/business/profile?id=${hostId}`);
            }}
          >
            {event.host_avatar ? (
              <Image source={{ uri: event.host_avatar }} style={s.hostAvatar} />
            ) : (
              <View style={[s.hostAvatar, { backgroundColor: Colors.card, justifyContent: "center", alignItems: "center" }]}>
                <Ionicons name="person" size={20} color={Colors.textSecondary} />
              </View>
            )}
            <Text style={s.hostName}>{event.host_display}</Text>
           
          </TouchableOpacity>

          {/* Participants (Friends Here card) */}
          {event.participants.length > 0 && (
            <TouchableOpacity
              style={s.friendsCard}
              onPress={() => router.push(`/events/friends-here?id=${event.id}`)}
            >
              <View style={s.friendsHeader}>
                <FriendsIcon width={18} height={18} color={Colors.primary} />
                <Text style={s.friendsTitle}>FRIENDS HERE</Text>
              </View>
              <View style={s.friendRow}>
                <View style={s.friendAvatars}>
                  {event.participants.slice(0, 3).map((p, i) =>
                    p.avatar ? (
                      <Image
                        key={p.id}
                        source={{ uri: p.avatar }}
                        style={[s.friendAvatar, i > 0 && s.friendAvatarOverlap]}
                      />
                    ) : (
                      <View
                        key={p.id}
                        style={[s.friendAvatar, i > 0 && s.friendAvatarOverlap, { backgroundColor: Colors.card, justifyContent: "center", alignItems: "center" }]}
                      >
                        <Ionicons name="person" size={14} color={Colors.textSecondary} />
                      </View>
                    )
                  )}
                </View>
                <View>
                  <Text style={s.friendName}>
                    {event.participants.slice(0, 2).map((p) => p.name.split(" ")[0]).join(", ")}
                    {event.participants.length > 2 ? ` +${event.participants.length - 2}` : ""}
                  </Text>
                  <Text style={s.friendStatus}>are here now</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Info Cards */}
          {infoCards.map((info, i) => (
            <View key={i} style={s.infoCard}>
              {info.icon}
              <View style={s.infoText}>
                <Text style={s.infoLabel}>{info.label}</Text>
                <Text style={[s.infoValue, (info as any).link && s.infoLink]}>{info.value}</Text>
              </View>
            </View>
          ))}

          {/* Reviews */}
          <View style={s.reviewsHeader}>
            <Text style={s.sectionTitle}>REVIEWS ({event.review_count})</Text>
            {event.is_registered && (
              <TouchableOpacity onPress={() => router.push(`/events/reviews?id=${event.id}`)}>
                <Text style={s.seeAll}>See all</Text>
              </TouchableOpacity>
            )}
          </View>
          {event.reviews.slice(0, 2).map((rev) => (
            <ReviewListCard
              key={rev.id}
              variant="eventDetail"
              avatarUri={rev.user_avatar ?? ""}
              name={rev.user_name}
              time={timeAgo(rev.created_at)}
              rating={String(rev.rating)}
              text={rev.comment}
              imageUri={rev.image_url}
            />
          ))}
          {event.reviews.length === 0 && (
            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>No reviews yet.</Text>
          )}
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
  openNowText: { color: "#05DF72", fontSize: 12, fontWeight: "600" },
  actionCircleBtn: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  actionOutlineBtn: {
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 15,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  actionOutlineBtnText: { color: Colors.text, fontSize: 12, fontWeight: "600" },
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
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
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
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  scoreChipText: { color: Colors.black, fontSize: 12, fontWeight: "800" },
  metaDot: { width: 5, height: 5, borderRadius: 2, backgroundColor: Colors.textSecondary },
  metaTypeView: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  metaText: { color: Colors.textSecondary, fontSize: 13 },
  priceText: { color: Colors.text, fontSize: 16, fontWeight: "700" },
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
  hostRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
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
  friendsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  friendsTitle: { color: Colors.text, fontSize: 14, fontWeight: "800", letterSpacing: 0.4 },
  friendRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  friendAvatars: { flexDirection: "row" },
  friendAvatar: { width: 32, height: 32, borderRadius: 21, borderWidth: 1.5, borderColor: Colors.background },
  friendAvatarOverlap: { marginLeft: -10 },
  friendName: { color: Colors.text, fontSize: 14, fontWeight: "500" },
  friendStatus: { color: Colors.textSecondary, fontSize: 15, marginTop: 2 },
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
  infoText: { flex: 1, paddingTop: 1 },
  infoLabel: { color: Colors.textSecondary, fontSize: 14, marginBottom: 4 },
  infoValue: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  infoLink: { color: Colors.primary },
  joinRequestBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(209,255,0,0.1)",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 18,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  joinRequestDeclined: {
    backgroundColor: "rgba(255,59,48,0.08)",
    borderColor: "#FF3B30",
  },
  joinRequestText: { color: Colors.primary, fontSize: 15, fontWeight: "700" },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  seeAll: { color: Colors.textSecondary, fontSize: 13 },
});
