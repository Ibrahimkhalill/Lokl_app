import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import MessengerIcon from "../../assets/icons/messenger.svg";
import NotificationsIcon from "../../assets/icons/notifications.svg";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import CommentsSheet from "../../components/feature-explore/CommentsSheet";
import { PostCard, ApiPost } from "../../components/feature-explore/PostCard";

const { width } = Dimensions.get("window");




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

  const handleFollow = useCallback(async (_postId: number, authorId: number, isFollowing: boolean) => {
    // Update all posts by this author at once
    setPosts((prev) =>
      prev.map((p) => (p.author_id === authorId ? { ...p, is_following: !isFollowing } : p))
    );
    try {
      if (isFollowing) {
        await postService.unfollowUser(authorId);
      } else {
        await postService.followUser(authorId);
      }
    } catch (e) {
      console.log("[Follow] error:", getErrorMessage(e));
      setPosts((prev) =>
        prev.map((p) => (p.author_id === authorId ? { ...p, is_following: isFollowing } : p))
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
        hideFollowBtn={item.is_author === true}
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
