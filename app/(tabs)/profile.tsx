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

import { LinearGradient } from "expo-linear-gradient";
import BussinessIcon from "../../assets/icons/bussiness.svg";
import DateIcon from "../../assets/icons/date.svg";
import EditIcon from "../../assets/icons/edit.svg";
import FireIcon from "../../assets/icons/fire.svg";
import IncreaseIcon from "../../assets/icons/increase.svg";
import LocationsIcon from "../../assets/icons/locations.svg";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ACTIVITY = [66, 5, 35, 50, 20, 3, 2];

const RECENT = [
  {
    id: "1",
    title: "Yoga",
    venue: "Zen Yoga Studio",
    time: "2 hours ago",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80",
  },
  {
    id: "2",
    title: "Boxing",
    venue: "Elite Boxing Gym",
    time: "Yesterday",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=200&q=80",
  },
  {
    id: "3",
    title: "Gym",
    venue: "Downtown Courts",
    time: "2 days ago",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=80",
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const MAX_HEIGHT = 300;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, Nicholas</Text>
            <Text style={styles.subGreeting}>Welcome at profile!</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/settings/setting" as any)}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
              }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>pixcraft_132</Text>
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push("/profile/posts")}
              >
                <Text style={styles.statNum}>2,644</Text>
                <Text style={styles.statLabel}>posts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push("/profile/follow?type=followers")}
              >
                <Text style={styles.statNum}>6,401</Text>
                <Text style={styles.statLabel}>followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push("/profile/follow?type=following")}
              >
                <Text style={styles.statNum}>2</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Business Banner */}
        <View style={styles.businessCard}>
          <View style={styles.businessIcon}>
            <BussinessIcon width={24} height={24} />
          </View>
          <View style={styles.businessText}>
            <Text style={styles.businessTitle}>Run a Business?</Text>
            <Text style={styles.businessSub}>
              Create a business profile to showcase your services, get reviews,
              and connect with more customers
            </Text>
          </View>
          <TouchableOpacity
            style={styles.businessBtn}
            onPress={() => router.push("/business/profile")}
          >
            <Text style={styles.businessBtnText}>Create Business Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* Bio */}
        <Text style={styles.sectionLabel}>BIO</Text>
        <View style={styles.bioCard}>
          <View style={styles.bioRow}>
            <Text style={styles.bioText}>
              Fitness enthusiast _Yoga lover_{"\n"}Always looking for the next
              challenge
            </Text>
            <TouchableOpacity>
              <EditIcon width={24} height={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.bioMeta}>
            <View style={styles.bioMetaItem}>
              <LocationsIcon
                width={14}
                height={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.bioMetaText}>San Francisco,CA</Text>
            </View>
            <View style={styles.bioMetaItem}>
              <DateIcon width={14} height={14} color={Colors.textSecondary} />
              <Text style={styles.bioMetaText}>joined Jan 2025</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsGridItem}>
            <Text style={styles.statsGridNum}>14</Text>
            <Text style={styles.statsGridLabel}>Activities</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={styles.statsGridNum}>20</Text>
            <Text style={styles.statsGridLabel}>Visited</Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.activityHeader}>
          <IncreaseIcon width={18} height={18} color={Colors.primary} />
          <Text style={styles.activityTitle}>THIS WEEK&apos;S ACTIVITY</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chart}>
            {ACTIVITY.map((val, i) => (
              <View key={i} style={styles.barWrap}>
                <View style={styles.barContainer}>
                  <LinearGradient
                    colors={["rgba(209,255,0,0.5)", "rgba(209,255,0,1)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                      styles.bar,
                      {
                        height: (val / 100) * MAX_HEIGHT,
                        justifyContent: "flex-start",
                        alignItems: "center",
                        paddingTop: 10,
                      },
                    ]}
                  >
                    {val > 10 && <Text style={styles.barLabel}>{val}%</Text>}
                  </LinearGradient>
                </View>

                <Text style={styles.dayLabel}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.activityPercent}>
            <Text style={{ color: Colors.primary }}>35%</Text> Activities this
            week
          </Text>
          <TouchableOpacity
            style={styles.streakBtn}
            onPress={() => router.push("/profile/streaks")}
          >
            <FireIcon width={16} height={16} color={Colors.text} />
            <Text style={styles.streakBtnText}>
              View Streaks & Achievements
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts / Saved Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "posts" && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab("posts")}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "posts" && styles.tabBtnTextActive,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "saved" && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab("saved")}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "saved" && styles.tabBtnTextActive,
              ]}
            >
              Saved
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>RECENT ACTIVITIES</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {RECENT.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.recentItem}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.image }} style={styles.recentImg} />
            <View style={styles.recentInfo}>
              <Text style={styles.recentActivity}>{item.title}</Text>
              <Text style={styles.recentVenue}>{item.venue}</Text>
              <Text style={styles.recentTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 20,
  },
  greeting: { color: Colors.text, fontSize: 20, fontWeight: "700" },
  subGreeting: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 2,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 36 },
  profileInfo: { flex: 1 },
  username: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  statsRow: { flexDirection: "row", gap: 16 },
  statItem: { alignItems: "center" },
  statNum: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  statLabel: { color: Colors.textSecondary, fontSize: 11 },

  businessCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#929292",
    padding: 16,
    gap: 12,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#00CCA8",
    justifyContent: "center",
    alignItems: "center",
  },
  businessText: {},
  businessTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  businessSub: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  businessBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 55,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  businessBtnText: { color: Colors.black, fontSize: 14, fontWeight: "700" },

  sectionLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  bioCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
  },
  bioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bioText: { color: Colors.text, fontSize: 14, lineHeight: 20, flex: 1 },
  bioMeta: { flexDirection: "row", gap: 16 },
  bioMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  bioMetaText: { color: Colors.textSecondary, fontSize: 12 },

  statsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGridItem: {
    flex: 1,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    alignItems: "center",
  },
  statsGridNum: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  statsGridLabel: { color: Colors.textSecondary, fontSize: 13 },

  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  activityTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },

  chartCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 12,
  },
  barWrap: { flex: 1, alignItems: "center", gap: 6 },
  barContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barLabel: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 4,
  },
  dayLabel: { color: Colors.textSecondary, fontSize: 10 },
  activityPercent: {
    color: Colors.text,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  streakBtn: {
    backgroundColor: "#FF6467",
    borderRadius: 50,
    height: 44,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  streakBtnText: { color: Colors.text, fontSize: 14, fontWeight: "600" },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 50,
    padding: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { color: Colors.black, fontSize: 14, fontWeight: "600" },
  tabBtnTextActive: { color: Colors.black },

  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  recentTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  seeAll: { color: Colors.primary, fontSize: 13, fontWeight: "600" },

  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
  },
  recentImg: { width: 56, height: 56, borderRadius: 12 },
  recentInfo: { flex: 1 },
  recentActivity: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  recentVenue: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  recentTime: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  iconShowcaseCard: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 24,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
  },
  iconShowcaseTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 8,
  },
  iconCell: {
    width: "23%",
    alignItems: "center",
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  iconName: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
});
