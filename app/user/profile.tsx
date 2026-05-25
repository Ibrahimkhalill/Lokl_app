import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import BussinessIcon from "../../assets/icons/bussiness.svg";
import DateIcon from "../../assets/icons/date.svg";
import EditIcon from "../../assets/icons/edit.svg";
import FireIcon from "../../assets/icons/fire.svg";
import IncreaseIcon from "../../assets/icons/increase.svg";
import LocationsIcon from "../../assets/icons/locations.svg";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import { Avatar } from "../../components/primitives/Avatar";
import { PostCard, ApiPost } from "../../components/feature-explore/PostCard";
import CommentsSheet from "../../components/feature-explore/CommentsSheet";

type MeProfile = {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
  bio: string;
  location: string;
  joined: string;
  role: string;
};

type MeStats = { posts: number; followers: number; following: number };
type WeekDay = { day: string; pct: number };
type ActivityStats = {
  activities: number;
  visited: number;
  weekly_activity: WeekDay[];
  weekly_pct: number;
};

type MeData = {
  profile: MeProfile;
  stats: MeStats;
  activity_stats: ActivityStats;
  posts: ApiPost[];
  saved_posts: ApiPost[];
};

const MAX_BAR_HEIGHT = 120;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [meData, setMeData] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);

  const fetchMe = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await userService.getMe();
      const d = res.data?.data ?? res.data;
      setMeData(d);
    } catch (e) {
      console.log("[Profile] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchMe(); }, [fetchMe]));

  const updatePosts = useCallback((id: number, updater: (p: ApiPost) => ApiPost) => {
    setMeData((prev) => prev ? {
      ...prev,
      posts: prev.posts.map((p) => p.id === id ? updater(p) : p),
      saved_posts: prev.saved_posts.map((p) => p.id === id ? updater(p) : p),
    } : prev);
  }, []);

  const handleLike = useCallback((id: number) => {
    updatePosts(id, (p) => ({ ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) }));
    postService.likePost(id).catch(() =>
      updatePosts(id, (p) => ({ ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) }))
    );
  }, [updatePosts]);

  const handleSave = useCallback((id: number) => {
    updatePosts(id, (p) => ({ ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) }));
    postService.savePost(id).catch(() =>
      updatePosts(id, (p) => ({ ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) }))
    );
  }, [updatePosts]);

  const handleShare = useCallback((id: number) => { postService.sharePost(id).catch(() => {}); }, []);
  const handleComment = useCallback((id: number) => setCommentPostId(id), []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const profile = meData?.profile;
  const stats = meData?.stats;
  const activityStats = meData?.activity_stats;
  const weekDays = activityStats?.weekly_activity ?? [];
  const posts = meData?.posts ?? [];
  const savedPosts = meData?.saved_posts ?? [];
  const recentActivities = posts.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchMe(true)} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {profile?.name ?? "User"}</Text>
            <Text style={styles.subGreeting}>Welcome at profile!</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push("/settings/setting")}>
            <Ionicons name="settings-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileRow}>
          <Avatar uri={profile?.avatar} size={72} borderWidth={2} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{profile?.username ?? profile?.name ?? ""}</Text>
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push("/user/posts?tab=posts")}>
                <Text style={styles.statNum}>{stats?.posts ?? 0}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push("/user/follow?tab=followers")}>
                <Text style={styles.statNum}>{stats?.followers ?? 0}</Text>
                <Text style={styles.statLabel}>followers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push("/user/follow?tab=following")}>
                <Text style={styles.statNum}>{stats?.following ?? 0}</Text>
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
              Create a business profile to showcase your services, get reviews, and connect with more customers
            </Text>
          </View>
          <TouchableOpacity style={styles.businessBtn} onPress={() => router.push("/auth/business-signup")}>
            <Text style={styles.businessBtnText}>Create Business Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* Bio */}
        <Text style={styles.sectionLabel}>BIO</Text>
        <View style={styles.bioCard}>
          <View style={styles.bioRow}>
            <Text style={styles.bioText}>{profile?.bio || "No bio yet"}</Text>
            <TouchableOpacity onPress={() => router.push("/settings/edit-profile")}>
              <EditIcon width={24} height={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.bioMeta}>
            {!!profile?.location && (
              <View style={styles.bioMetaItem}>
                <LocationsIcon width={14} height={14} color={Colors.textSecondary} />
                <Text style={styles.bioMetaText}>{profile.location}</Text>
              </View>
            )}
            {!!profile?.joined && (
              <View style={styles.bioMetaItem}>
                <DateIcon width={14} height={14} color={Colors.textSecondary} />
                <Text style={styles.bioMetaText}>{profile.joined}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsGridItem}>
            <Text style={styles.statsGridNum}>{activityStats?.activities ?? 0}</Text>
            <Text style={styles.statsGridLabel}>Activities</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={styles.statsGridNum}>{activityStats?.visited ?? 0}</Text>
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
            {weekDays.map((item, i) => (
              <View key={i} style={styles.barWrap}>
                <View style={styles.barContainer}>
                  <LinearGradient
                    colors={["rgba(209,255,0,0.5)", "rgba(209,255,0,1)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.bar, { height: Math.max((item.pct / 100) * MAX_BAR_HEIGHT, 4) }]}
                  >
                    {item.pct > 10 && <Text style={styles.barLabel}>{item.pct}%</Text>}
                  </LinearGradient>
                </View>
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.activityPercent}>
            <Text style={{ color: Colors.primary }}>{activityStats?.weekly_pct ?? 0}%</Text> Activities this week
          </Text>
          <TouchableOpacity style={styles.streakBtn} onPress={() => router.push("/user/streaks")}>
            <FireIcon width={16} height={16} color={Colors.text} />
            <Text style={styles.streakBtnText}>View Streaks & Achievements</Text>
          </TouchableOpacity>
        </View>

        {/* Posts / Saved Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "posts" && styles.tabBtnActive]}
            onPress={() => setActiveTab("posts")}
          >
            <Text style={[styles.tabBtnText, activeTab === "posts" && styles.tabBtnTextActive]}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "saved" && styles.tabBtnActive]}
            onPress={() => setActiveTab("saved")}
          >
            <Text style={[styles.tabBtnText, activeTab === "saved" && styles.tabBtnTextActive]}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities — shown under Posts tab */}
        {activeTab === "posts" && (
          <>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>RECENT ACTIVITIES</Text>
              <TouchableOpacity onPress={() => router.push("/user/posts?tab=posts")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {recentActivities.length === 0 ? (
              <View style={styles.emptyActivity}>
                <Ionicons name="time-outline" size={32} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>No recent activity</Text>
              </View>
            ) : (
              recentActivities.map((item) => (
                <View key={item.id} style={styles.recentItem}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.recentImg} />
                  ) : (
                    <View style={[styles.recentImg, styles.recentImgPlaceholder]}>
                      <Ionicons name="document-text-outline" size={22} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentActivity} numberOfLines={1}>
                      {item.body || "Post"}
                    </Text>
                    {!!item.location && (
                      <Text style={styles.recentVenue} numberOfLines={1}>{item.location}</Text>
                    )}
                    <Text style={styles.recentTime}>{timeAgo(item.created_at)}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Saved Posts — shown under Saved tab */}
        {activeTab === "saved" && (
          <>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>SAVED POSTS</Text>
              <TouchableOpacity onPress={() => router.push("/user/posts?tab=saved")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {savedPosts.length === 0 ? (
              <View style={styles.emptyActivity}>
                <Ionicons name="bookmark-outline" size={32} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>No saved posts</Text>
              </View>
            ) : (
              savedPosts.slice(0, 3).map((item) => (
                <PostCard
                  key={item.id}
                  item={item}
                  router={router}
                  onLike={handleLike}
                  onSave={handleSave}
                  onShare={handleShare}
                  onFollow={() => {}}
                  onComment={handleComment}
                  hideFollowBtn
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <CommentsSheet
        visible={commentPostId !== null}
        postId={commentPostId ?? 0}
        onClose={() => setCommentPostId(null)}
        onCommentAdded={() =>
          setMeData((prev) => prev ? {
            ...prev,
            posts: prev.posts.map((p) =>
              p.id === commentPostId ? { ...p, comments: (p.comments ?? 0) + 1 } : p
            ),
          } : prev)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 120 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 20, paddingTop: 16, marginBottom: 20,
  },
  greeting: { color: Colors.text, fontSize: 20, fontWeight: "700" },
  subGreeting: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  settingsBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },

  profileRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 20, gap: 16,
  },
  profileInfo: { flex: 1 },
  username: { color: Colors.text, fontSize: 16, fontWeight: "700", marginBottom: 10 },
  statsRow: { flexDirection: "row", gap: 16 },
  statItem: { alignItems: "center" },
  statNum: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  statLabel: { color: Colors.textSecondary, fontSize: 11 },

  businessCard: {
    marginHorizontal: 20, marginBottom: 24, backgroundColor: Colors.card,
    borderRadius: 16, borderWidth: 1, borderColor: "#929292", padding: 16, gap: 12,
  },
  businessIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: "#00CCA8", justifyContent: "center", alignItems: "center",
  },
  businessText: {},
  businessTitle: { color: Colors.text, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  businessSub: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  businessBtn: {
    backgroundColor: Colors.primary, borderRadius: 16, height: 55,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", gap: 8, paddingHorizontal: 16, marginTop: 8,
  },
  businessBtnText: { color: Colors.black, fontSize: 14, fontWeight: "700" },

  sectionLabel: {
    color: Colors.text, fontSize: 13, fontWeight: "800",
    letterSpacing: 1, paddingHorizontal: 20, marginBottom: 10,
  },
  bioCard: {
    marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.secondaryCard,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder, padding: 14,
  },
  bioRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  bioText: { color: Colors.text, fontSize: 14, lineHeight: 20, flex: 1 },
  bioMeta: { flexDirection: "row", gap: 16 },
  bioMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  bioMetaText: { color: Colors.textSecondary, fontSize: 12 },

  statsGrid: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  statsGridItem: {
    flex: 1, backgroundColor: Colors.secondaryCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.cardBorder, padding: 16, alignItems: "center",
  },
  statsGridNum: { color: Colors.text, fontSize: 28, fontWeight: "800", marginBottom: 4 },
  statsGridLabel: { color: Colors.textSecondary, fontSize: 13 },

  activityHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, marginBottom: 12,
  },
  activityTitle: { color: Colors.text, fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  chartCard: {
    marginHorizontal: 20, marginBottom: 24, backgroundColor: Colors.secondaryCard,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder, padding: 16,
  },
  chart: {
    flexDirection: "row", alignItems: "flex-end", gap: 6,
    height: MAX_BAR_HEIGHT + 20, marginBottom: 12,
  },
  barWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 6 },
  barContainer: { flex: 1, width: "100%", justifyContent: "flex-end", alignItems: "center" },
  barLabel: { color: Colors.black, fontSize: 10, fontWeight: "600" },
  bar: {
    width: "100%", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    minHeight: 4, justifyContent: "flex-start", alignItems: "center", paddingTop: 6,
  },
  dayLabel: { color: Colors.textSecondary, fontSize: 10 },
  activityPercent: { color: Colors.text, fontSize: 13, textAlign: "center", marginBottom: 12 },
  streakBtn: {
    backgroundColor: "#FF6467", borderRadius: 50, height: 44,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
  },
  streakBtnText: { color: Colors.text, fontSize: 14, fontWeight: "600" },

  recentHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20, marginBottom: 10,
  },
  recentTitle: { color: Colors.text, fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  seeAll: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  emptyActivity: { alignItems: "center", gap: 8, paddingVertical: 24 },
  tabSectionHeader: {
    flexDirection: "row", alignItems: "center",
    paddingRight: 20, marginBottom: 4,
  },
  recentItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: Colors.secondaryCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.cardBorder, padding: 12,
  },
  recentImg: { width: 56, height: 56, borderRadius: 12 },
  recentImgPlaceholder: {
    backgroundColor: Colors.card, justifyContent: "center", alignItems: "center",
  },
  recentInfo: { flex: 1 },
  recentActivity: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  recentVenue: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  recentTime: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },

  tabRow: {
    flexDirection: "row", marginHorizontal: 20, marginVertical: 20,
    backgroundColor: Colors.white, borderRadius: 50,
    padding: 4, paddingHorizontal: 6,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  tabBtn: { flex: 1, height: 38, borderRadius: 50, justifyContent: "center", alignItems: "center" },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { color: Colors.black, fontSize: 14, fontWeight: "600" },
  tabBtnTextActive: { color: Colors.black },

  emptyPosts: { alignItems: "center", gap: 10, paddingVertical: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});
