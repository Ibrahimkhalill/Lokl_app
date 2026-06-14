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
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
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
import type { ApiAchievementsData } from "../../components/feature-profile/streaks";

type MeProfile = {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
  bio: string;
  location: string;
  joined: string;
  role: string;
  sports_interests?: string[];
};

type MeStats = { posts: number; followers: number; following: number };
type ActivityStats = {
  activities: number;
  visited: number;
  active_days: string[];
};

type MeData = {
  profile: MeProfile;
  stats: MeStats;
  activity_stats: ActivityStats;
  posts: ApiPost[];
  saved_posts: ApiPost[];
};


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
  const [achievements, setAchievements] = useState<ApiAchievementsData | null>(null);

  const fetchMe = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [meRes, achRes] = await Promise.allSettled([
        userService.getMe(),
        userService.getAchievements(),
      ]);
      if (meRes.status === "fulfilled") {
        setMeData(meRes.value.data?.data ?? meRes.value.data);
      }
      if (achRes.status === "fulfilled") {
        const d = achRes.value.data?.data ?? achRes.value.data;
        setAchievements(d);
      }
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
  const activeDaySet = new Set(activityStats?.active_days ?? []);
  const calNow = new Date();
  const calYear = calNow.getFullYear();
  const calMonth = calNow.getMonth();
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  // Mon-first offset: Sun=0→6, Mon=1→0, Tue=2→1, ...
  const calFirstWeekday = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calToday = calNow.getDate();
  const calCells: (number | null)[] = [
    ...Array(calFirstWeekday).fill(null),
    ...Array.from({ length: calDaysInMonth }, (_, i) => i + 1),
  ];
  while (calCells.length % 7 !== 0) calCells.push(null);
  const fmtDay = (d: number) => {
    const mm = String(calMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${calYear}-${mm}-${dd}`;
  };
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
              <TouchableOpacity style={styles.statItem} onPress={() => router.push("/user/follow?tab=posts")}>
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

        {/* Interests */}
        {(profile?.sports_interests ?? []).length > 0 && (
          <>
            <Text style={styles.sectionLabel}>INTERESTS</Text>
            <View style={styles.interestsTags}>
              {profile!.sports_interests!.map((tag) => (
                <View key={tag} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </>
        )}

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

        {/* Monthly Activity Calendar */}
        <View style={styles.activityHeader}>
          <IncreaseIcon width={18} height={18} color={Colors.primary} />
          <Text style={styles.activityTitle}>THIS MONTH&apos;S ACTIVITY</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.calMonthLabel}>{MONTH_NAMES[calMonth]} {calYear}</Text>
          <View style={styles.calDayHeaders}>
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
              <Text key={i} style={styles.calDayHeader}>{d}</Text>
            ))}
          </View>
          <View style={styles.calGrid}>
            {calCells.map((day, i) => {
              const isActive = day !== null && activeDaySet.has(fmtDay(day));
              const isToday = day !== null && day === calToday;
              return (
                <View key={i} style={styles.calCellWrap}>
                  {day === null ? (
                    <View style={[styles.calCell, styles.calCellEmpty]} />
                  ) : isActive ? (
                    <LinearGradient
                      colors={["#D1FF00", "#A8CC00"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.calCell}
                    >
                      <Text style={styles.calCellTextActive}>{day}</Text>
                      <Ionicons name="flame-outline" size={9} color="#FF6900" style={styles.calFlame} />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.calCell, isToday && styles.calCellToday]}>
                      <Text style={styles.calCellText}>{day}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <TouchableOpacity style={styles.streakBtn} onPress={() => router.push("/user/streaks")}>
            <FireIcon width={16} height={16} color={Colors.text} />
            <Text style={styles.streakBtnText}>View Streaks & Achievements</Text>
          </TouchableOpacity>
        </View>

        {/* Achievements mini-row */}
        {achievements && achievements.unlocked > 0 && (
          <View style={styles.achRow}>
            <View style={styles.achRowHeader}>
              <Text style={styles.achRowTitle}>ACHIEVEMENTS</Text>
              <TouchableOpacity onPress={() => router.push("/user/streaks?tab=achievements")}>
                <Text style={styles.achRowSeeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.achBadges}>
              {achievements.achievements
                .filter((a) => a.unlocked)
                .slice(0, 6)
                .map((a) => (
                  <View key={a.id} style={styles.achBadge}>
                    <Ionicons name={a.icon as any} size={20} color={Colors.primary} />
                  </View>
                ))}
              {achievements.unlocked > 6 && (
                <View style={[styles.achBadge, styles.achBadgeMore]}>
                  <Text style={styles.achBadgeMoreText}>+{achievements.unlocked - 6}</Text>
                </View>
              )}
            </View>
          </View>
        )}

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
            <Text style={[styles.tabBtnText, activeTab === "saved" && styles.tabBtnTextActive]}>Want to Try</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities — shown under Posts tab */}
        {activeTab === "posts" && (
          <>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>RECENT ACTIVITIES</Text>
              {recentActivities.length > 0 && (
                <TouchableOpacity onPress={() => router.push("/user/follow?tab=posts")}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              )}
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
              {savedPosts.length > 0 && (
                <TouchableOpacity onPress={() => router.push("/user/posts?tab=saved")}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              )}
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
  bioMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, rowGap: 4 },
  bioMetaItem: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  bioMetaText: { color: Colors.textSecondary, fontSize: 12, flexShrink: 1 },

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
  calMonthLabel: {
    color: Colors.text, fontSize: 14, fontWeight: "700", marginBottom: 12,
  },
  calDayHeaders: { flexDirection: "row", marginBottom: 8 },
  calDayHeader: {
    flex: 1, textAlign: "center", color: "#6A7185", fontSize: 11,
  },
  calGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  calCellWrap: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  calCell: {
    flex: 1, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "#2A2A2A",
  },
  calCellToday: { borderWidth: 1, borderColor: Colors.primary },
  calCellText: { color: "#4B556A", fontSize: 12, fontWeight: "500" },
  calCellTextActive: { color: "#141516", fontSize: 12, fontWeight: "700" },
  calFlame: { position: "absolute", bottom: 1, right: 1 },
  calCellEmpty: { backgroundColor: "transparent" },
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

  achRow: {
    marginHorizontal: 20, marginBottom: 20, backgroundColor: Colors.secondaryCard,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder, padding: 14,
  },
  achRowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  achRowTitle: { color: Colors.text, fontSize: 13, fontWeight: "800", letterSpacing: 1 },
  achRowSeeAll: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  achBadges: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  achBadge: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "rgba(209,255,0,0.12)", borderWidth: 1, borderColor: "rgba(209,255,0,0.25)",
    justifyContent: "center", alignItems: "center",
  },
  achBadgeMore: { backgroundColor: Colors.card },
  achBadgeMoreText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "700" },

  interestsTags: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
    paddingHorizontal: 20, marginBottom: 20,
  },
  interestTag: {
    backgroundColor: Colors.secondaryCard, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  interestTagText: { color: Colors.text, fontSize: 13, fontWeight: "500" },
});
