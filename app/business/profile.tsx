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
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import LocationsIcon from "../../assets/icons/locations.svg";

const BUSINESS_EVENTS = [
  {
    id: "e1",
    title: "Complete Yoga for Beginners",
    desc: "Build flexibility, posture, and daily movement confidence in 6 weeks.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    lessons: 24,
    stars: 4,
    reviews: 327,
    enrolled: 820,
    price: 49,
  },
  {
    id: "e2",
    title: "Strength and Mobility Program",
    desc: "A balanced training plan for stamina, mobility, and core strength.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    lessons: 18,
    stars: 5,
    reviews: 198,
    enrolled: 540,
    price: 39,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < count ? "star" : "star-outline"}
          size={13}
          color={Colors.primary}
        />
      ))}
    </View>
  );
}

export default function BusinessProfileScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "event">("about");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
            <Text style={styles.backText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/settings/setting" as any)}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
            }}
            style={styles.heroImage}
          />
        </View>

        <View style={styles.profileRow}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Sarah Johnson</Text>
            <Text style={styles.role}>Certified Yoga & Fitness Coach</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1,247</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>08</Text>
            <Text style={styles.statLabel}>Course</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>9.2</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push("/business/create-event")}
        >
          <Ionicons name="add" size={18} color={Colors.white} />
          <Text style={styles.createBtnText}>Create New Event</Text>
        </TouchableOpacity>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "about" && styles.tabBtnActive]}
            onPress={() => setTab("about")}
          >
            <Text style={[styles.tabText, tab === "about" && styles.tabTextActive]}>
              About
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "event" && styles.tabBtnActive]}
            onPress={() => setTab("event")}
          >
            <Text style={[styles.tabText, tab === "event" && styles.tabTextActive]}>
              Event
            </Text>
          </TouchableOpacity>
        </View>

        {tab === "about" ? (
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>About</Text>
            <Text style={styles.aboutBody}>
              Certified yoga instructor with 8+ years of experience. Focused on
              mindful movement, flexibility, and sustainable strength for all
              fitness levels.
            </Text>
            <View style={styles.locationRow}>
              <LocationsIcon width={16} height={16} color={Colors.primary} />
              <Text style={styles.locationText}>Dhaka, Bangladesh</Text>
            </View>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {BUSINESS_EVENTS.map((eventItem) => (
              <TouchableOpacity
                key={eventItem.id}
                style={styles.eventCard}
                onPress={() => router.push("/business/event-detail")}
                activeOpacity={0.85}
              >
                <Image source={{ uri: eventItem.image }} style={styles.eventImage} />
                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle}>{eventItem.title}</Text>
                  <Text style={styles.eventDesc} numberOfLines={2}>
                    {eventItem.desc}
                  </Text>
                  <View style={styles.eventMetaRow}>
                    <StarRating count={eventItem.stars} />
                    <Text style={styles.metaText}>({eventItem.reviews})</Text>
                    <Text style={styles.metaText}>{eventItem.lessons} lessons</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>${eventItem.price}</Text>
                    <Text style={styles.metaText}>{eventItem.enrolled} enrolled</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  heroBanner: { height: 180, borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  heroImage: { width: "100%", height: "100%" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileInfo: { flex: 1 },
  name: { color: Colors.text, fontSize: 18, fontWeight: "800" },
  role: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.secondaryCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 10,
  },
  statValue: { color: Colors.text, fontSize: 18, fontWeight: "800" },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  createBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.modalHeader,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },
  createBtnText: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.black, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: Colors.black, fontWeight: "700" },
  aboutCard: {
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
  },
  aboutTitle: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  aboutBody: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  locationText: { color: Colors.textSecondary, fontSize: 13 },
  eventsList: { gap: 12 },
  eventCard: {
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },
  eventImage: { width: "100%", height: 130 },
  eventBody: { padding: 12 },
  eventTitle: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  eventDesc: { color: Colors.textSecondary, fontSize: 12, marginTop: 4, marginBottom: 8 },
  eventMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  metaText: { color: Colors.textSecondary, fontSize: 12 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceText: { color: Colors.primary, fontSize: 16, fontWeight: "800" },
});
