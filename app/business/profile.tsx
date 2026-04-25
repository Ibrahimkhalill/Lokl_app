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
import StudentsIcon from "../../assets/icons/students.svg";
import CourseIcon from "../../assets/icons/course.svg";
import DollarIcon from "../../assets/icons/dollar.svg";

const BUSINESS_EVENTS = [
  {
    id: "e1",
    title: "Complete Yoga for Beginners",
    desc: "Build flexibility, posture, and daily movement confidence in 6 weeks.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    lessons: 12,
    weeks: 4,
    stars: 4,
    reviews: 89,
    enrolled: 234,
    price: 1500,
  },
  {
    id: "e2",
    title: "Strength and Mobility Program",
    desc: "A balanced training plan for stamina, mobility, and core strength.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    lessons: 14,
    weeks: 6,
    stars: 5,
    reviews: 122,
    enrolled: 310,
    price: 1800,
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
  const [tab, setTab] = useState<"about" | "event" | "earning">("about");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
            }}
            style={styles.heroImage}
          />
        </View>

        <View style={styles.topSection}>
          <View style={styles.profileRow}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
              }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>Sarah Johnson</Text>
              <Text style={styles.role}>
                Certified Yoga & Fitness Instructor
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <StudentsIcon width={16} height={16} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>1,247</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconCircle}>
                <CourseIcon width={16} height={16} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>08</Text>
              <Text style={styles.statLabel}>Course</Text>
            </View>
            <View style={styles.scoreBlock}>
              <View style={styles.coachPill}>
                <Text style={styles.coachPillText}>Coach</Text>
              </View>
              <View style={styles.scorePill}>
                <Text style={styles.scorePillText}>9.2</Text>
              </View>
              <Text style={styles.scoreSub}>287 reviews</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push("/business/create-event")}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
            <Text style={styles.createBtnText}>Create New Event</Text>
          </TouchableOpacity>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === "about" && styles.tabBtnActive]}
              onPress={() => setTab("about")}
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
              onPress={() => setTab("event")}
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

        {tab === "about" ? (
          <>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>About</Text>
              <Text style={styles.aboutBody}>
                Certified yoga instructor with 8+ years of experience.
                Passionate about helping people achieve their fitness goals
                through mindful movement and balanced nutrition. Specialized in
                Hatha Yoga, Vinyasa Flow, and strength training.
              </Text>
            </View>
            <View style={styles.locationCard}>
              <View style={styles.locationRow}>
                <LocationsIcon width={16} height={16} color={Colors.primary} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>Location</Text>
                  <Text style={styles.locationValue}>Dhaka, Bangladesh</Text>
                </View>
              </View>
            </View>
          </>
        ) : tab === "event" ? (
          <View style={styles.eventsList}>
            {BUSINESS_EVENTS.map((eventItem) => (
              <TouchableOpacity
                key={eventItem.id}
                style={styles.eventCard}
                onPress={() => router.push("/business/event-detail")}
                activeOpacity={0.85}
              >
                <View style={styles.eventImageWrap}>
                  <Image
                    source={{ uri: eventItem.image }}
                    style={styles.eventImage}
                  />
                  <View style={styles.eventOverlay} />
                  <View style={styles.publishedBadge}>
                    <Text style={styles.publishedText}>Published</Text>
                  </View>
                  <View style={styles.eventTopMeta}>
                    <Text style={styles.eventTitle}>{eventItem.title}</Text>
                    <View style={styles.eventTopMetaRow}>
                      <Ionicons
                        name="play-outline"
                        size={14}
                        color={Colors.text}
                      />
                      <Text style={styles.eventTopMetaText}>
                        {eventItem.lessons} lessons
                      </Text>
                      <Ionicons
                        name="time-outline"
                        size={15}
                        color={Colors.text}
                      />
                      <Text style={styles.eventTopMetaText}>
                        {eventItem.weeks} weeks
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.eventBody}>
                  <Text style={styles.eventDesc} numberOfLines={2}>
                    {eventItem.desc}
                  </Text>
                  <View style={styles.eventMetaRow}>
                    <View style={styles.starsRow}>
                      <StarRating count={eventItem.stars} />
                      <Text style={styles.metaText}>({eventItem.reviews})</Text>
                    </View>

                    <View style={styles.enrolledRow}>
                      <StudentsIcon
                        width={16}
                        height={16}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.metaText}>
                        {eventItem.enrolled} enrolled
                      </Text>
                    </View>
                  </View>
                  <View style={styles.priceRow}>
                    <View style={styles.priceLeft}>
                      <DollarIcon
                        width={16}
                        height={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.priceText}>${eventItem.price}</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteBtn}>
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.earningsCard}>
            <View style={styles.earningsRow}>
              <View style={styles.earningsIconWrap}>
                <DollarIcon width={18} height={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.earningsTitle}>Total Earnings</Text>
                <Text style={styles.earningsValue}>$12,840</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 120 },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  heroBanner: { height: 240, overflow: "hidden" },
  heroImage: { width: "100%", height: "100%" },
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
    marginTop: -22,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  profileInfo: { flex: 1, marginTop: 10 },
  name: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  role: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  statIconCircle: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  scoreBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  coachPill: {
    backgroundColor: "#248BFF",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  coachPillText: { color: Colors.white, fontSize: 10, fontWeight: "700" },
  scorePill: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  scorePillText: { color: Colors.black, fontSize: 14, fontWeight: "700" },
  scoreSub: { color: Colors.textSecondary, fontSize: 10 },
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
  tabRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
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
  aboutCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 14,
  },
  locationCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    justifyContent: "center",
  },
  locationInfo: { flex: 1, gap: 4 },
  aboutTitle: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  aboutBody: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  locationText: { color: Colors.textSecondary, fontSize: 13 },
  locationValue: { color: Colors.text, fontSize: 13 },
  eventsList: { gap: 12, paddingHorizontal: 20 },
  eventCard: {
    backgroundColor: Colors.secondaryCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },
  eventImageWrap: { position: "relative", height: 190 },
  eventImage: { width: "100%", height: "100%" },
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  publishedBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(60,63,72,0.95)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  publishedText: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  eventTopMeta: { position: "absolute", left: 14, right: 14, bottom: 14 },
  eventTopMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  eventTopMetaText: { color: Colors.text, fontSize: 16 },
  eventBody: { padding: 12 },
  eventTitle: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  eventDesc: {
    color: Colors.textSecondary,
    fontSize: 13,

    marginTop: 12,
    marginBottom: 14,
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  metaText: { color: Colors.textSecondary, fontSize: 13 },
  enrolledRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  priceText: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  deleteBtn: {
    marginTop: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(90,94,106,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  earningsCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
  },
  earningsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  earningsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(209,255,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  earningsTitle: { color: Colors.textSecondary, fontSize: 12 },
  earningsValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
});
