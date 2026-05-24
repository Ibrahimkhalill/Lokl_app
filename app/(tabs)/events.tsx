import React, { useState, useCallback, useRef, useEffect } from "react";
import * as ExpoLocation from "expo-location";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import SearchIcon from "../../assets/icons/search.svg";
import CreateGroupIcon from "../../assets/icons/create_group.svg";
import PersonIcon from "../../assets/icons/friends.svg";
import CalendarIcon from "../../assets/icons/create_group.svg";
import TimeIcon from "../../assets/icons/clock.svg";
import LocationIcon from "../../assets/icons/locations.svg";
import { eventService } from "../../services/eventService";
import { getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type ApiEvent = {
  id: number;
  title: string;
  sport_type?: string;
  event_type?: string;
  event_date?: string;
  date?: string;
  start_time?: string;
  time?: string;
  location?: string;
  venue?: string;
  capacity?: number;
  registered?: number;
  max_participants?: number;
  current_participants?: number;
  status: string;
  price?: string;
  cover_image?: string | null;
  cover_image_url?: string | null;
  host_display?: string;
  host_avatar?: string | null;
  latitude?: string;
  longitude?: string;
  is_registered?: boolean;
  organizer?: {
    id: number;
    name: string;
    username: string;
    profile_picture: string | null;
  };
};

type GroupMember = {
  id: number;
  name: string;
  avatar: string | null;
};

type ApiGroup = {
  id: number;
  name: string;
  bio?: string;
  description?: string;
  photo?: string | null;
  photo_url?: string | null;
  avatar?: string | null;
  members_count?: number;
  is_member?: boolean;
  members_preview?: GroupMember[];
};

type Tab = "events" | "allGroups" | "myGroups";

function formatDateSmart(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTime(timeStr?: string) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
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

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function EventsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [search, setSearch] = useState("");


  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [refreshingEvents, setRefreshingEvents] = useState(false);
  const [registering, setRegistering] = useState<number | null>(null);

  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [refreshingGroups, setRefreshingGroups] = useState(false);

  const fetchingRef = useRef(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
        setUserLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      } catch {}
    })();
  }, []);

  const fetchEvents = useCallback(async (refresh = false) => {
    if (fetchingRef.current && !refresh) return;
    fetchingRef.current = true;
    if (refresh) setRefreshingEvents(true);
    else setLoadingEvents(true);
    try {
      const params: Record<string, string> = {};
      
      if (search.trim()) params.search = search.trim();
      const res = await eventService.listEvents(params);
      const payload = res.data?.data ?? res.data;
      const results: ApiEvent[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.events)
        ? payload.events
        : Array.isArray(payload?.results)
        ? payload.results
        : [];

      console.log("[Events] fetched events:", res.data);
      setEvents(results);
    } catch (e) {
      console.log("[Events] fetchEvents error:", getErrorMessage(e));
    } finally {
      setLoadingEvents(false);
      setRefreshingEvents(false);
      fetchingRef.current = false;
    }
  }, [search]);

  const fetchGroups = useCallback(async (refresh = false) => {
    if (refresh) setRefreshingGroups(true);
    else setLoadingGroups(true);
    try {
      const res = await eventService.listSocialGroups();
      const payload = res.data?.data ?? res.data;
      const results: ApiGroup[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      console.log("[Events] fetched groups:", results);
      setGroups(results);
    } catch (e) {
      console.log("[Events] fetchGroups error:", getErrorMessage(e));
    } finally {
      setLoadingGroups(false);
      setRefreshingGroups(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      fetchGroups();
    }, [fetchEvents, fetchGroups])
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "events", label: "All Events" },
    { key: "allGroups", label: "All Groups" },
    { key: "myGroups", label: "My Groups" },
  ];

  const filteredEvents = events.filter((e) => {
    if (!search.trim()) return true;
    return e.title.toLowerCase().includes(search.toLowerCase());
  });

  const handleRegister = async (event: ApiEvent) => {
    if (registering === event.id) return;
    setRegistering(event.id);
    try {
      if (event.is_registered) {
        await eventService.cancelRegistration(event.id);
      } else {
        await eventService.registerForEvent(event.id);
      }
      await fetchEvents();
    } catch (e) {
      console.log("[Events] register error:", getErrorMessage(e));
    } finally {
      setRegistering(null);
    }
  };

  const renderEventCard = ({ item: event }: { item: ApiEvent }) => {
    const category = event.sport_type || event.event_type || "";
    const dateStr = event.event_date || event.date || "";
    const timeStr = event.start_time || event.time || "";
    const joined = event.registered ?? event.current_participants ?? 0;
    const total = event.capacity ?? event.max_participants ?? 0;
    const progress = total > 0 ? joined / total : 0;
    const hostName = event.host_display || event.organizer?.name || event.organizer?.username || "";
    const hostAvatar = event.host_avatar || event.organizer?.profile_picture || null;
    const coverUri = event.cover_image_url || event.cover_image || null;

    let distanceStr = "";
    if (userLocation && event.latitude && event.longitude) {
      const km = haversineKm(
        userLocation.lat, userLocation.lon,
        Number(event.latitude), Number(event.longitude)
      );
      distanceStr = formatDistance(km);
    }

    return (
      <View style={s.eventCard}>
        <View style={s.eventImageWrap}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={s.eventImage} resizeMode="cover" />
          ) : (
            <View style={[s.eventImage, s.eventImagePlaceholder]}>
              <Ionicons name="calendar-outline" size={40} color={Colors.textMuted} />
            </View>
          )}
          {category ? (
            <View style={s.categoryTag}>
              <Text style={s.categoryTagText}>{category}</Text>
            </View>
          ) : null}
        </View>
        <View style={s.eventBody}>
          <Text style={s.eventTitle}>{event.title.toUpperCase()}</Text>

          <View style={s.eventMeta}>
            <CalendarIcon width={20} height={20} color={Colors.textSecondary} />
            <Text style={s.eventMetaText}>{formatDateSmart(dateStr)}</Text>
            {timeStr ? (
              <>
                <View style={s.metaDot} />
                <TimeIcon width={20} height={20} color={Colors.textSecondary} />
                <Text style={s.eventMetaText}>{formatTime(timeStr)}</Text>
              </>
            ) : null}
          </View>

          {(event.venue || event.location || distanceStr) ? (
            <View style={s.eventMeta}>
              <LocationIcon width={20} height={20} color={Colors.textSecondary} />
              <Text style={s.eventMetaText}>{event.venue || event.location || ""}</Text>
              {distanceStr ? (
                <>
                  <View style={s.metaDot} />
                  <Text style={s.eventMetaText}>{distanceStr}</Text>
                </>
              ) : null}
            </View>
          ) : null}

          {hostName ? (
            <View style={s.hostRow}>
              {hostAvatar ? (
                <Image source={{ uri: hostAvatar }} style={s.hostAvatar} />
              ) : (
                <View style={[s.hostAvatar, s.hostAvatarPlaceholder]}>
                  <Ionicons name="person" size={20} color={Colors.textSecondary} />
                </View>
              )}
              <Text style={s.hostText}>
                Hosted by <Text style={s.hostName}>{hostName}</Text>
              </Text>
            </View>
          ) : null}

          {total > 0 ? (
            <View style={s.progressRow}>
              <PersonIcon width={17} height={17} color={Colors.primary} />
              <Text style={s.progressText}>
                {joined}/{total} joined
              </Text>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
              </View>
            </View>
          ) : null}

          <View style={s.eventActions}>
            {event.is_registered ? (
              <TouchableOpacity
                style={s.leaveBtn}
                onPress={() => handleRegister(event)}
                disabled={registering === event.id}
              >
                {registering === event.id ? (
                  <ActivityIndicator size="small" color={Colors.text} />
                ) : (
                  <Text style={s.leaveBtnText}>Leave Event</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={s.joinBtn}
                onPress={() => handleRegister(event)}
                disabled={registering === event.id}
              >
                {registering === event.id ? (
                  <ActivityIndicator size="small" color={Colors.black} />
                ) : (
                  <Text style={s.joinBtnText}>Join Event</Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={s.detailsBtn}
              onPress={() => router.push(`/events/event-details?id=${event.id}`)}
            >
              <Text style={s.detailsBtnText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderGroupCard = ({ item: group }: { item: ApiGroup }) => {
    const members = (group.members_preview ?? []).slice(0, 3);
    const AVATAR_SIZE = 44;
    const OVERLAP = 16;

    return (
      <TouchableOpacity
        style={s.groupCard}
        activeOpacity={0.85}
        onPress={() =>
          router.push(
            activeTab === "myGroups"
              ? `/events/group-detail?id=${group.id}&admin=true`
              : `/events/group-detail?id=${group.id}`
          )
        }
      >
        <View style={s.groupCardTop}>
          {/* Overlapping member avatars */}
          <View style={[s.groupAvatarsRow, { width: AVATAR_SIZE + (members.length - 1) * (AVATAR_SIZE - OVERLAP) }]}>
            {members.map((m, i) => (
              <View
                key={m.id}
                style={[
                  s.groupMemberAvatar,
                  {
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderRadius: AVATAR_SIZE / 2,
                    left: i * (AVATAR_SIZE - OVERLAP),
                    zIndex: members.length - i,
                  },
                ]}
              >
                {m.avatar ? (
                  <Image
                    source={{ uri: m.avatar }}
                    style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }}
                  />
                ) : (
                  <View style={[{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }, s.groupMemberAvatarPlaceholder]}>
                    <Ionicons name="person" size={18} color={Colors.textSecondary} />
                  </View>
                )}
              </View>
            ))}
            {members.length === 0 ? (
              <View style={[s.groupMemberAvatar, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }]}>
                <View style={[{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }, s.groupMemberAvatarPlaceholder]}>
                  <Ionicons name="people" size={20} color={Colors.textSecondary} />
                </View>
              </View>
            ) : null}
          </View>

          <View style={s.groupInfo}>
            <Text style={s.groupName}>{group.name}</Text>
            <Text style={s.groupDesc} numberOfLines={2}>
              {group.bio || group.description || ""}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={s.groupActionBtn}
          onPress={() =>
            router.push(
              activeTab === "myGroups"
                ? `/events/group-detail?id=${group.id}&admin=true`
                : `/events/group-detail?id=${group.id}`
            )
          }
        >
          <Text style={s.groupActionBtnText}>
            {group.is_member ? "View" : "Join Group"}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hi, {(user?.name || user?.username || "there").split(" ").slice(0, 2).join(" ")}</Text>
          <Text style={s.greetingSub}>
            {activeTab === "events" ? "Find an event" : "joined the event"}
          </Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.iconBtn}>
            <SearchIcon width={22} height={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.createBtn}
            onPress={() => router.push("/events/group-create")}
          >
            <CreateGroupIcon width={20} height={20} color={Colors.text} />
            <Text style={s.createBtnText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.titleBlock}>
          <Text style={s.title}>EVENTS & GROUPS</Text>
          <Text style={s.subtitle}>Join local sports activities and meet new people</Text>
        </View>

        <View style={s.searchWrap}>
          <SearchIcon width={20} height={20} color={Colors.textSecondary} />
          <TextInput
            style={s.searchInput}
            placeholder="Search events..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => fetchEvents()}
            returnKeyType="search"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.tabsScroll}
          contentContainerStyle={s.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tab, activeTab === tab.key && s.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === "events" && (
          <>
            {/* <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterContent}
              style={s.filterScroll}
            >
              {EVENT_TYPE_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[s.filterChip, eventTypeFilter === f && s.filterChipActive]}
                  onPress={() => setEventTypeFilter(f)}
                >
                  <Text style={[s.filterChipText, eventTypeFilter === f && s.filterChipTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView> */}

            {loadingEvents ? (
              <View style={s.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : filteredEvents.length === 0 ? (
              <View style={s.center}>
                <Text style={s.emptyText}>No events found</Text>
              </View>
            ) : (
              <FlatList
                data={filteredEvents}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderEventCard}
                scrollEnabled={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshingEvents}
                    onRefresh={() => fetchEvents(true)}
                    tintColor={Colors.primary}
                  />
                }
              />
            )}
          </>
        )}

        {(activeTab === "allGroups" || activeTab === "myGroups") && (
          loadingGroups ? (
            <View style={s.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : groups.length === 0 ? (
            <View style={s.center}>
              <Text style={s.emptyText}>No groups found</Text>
            </View>
          ) : (
            <View style={s.groupsList}>
              <FlatList
                data={groups}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderGroupCard}
                scrollEnabled={false}
              />
            </View>
          )
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingBottom: 70 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  greeting: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  greetingSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { justifyContent: "center", alignItems: "center" },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },
  createBtnText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  titleBlock: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16 },
  title: { color: Colors.text, fontSize: 22, fontWeight: "800", letterSpacing: 0.3 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 18,
    height: 48,
    backgroundColor: Colors.card,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14 },
  tabsScroll: { marginBottom: 12 },
  tabsContent: { paddingHorizontal: 18, gap: 10 },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: Colors.black, fontWeight: "700" },
  filterScroll: { marginBottom: 16 },
  filterContent: { paddingHorizontal: 18, gap: 8 },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600" },
  filterChipTextActive: { color: Colors.black },
  center: { paddingTop: 60, alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  eventCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  eventImageWrap: { position: "relative", height: 180 },
  eventImage: { width: "100%", height: "100%" },
  eventImagePlaceholder: {
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(85,85,85,0.8)",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  categoryTagText: { color: Colors.text, fontSize: 12, fontWeight: "600" },
  eventBody: { padding: 14 },
  eventTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  eventMetaText: { color: Colors.textSecondary, fontSize: 12 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textSecondary },
  hostRow: { flexDirection: "row", alignItems: "center", gap: 8,  marginBottom: 10 },
  hostAvatar: { width: 20, height: 20, borderRadius: 10 },
  hostAvatarPlaceholder: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  hostText: { color: Colors.textSecondary, fontSize: 12 },
  hostName: { color: Colors.text, fontWeight: "600" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  progressText: { color: Colors.text, fontSize: 12, fontWeight: "600", minWidth: 70 },
  progressTrack: { flex: 1, height: 4, backgroundColor: Colors.cardBorder, borderRadius: 2 },
  progressFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 2 },
  eventActions: { flexDirection: "row", gap: 10 },
  joinBtn: {
    flex: 1,
    height: 44,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  joinBtnText: { color: Colors.black, fontSize: 14, fontWeight: "700" },
  leaveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 50,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  leaveBtnText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  detailsBtn: {
    flex: 1,
    height: 44,
    borderRadius: 50,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsBtnText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  groupsList: { paddingHorizontal: 18, gap: 14 },
  groupCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    gap: 12,
    marginBottom: 14,
  },
  groupCardTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 4 },
  groupAvatarWrap: { width: 56, height: 56 },
  groupAvatar: { width: 56, height: 56, borderRadius: 12 },
  groupAvatarPlaceholder: {
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  groupAvatarsRow: { position: "relative", height: 44 },
  groupMemberAvatar: {
    position: "absolute",
    borderWidth: 2,
    borderColor: Colors.card,
    overflow: "hidden",
  },
  groupMemberAvatarPlaceholder: {
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  groupInfo: { flex: 1 },
  groupName: { color: Colors.text, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  groupDesc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  groupMembers: { color: Colors.textMuted, fontSize: 11, marginTop: 3 },
  groupActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  groupActionBtnText: { color: Colors.black, fontSize: 14, fontWeight: "700" },
});
