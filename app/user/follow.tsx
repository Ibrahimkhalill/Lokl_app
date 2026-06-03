import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import { EmptyState } from "../../components/primitives";
import { PostCard, ApiPost } from "../../components/feature-explore/PostCard";
import CommentsSheet from "../../components/feature-explore/CommentsSheet";

type Tab = "posts" | "followers" | "following";

type FollowUser = {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
};

type MeData = {
  profile: { id: number; name: string; username: string | null; avatar: string | null };
  stats: { posts: number; followers: number; following: number };
  posts: ApiPost[];
  followers: FollowUser[];
  following: FollowUser[];
};

function UserAvatar({ uri, size }: { uri: string | null; size: number }) {
  return (
    <LinearGradient
      colors={["#0077FF", "#F635DD"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, padding: 2 }}
    >
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        overflow: "hidden", backgroundColor: Colors.card,
        justifyContent: "center", alignItems: "center",
      }}>
        {uri
          ? <Image source={{ uri }} style={{ width: size, height: size }} />
          : <Ionicons name="person" size={size * 0.45} color={Colors.textSecondary} />
        }
      </View>
    </LinearGradient>
  );
}

export default function FollowScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<Tab>((tab as Tab) ?? "followers");

  const [meData, setMeData] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [commentPostId, setCommentPostId] = useState<number | null>(null);

  const fetchMe = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await userService.getMe();
      const d = res.data?.data ?? res.data;
      setMeData(d);
      const ids = new Set<number>((d.following ?? []).map((u: FollowUser) => u.id));
      setFollowingIds(ids);
    } catch (e) {
      console.log("[Follow] error:", getErrorMessage(e));
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

  const handleShare = useCallback((id: number) => {
    postService.sharePost(id).catch(() => {});
  }, []);

  const handleToggleFollow = useCallback(async (userId: number) => {
    const alreadyFollowing = followingIds.has(userId);
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (alreadyFollowing) next.delete(userId); else next.add(userId);
      return next;
    });
    if (activeTab === "following" && alreadyFollowing) {
      setMeData((prev) =>
        prev ? { ...prev, following: prev.following.filter((u) => u.id !== userId) } : prev
      );
    }
    try {
      if (alreadyFollowing) await postService.unfollowUser(userId);
      else await postService.followUser(userId);
    } catch {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (alreadyFollowing) next.add(userId); else next.delete(userId);
        return next;
      });
      if (activeTab === "following" && alreadyFollowing) fetchMe();
    }
  }, [followingIds, activeTab, fetchMe]);

  const profile = meData?.profile;
  const stats = meData?.stats;

  const TABS: { key: Tab; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
  ];

  const renderHeader = () => (
    <View>
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.navigate("/(tabs)/profile")}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.profileRow}>
          <UserAvatar uri={profile?.avatar ?? null} size={60} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{profile?.username ?? profile?.name ?? ""}</Text>
            <View style={styles.statsRow}>
              {([
                { key: "posts", label: "posts", value: stats?.posts ?? 0 },
                { key: "followers", label: "followers", value: stats?.followers ?? 0 },
                { key: "following", label: "Following", value: stats?.following ?? 0 },
              ] as const).map((stat) => (
                <TouchableOpacity key={stat.key} onPress={() => setActiveTab(stat.key as Tab)}>
                  <View style={[styles.statBox, activeTab === stat.key && styles.statBoxActive]}>
                    <Text style={[styles.statNum, activeTab === stat.key && styles.statNumActive]}>
                      {stat.value}
                    </Text>
                    <Text style={[styles.statLabel, activeTab === stat.key && styles.statNumActive]}>
                      {stat.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      
    </View>
  );

  // ── Posts tab ──────────────────────────────────────────────────────────────
  if (activeTab === "posts") {
    const displayPosts = meData?.posts ?? [];
    return (
      <SafeAreaView style={styles.safe}>
        {loading ? (
          <>
            {renderHeader()}
            <View style={styles.center}><ActivityIndicator size="large" color={"#51A2FF"} /></View>
          </>
        ) : (
          <FlatList
            data={displayPosts}
            keyExtractor={(item) => String(item.id)}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchMe(true)} tintColor={"#51A2FF"} />}
            ListEmptyComponent={
              <EmptyState icon="images-outline" title="No posts yet" subtitle="This user hasn't shared anything yet" />
            }
            renderItem={({ item }) => (
              <PostCard
                item={item}
                router={router}
                onLike={handleLike}
                onSave={handleSave}
                onShare={handleShare}
                onFollow={() => {}}
                onComment={(id) => setCommentPostId(id)}
                hideFollowBtn
              />
            )}
          />
        )}

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

  // ── Followers / Following tab ───────────────────────────────────────────────
  const listData: FollowUser[] =
    activeTab === "followers" ? (meData?.followers ?? []) : (meData?.following ?? []);

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <>
          {renderHeader()}
          <View style={styles.center}><ActivityIndicator size="large" color={"#51A2FF"} /></View>
        </>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchMe(true)} tintColor={"#51A2FF"} />}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={activeTab === "followers" ? "No followers yet" : "Not following anyone"}
            />
          }
          renderItem={({ item }) => {
            const isOutline = activeTab === "followers" ? followingIds.has(item.id) : true;
            const label = activeTab === "followers"
              ? (followingIds.has(item.id) ? "Following" : "Follow Back")
              : "Unfollow";
            return (
              <View style={styles.userRow}>
                <UserAvatar uri={item.avatar} size={46} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  {!!item.username && <Text style={styles.userHandle}>@{item.username}</Text>}
                </View>
                <TouchableOpacity
                  style={[styles.actionBtn, isOutline && styles.actionBtnOutline]}
                  onPress={() => handleToggleFollow(item.id)}
                >
                  <Text style={[styles.actionBtnText, isOutline && styles.actionBtnTextOutline]}>{label}</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  listContent: { paddingBottom: 80 },

  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
    marginBottom: 14,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  profileInfo: { flex: 1 },
  username: { color: Colors.text, fontSize: 15, fontWeight: "700", marginBottom: 8 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statBox: {
    borderRadius: 8, paddingVertical: 4,
    alignItems: "center", borderWidth: 1,
    borderColor: Colors.cardBorder, width: 72,
  },
  statBoxActive: { backgroundColor: "#51A2FF", borderColor: "#51A2FF" },
  statNum: { color: Colors.white, fontSize: 13, fontWeight: "800", textAlign: "center" },
  statNumActive: { color: Colors.white },
  statLabel: { color: Colors.white, fontSize: 12, textAlign: "center" },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    marginBottom: 4,
  },
  tabItem: {
    flex: 1, paddingVertical: 12, alignItems: "center",
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: "#51A2FF" },
  tabLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: "600" },
  tabLabelActive: { color: "#51A2FF" },

  userRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10, gap: 12,
  },
  userInfo: { flex: 1 },
  userName: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  userHandle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  actionBtn: {
    backgroundColor: "#51A2FF", borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  actionBtnOutline: {
    backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.cardBorder,
  },
  actionBtnText: { color: Colors.white, fontSize: 12, fontWeight: "600" },
  actionBtnTextOutline: { color: Colors.text },
});
