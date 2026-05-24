import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import LocationIcon from "../../assets/icons/locations.svg";
import CommentsIcon from "../../assets/icons/comments.svg";
import NavigateIcon from "../../assets/icons/navigate.svg";

import BookmarkIcon from "../../assets/icons/bookmarks.svg";
import BookmarkFilledIcon from "../../assets/icons/bookmark-filled.svg";
import MessengerIcon from "../../assets/icons/messenger.svg";
import NotificationsIcon from "../../assets/icons/notifications.svg";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import CommentsSheet from "../../components/feature-explore/CommentsSheet";

const { width } = Dimensions.get("window");

type ApiPost = {
  id: number;
  author_id?: number;
  author_name?: string;
  author_avatar?: string | null;
  type?: string;
  tag?: string;
  body?: string;
  location?: string;
  image_url?: string | null;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  lokl_score?: string;
  is_liked?: boolean;
  is_saved?: boolean;
  is_following?: boolean;
  created_at: string;
  tagged_groups?: { id: number; name: string }[];
};


function PostCard({
  item,
  router,
  onLike,
  onSave,
  onShare,
  onFollow,
  onComment,
}: {
  item: ApiPost;
  router: any;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onShare: (id: number) => void;
  onFollow: (id: number, authorId: number, following: boolean) => void;
  onComment: (id: number) => void;
}) {
  const avatarUri = item.author_avatar || undefined;

  return (
    <View style={postStyles.card}>
      {/* Header: avatar + name + follow */}
      <View style={postStyles.header}>
        <TouchableOpacity
          style={postStyles.userRow}
          onPress={() => router.push("/explore/user-profile")}
          activeOpacity={0.8}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={postStyles.avatar} />
          ) : (
            <View style={[postStyles.avatar, postStyles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color={Colors.textSecondary} />
            </View>
          )}
          <Text style={postStyles.userName}>{item.author_name || ""}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[postStyles.followBtn, item.is_following && postStyles.followingBtn]}
          onPress={() => onFollow(item.id, item.author_id ?? 0, !!item.is_following)}
        >
          <Text style={[postStyles.followText, item.is_following && postStyles.followingText]}>
            {item.is_following ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tag + Location + Score */}
      <View style={postStyles.metaRow}>
        <View style={postStyles.metaLeft}>
          {item.tagged_groups && item.tagged_groups.length > 0 && (
            <>
              {item.tagged_groups.map((g) => (
                <TouchableOpacity key={g.id} onPress={() => router.push(`/events/group-detail?id=${g.id}`)}>
                  <Text style={postStyles.groupTagText}>@{g.name}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
          {!!item.location && (
            <View style={postStyles.locationWrap}>
              <LocationIcon width={13} height={13} color={Colors.textSecondary} />
              <Text style={postStyles.metaText}>{item.location}</Text>
            </View>
          )}
        </View>
        {!!item.lokl_score && (
          <View style={postStyles.scoreBadge}>
            <Text style={postStyles.scoreText}>{item.lokl_score}</Text>
          </View>
        )}
      </View>

      {!!item.body && (
        <Text style={postStyles.content} numberOfLines={3}>
          {item.body}
        </Text>
      )}

      {!!item.image_url && (
        <View style={postStyles.imageWrap}>
          <Image
            source={{ uri: item.image_url }}
            style={postStyles.postImage}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={postStyles.actions}>
        <TouchableOpacity style={postStyles.actionBtn} onPress={() => onLike(item.id)}>
          <Ionicons
            name={item.is_liked ? "heart" : "heart-outline"}
            size={20}
            color={item.is_liked ? "#FF4444" : Colors.text}
          />
          <Text
            style={postStyles.actionText}
            onPress={() => router.push(`/explore/post-likes?id=${item.id}`)}
          >
            {item.likes ?? 0} likes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionBtn} onPress={() => onComment(item.id)}>
          <CommentsIcon width={20} height={20} color={Colors.text} />
          <Text style={postStyles.actionText}>{item.comments ?? 0} comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionBtn} onPress={() => onShare(item.id)}>
          <NavigateIcon width={20} height={20} color={Colors.text} />
          <Text style={postStyles.actionText}>{item.shares ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionBtn} onPress={() => onSave(item.id)}>
          {item.is_saved ? (
            <BookmarkFilledIcon width={20} height={20} color={Colors.primary} />
          ) : (
            <BookmarkIcon width={20} height={20} color={Colors.text} />
          )}
          <Text style={postStyles.actionText}>{item.saves ?? 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const postStyles = StyleSheet.create({
  card: {
    paddingTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  metaLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  locationWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  tag: { color: Colors.textSecondary, fontSize: 13 },
  metaText: { color: Colors.textSecondary, fontSize: 13 },
  scoreBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  scoreText: { color: Colors.black, fontSize: 13, fontWeight: "800" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#7B61FF",
  },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  groupAvatarWrap: { width: 52, height: 42, position: "relative" },
  groupAvatar: { width: 42, height: 42, borderRadius: 10 },
  groupAvatarSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: "absolute",
    bottom: -4,
    right: -4,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  groupName: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  userName: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  userNameSmall: { color: Colors.textSecondary, fontSize: 12 },
  followBtn: {
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  followingBtn: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(123,97,255,0.1)",
  },
  followText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  followingText: { color: Colors.primary },
  content: {
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    lineHeight: 20,
  },
  imageWrap: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  postImage: { width: "100%", height: 200 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { color: Colors.textSecondary, fontSize: 12 },
  taggedGroupsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  groupTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(123,97,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  groupTagText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
});


export default function ExploreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"public" | "group">("public");

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshingPosts, setRefreshingPosts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [groupPosts, setGroupPosts] = useState<ApiPost[]>([]);
  const [loadingGroupPosts, setLoadingGroupPosts] = useState(false);
  const [refreshingGroupPosts, setRefreshingGroupPosts] = useState(false);

  const [commentPostId, setCommentPostId] = useState<number | null>(null);

  const fetchingRef = useRef(false);

  const fetchPosts = useCallback(async (refresh = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (refresh) setRefreshingPosts(true);
    else setLoadingPosts(true);
    try {
      const res = await postService.getFeed(1);
      const payload = res.data?.data ?? res.data;
      const results: ApiPost[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      setPosts(results);
      setNextUrl(payload?.next ?? null);
    } catch (e) {
      console.log("[Explore] fetchPosts error:", getErrorMessage(e));
    } finally {
      setLoadingPosts(false);
      setRefreshingPosts(false);
      fetchingRef.current = false;
    }
  }, []);

  const fetchMorePosts = useCallback(async () => {
    if (!nextUrl || loadingMore || fetchingRef.current) return;
    fetchingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await postService.getFeedByUrl(nextUrl);
      const payload = res.data?.data ?? res.data;
      const results: ApiPost[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      setPosts((prev) => [...prev, ...results]);
      setNextUrl(payload?.next ?? null);
      console.log("[Explore] fetchMorePosts nextUrl:", results);
    } catch (e) {
      console.log("[Explore] fetchMorePosts error:", getErrorMessage(e));
    } finally {
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [nextUrl, loadingMore]);

  const fetchGroupPosts = useCallback(async (refresh = false) => {
    if (refresh) setRefreshingGroupPosts(true);
    else setLoadingGroupPosts(true);
    try {
      const res = await postService.getGroupFeed(1);
      const payload = res.data?.data ?? res.data;
      const results: ApiPost[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      setGroupPosts(results);
    } catch (e) {
      console.log("[Explore] fetchGroupPosts error:", getErrorMessage(e));
    } finally {
      setLoadingGroupPosts(false);
      setRefreshingGroupPosts(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  useEffect(() => {
    if (activeTab === "group") {
      fetchGroupPosts();
    }
  }, [activeTab, fetchGroupPosts]);

  const handleLike = useCallback(async (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) }
          : p
      )
    );
    try {
      await postService.likePost(id);
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) }
            : p
        )
      );
    }
  }, []);

  const handleSave = useCallback(async (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) }
          : p
      )
    );
    try {
      await postService.savePost(id);
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) }
            : p
        )
      );
    }
  }, []);

  const handleShare = useCallback(async (id: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, shares: (p.shares ?? 0) + 1 } : p))
    );
    try {
      await postService.sharePost(id);
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, shares: (p.shares ?? 0) - 1 } : p))
      );
    }
  }, []);

  const handleComment = useCallback((id: number) => {
    setCommentPostId(id);
  }, []);

  const handleFollow = useCallback(async (id: number, _authorId: number, isFollowing: boolean) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_following: !isFollowing } : p))
    );
    try {
      if (isFollowing) {
        await postService.unfollowUser(_authorId);
      } else {
        await postService.followUser(_authorId);
      }
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_following: isFollowing } : p))
      );
    }
  }, []);

  const renderPost = useCallback(
    ({ item }: { item: ApiPost }) => (
      <PostCard
        item={item}
        router={router}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        onFollow={handleFollow}
        onComment={handleComment}
      />
    ),
    [router, handleLike, handleSave, handleShare, handleFollow, handleComment]
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  const renderEmpty = (isLoading: boolean) => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Nothing here yet</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("public")}>
            <Text
              style={[styles.tabText, activeTab === "public" && styles.tabTextActive]}
            >
              Public
            </Text>
          </TouchableOpacity>
          <Text style={styles.tabDivider}>|</Text>
          <TouchableOpacity onPress={() => setActiveTab("group")}>
            <Text
              style={[styles.tabText, activeTab === "group" && styles.tabTextActive]}
            >
              Your Group
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/chat/inbox")}
          >
            <MessengerIcon width={20} height={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/explore/notifications")}
          >
            <NotificationsIcon width={20} height={20} color={Colors.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "public" ? (
        <FlatList<ApiPost>
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchMorePosts}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => renderEmpty(loadingPosts)}
          refreshControl={
            <RefreshControl
              refreshing={refreshingPosts}
              onRefresh={() => fetchPosts(true)}
              tintColor={Colors.primary}
            />
          }
        />
      ) : (
        <FlatList<ApiPost>
          data={groupPosts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => renderEmpty(loadingGroupPosts)}
          refreshControl={
            <RefreshControl
              refreshing={refreshingGroupPosts}
              onRefresh={() => fetchGroupPosts(true)}
              tintColor={Colors.primary}
            />
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
              p.id === commentPostId
                ? { ...p, comments: (p.comments ?? 0) + 1 }
                : p
            )
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  tabs: { flexDirection: "row", alignItems: "center", gap: 12 },
  tabText: { color: Colors.textSecondary, fontSize: 16, fontWeight: "600" },
  tabTextActive: { color: Colors.primary },
  tabDivider: { color: Colors.cardBorder, fontSize: 18 },
  headerIcons: { flexDirection: "row", gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});
