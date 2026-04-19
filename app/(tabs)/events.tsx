import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const EVENTS = [
  {
    id: "e1",
    title: "SUNSET YOGA SESSION",
    category: "Yoga",
    date: "Today",
    time: "7:00 PM",
    venue: "Zen Yoga Studio",
    distance: "1.2 mi",
    host: "Sarah Chen",
    hostAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    joined: 12,
    total: 15,
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
  },
  {
    id: "e2",
    title: "PICKUP BASKETBALL",
    category: "Basketball",
    date: "Tomorrow",
    time: "7:15 PM",
    venue: "Downtown Courts",
    distance: "2.2 mi",
    host: "Jake Williams",
    hostAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    joined: 8,
    total: 15,
    image:
      "https://images.unsplash.com/photo-1546519638405-a5f7678bdfae?w=600&q=80",
  },
  {
    id: "e3",
    title: "BOXING FUNDAMENTALS",
    category: "Boxing",
    date: "Sat, Feb 29",
    time: "10:15 PM",
    venue: "Elit Boxing gym",
    distance: "0.2 mi",
    host: "Marcus Johnson",
    hostAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
    joined: 6,
    total: 12,
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80",
  },
];

const GROUPS = [
  {
    id: "g1",
    name: "Sports Club Group",
    desc: "Great seeing you. i have to go now. I'll talk to you late.",
    avatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=120&q=80",
    memberAvatars: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80",
    ],
  },
  {
    id: "g2",
    name: "Sports Club Group",
    desc: "Great seeing you. i have to go now. I'll talk to you late.",
    avatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=120&q=80",
    memberAvatars: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80",
    ],
  },
  {
    id: "g3",
    name: "Sports Club Group",
    desc: "Great seeing you. i have to go now. I'll talk to you late.",
    avatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=120&q=80",
    memberAvatars: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80",
    ],
  },
  {
    id: "g4",
    name: "Sports Club Group",
    desc: "Great seeing you. i have to go now. I'll talk to you late.",
    avatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=120&q=80",
    memberAvatars: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
    ],
  },
  {
    id: "g5",
    name: "Sports Club Group",
    desc: "Great seeing you. i have to go now. I'll talk to you late.",
    avatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=120&q=80",
    memberAvatars: [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80",
    ],
  },
];

type Tab = "events" | "allGroups" | "myGroups";

export default function EventsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [search, setSearch] = useState("");

  const tabs: { key: Tab; label: string }[] = [
    { key: "events", label: "All Events" },
    { key: "allGroups", label: "All Groups" },
    { key: "myGroups", label: "My Groups" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hi, Nicholas</Text>
          <Text style={s.greetingSub}>
            {activeTab === "events" ? "Find an event" : "joined the event"}
          </Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="search-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.createBtn}
            onPress={() => router.push("/events/group-create")}
          >
            <Ionicons name="calendar-outline" size={16} color={Colors.text} />
            <Text style={s.createBtnText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={s.titleBlock}>
          <Text style={s.title}>EVENTS & GROUPS</Text>
          <Text style={s.subtitle}>
            Join local sports activities and meet new people
          </Text>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons
            name="search-outline"
            size={17}
            color={Colors.textSecondary}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Search ."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tabs */}
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
              <Text
                style={[s.tabText, activeTab === tab.key && s.tabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Events List */}
        {activeTab === "events" &&
          EVENTS.map((event) => (
            <View key={event.id} style={s.eventCard}>
              <View style={s.eventImageWrap}>
                <Image
                  source={{ uri: event.image }}
                  style={s.eventImage}
                  resizeMode="cover"
                />
                <View style={s.categoryTag}>
                  <Text style={s.categoryTagText}>{event.category}</Text>
                </View>
              </View>
              <View style={s.eventBody}>
                <Text style={s.eventTitle}>{event.title}</Text>
                <View style={s.eventMeta}>
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color={Colors.textSecondary}
                  />
                  <Text style={s.eventMetaText}>{event.date}</Text>
                  <View style={s.metaDot} />
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={Colors.textSecondary}
                  />
                  <Text style={s.eventMetaText}>{event.time}</Text>
                </View>
                <View style={s.eventMeta}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={Colors.textSecondary}
                  />
                  <Text style={s.eventMetaText}>{event.venue}</Text>
                  <View style={s.metaDot} />
                  <Text style={s.eventMetaText}>{event.distance}</Text>
                </View>
                <View style={s.hostRow}>
                  <Image
                    source={{ uri: event.hostAvatar }}
                    style={s.hostAvatar}
                  />
                  <Text style={s.hostText}>
                    Hosted by <Text style={s.hostName}>{event.host}</Text>
                  </Text>
                </View>
                {/* Progress */}
                <View style={s.progressRow}>
                  <Ionicons
                    name="people-outline"
                    size={14}
                    color={Colors.primary}
                  />
                  <Text style={s.progressText}>
                    {String(event.joined).padStart(2, "0")}/{event.total} joined
                  </Text>
                  <View style={s.progressTrack}>
                    <View
                      style={[
                        s.progressFill,
                        { width: `${(event.joined / event.total) * 100}%` },
                      ]}
                    />
                  </View>
                </View>
                {/* Actions */}
                <View style={s.eventActions}>
                  <TouchableOpacity
                    style={s.joinBtn}
                    onPress={() => router.push("/events/event-details")}
                  >
                    <Text style={s.joinBtnText}>Join Event</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.detailsBtn}
                    onPress={() => router.push("/events/event-details")}
                  >
                    <Text style={s.detailsBtnText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

        {/* All Groups / My Groups List */}
        {(activeTab === "allGroups" || activeTab === "myGroups") && (
          <View style={s.groupsList}>
            {GROUPS.map((group) => (
              <View key={group.id} style={s.groupCard}>
                <View style={s.groupCardTop}>
                  <View style={s.groupAvatarStack}>
                    {group.memberAvatars.slice(0, 3).map((av, i) => (
                      <Image
                        key={i}
                        source={{ uri: av }}
                        style={[
                          s.stackAvatar,
                          { marginLeft: i === 0 ? 0 : -14, zIndex: 3 - i },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={s.groupInfo}>
                    <Text style={s.groupName}>{group.name}</Text>
                    <Text style={s.groupDesc} numberOfLines={2}>
                      {group.desc}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={s.groupActionBtn}
                  onPress={() =>
                    router.push(
                      activeTab === "myGroups"
                        ? "/events/group-detail?admin=true"
                        : "/events/group-detail",
                    )
                  }
                >
                  <Text style={s.groupActionBtnText}>
                    {activeTab === "myGroups" ? "View" : "Join Group"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
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
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
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
  tabsScroll: { marginBottom: 20 },
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
  categoryTag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(20,22,26,0.8)",
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
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  eventMetaText: { color: Colors.textSecondary, fontSize: 12 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  hostAvatar: { width: 24, height: 24, borderRadius: 12 },
  hostText: { color: Colors.textSecondary, fontSize: 12 },
  hostName: { color: Colors.text, fontWeight: "600" },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  progressText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600",
    minWidth: 70,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.cardBorder,
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
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
  },
  groupCardTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  groupAvatarStack: { flexDirection: "row", alignItems: "center" },
  stackAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  groupInfo: { flex: 1 },
  groupName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  groupDesc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  groupActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  groupActionBtnText: { color: Colors.black, fontSize: 14, fontWeight: "700" },
});
