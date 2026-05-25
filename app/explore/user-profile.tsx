import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import { PostCard, ApiPost } from "../../components/feature-explore/PostCard";
import CommentsSheet from "../../components/feature-explore/CommentsSheet";
import { Avatar } from "../../components/primitives/Avatar";

type UserProfile = {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
  bio: string;
  location: string;
  joined: string;
  role: string;
};

type Stats = { posts: number; followers: number; following: number };

export default function UserProfileScreen() {
  const router = useRouter();
  const { user_id, name } = useLocalSearchParams<{ user_id?: string; name?: string }>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [is_me, setIsMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user_id) return;
    setLoading(true);
    try {
      const res = await userService.getUserProfile(Number(user_id));
      const data = res.data?.data ?? res.data;
      setProfile(data.profile);
      setStats(data.stats);
      setPosts(data.posts ?? []);
      setIsFollowing(data.is_following ?? false);
      setIsMe(data.is_me ?? false);
    } catch (e) {
      console.log("[UserProfile] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleFollow = async () => {
    const prev = isFollowing;
    setIsFollowing(!prev);
    try {
      if (prev) {
        await postService.unfollowUser(Number(user_id));
      } else {
        await postService.followUser(Number(user_id));
      }
    } catch {
      setIsFollowing(prev);
    }
  };

  const handleLike = useCallback((id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) }
          : p
      )
    );
    postService.likePost(id).catch(() => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) }
            : p
        )
      );
    });
  }, []);

  const handleSave = useCallback((id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) }
          : p
      )
    );
    postService.savePost(id).catch(() => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) }
            : p
        )
      );
    });
  }, []);

  const handleShare = useCallback((id: number) => {
    postService.sharePost(id).catch(() => {});
  }, []);

  const handleComment = useCallback((id: number) => {
    setCommentPostId(id);
  }, []);

  const handleFollowFromCard = useCallback((_postId: number, authorId: number, following: boolean) => {
    if (authorId === Number(user_id)) {
      setIsFollowing(!following);
      if (following) {
        postService.unfollowUser(authorId).catch(() => setIsFollowing(following));
      } else {
        postService.followUser(authorId).catch(() => setIsFollowing(following));
      }
      fetchProfile();
    }
  }, [fetchProfile, user_id]);

  const displayName = profile?.name ?? decodeURIComponent(name ?? "Profile");

  const renderHeader = () => (
    <View>
      {/* Profile info */}
      <View style={styles.profileCard}>
        <Avatar uri={profile?.avatar} size={72} borderWidth={2.5} />
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{profile?.username ?? displayName}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.posts ?? 0}</Text>
              <Text style={styles.statLabel}>posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.followers ?? 0}</Text>
              <Text style={styles.statLabel}>followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.following ?? 0}</Text>
              <Text style={styles.statLabel}>following</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bio */}
      {(profile?.bio || profile?.location || profile?.joined) ? (
        <View style={styles.bioCard}>
          {!!profile?.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
          <View style={styles.bioMeta}>
            {!!profile?.location && (
              <View style={styles.bioMetaItem}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.bioMetaText}>{profile.location}</Text>
              </View>
            )}
            {!!profile?.joined && (
              <View style={styles.bioMetaItem}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.bioMetaText}>{profile.joined}</Text>
              </View>
            )}
          </View>
        </View>
      ) : null}

      {/* Actions */}
      {!is_me && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={handleFollow}
            activeOpacity={0.85}
          >
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        <TouchableOpacity
          style={styles.messageBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push(
              `/chat/id?user_id=${user_id}&name=${encodeURIComponent(displayName)}`
            )
          }
        >
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>
      </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <PostCard
              item={{ ...item, is_following: isFollowing }}
              router={router}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
              onFollow={handleFollowFromCard}
              onComment={handleComment}
              hideFollowBtn
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="images-outline" size={42} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          }
        />
      )}

      <CommentsSheet
        visible={commentPostId !== null}
        postId={commentPostId ?? 0}
        onClose={() => setCommentPostId(null)}
        onCommentAdded={() =>
          setPosts((prev) =>
            prev.map((p) =>
              p.id === commentPostId ? { ...p, comments: (p.comments ?? 0) + 1 } : p
            )
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { flex: 1, textAlign: "center", color: Colors.text, fontSize: 18, fontWeight: "700" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2.5, borderColor: "#7B61FF" },
  avatarPlaceholder: { backgroundColor: Colors.card, justifyContent: "center", alignItems: "center" },
  profileInfo: { flex: 1 },
  username: { color: Colors.text, fontSize: 16, fontWeight: "700", marginBottom: 10 },
  statsRow: { flexDirection: "row", gap: 20 },
  statItem: { alignItems: "center" },
  statValue: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  statLabel: { color: Colors.textSecondary, fontSize: 12 },
  bioCard: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  bioText: { color: Colors.text, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  bioMeta: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  bioMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  bioMetaText: { color: Colors.textSecondary, fontSize: 13 },
  actionRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  followBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.modalHeader,
    justifyContent: "center",
    alignItems: "center",
  },
  followingBtn: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  followBtnText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
  followingBtnText: { color: Colors.text },
  messageBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBtnText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
});
