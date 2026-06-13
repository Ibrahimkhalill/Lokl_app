import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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
import { sharedPostStore } from "../../lib/sharedPostStore";
import CommentsSheet from "../../components/feature-explore/CommentsSheet";
import { PostCard, ApiPost } from "../../components/feature-explore/PostCard";
import { PostCardSkeleton } from "../../components/feature-explore/PostCardSkeleton";
import { EmptyState } from "../../components/primitives";

const { width } = Dimensions.get("window");




export default function ExploreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"public" | "group">("public");

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshingPosts, setRefreshingPosts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [groupPosts, setGroupPosts] = useState<ApiPost[]>([]);
  const [groupPostsPage, setGroupPostsPage] = useState(1);
  const [groupPostsHasMore, setGroupPostsHasMore] = useState(false);
  const [loadingGroupPosts, setLoadingGroupPosts] = useState(true);
  const [refreshingGroupPosts, setRefreshingGroupPosts] = useState(false);

  const [commentPostId, setCommentPostId] = useState<number | null>(null);
  const [commentGroupPostId, setCommentGroupPostId] = useState<number | null>(null);

  const [visiblePostId, setVisiblePostId] = useState<number | null>(null);
  const [visibleGroupPostId, setVisibleGroupPostId] = useState<number | null>(null);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  const onViewablePostsChanged = useRef(({ viewableItems }: any) => {
    const first = viewableItems.find((v: any) => v.item?.video_url);
    setVisiblePostId(first ? first.item.id : null);
  });

  const onViewableGroupPostsChanged = useRef(({ viewableItems }: any) => {
    const first = viewableItems.find((v: any) => v.item?.video_url);
    setVisibleGroupPostId(first ? first.item.id : null);
  });

  const fetchingRef = useRef(false);
  const loadingMoreRef = useRef(false);

  function parsePayload(res: any): { results: ApiPost[]; pagination: any } {
    const raw = res.data?.data ?? res.data;
    const results: ApiPost[] = Array.isArray(raw?.posts)
      ? raw.posts
      : Array.isArray(raw?.results)
      ? raw.results
      : Array.isArray(raw)
      ? raw
      : [];
    return { results, pagination: raw?.pagination ?? null };
  }

  const fetchPosts = useCallback(async (refresh = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (refresh) setRefreshingPosts(true);
    else setLoadingPosts(true);
    try {
      const res = await postService.getFeed(1);
      const { results, pagination } = parsePayload(res);
      setPosts(results);
      setPostsPage(1);
      setPostsHasMore(pagination ? pagination.page < pagination.total_pages : results.length === 10);
    } catch (e) {
      console.log("[Explore] fetchPosts error:", getErrorMessage(e));
    } finally {
      setLoadingPosts(false);
      setRefreshingPosts(false);
      fetchingRef.current = false;
    }
  }, []);

  const fetchMorePosts = useCallback(async () => {
    if (!postsHasMore || loadingMoreRef.current || fetchingRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = postsPage + 1;
      const res = await postService.getFeed(nextPage);
      const { results, pagination } = parsePayload(res);
      setPosts((prev) => [...prev, ...results]);
      setPostsPage(nextPage);
      setPostsHasMore(pagination ? nextPage < pagination.total_pages : results.length === 10);
    } catch (e) {
      console.log("[Explore] fetchMorePosts error:", getErrorMessage(e));
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [postsHasMore, postsPage]);

  const fetchGroupPosts = useCallback(async (refresh = false) => {
    if (refresh) setRefreshingGroupPosts(true);
    else setLoadingGroupPosts(true);
    try {
      const res = await postService.getFriendsFeed(1);
      const { results, pagination } = parsePayload(res);
      setGroupPosts(results);
      setGroupPostsPage(1);
      setGroupPostsHasMore(pagination ? pagination.page < pagination.total_pages : results.length === 10);
    } catch (e) {
      console.log("[Explore] fetchFriendsPosts error:", getErrorMessage(e));
    } finally {
      setLoadingGroupPosts(false);
      setRefreshingGroupPosts(false);
    }
  }, []);

  const fetchMoreGroupPosts = useCallback(async () => {
    if (!groupPostsHasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = groupPostsPage + 1;
      const res = await postService.getFriendsFeed(nextPage);
      const { results, pagination } = parsePayload(res);
      setGroupPosts((prev) => [...prev, ...results]);
      setGroupPostsPage(nextPage);
      setGroupPostsHasMore(pagination ? nextPage < pagination.total_pages : results.length === 10);
    } catch (e) {
      console.log("[Explore] fetchMoreFriendsPosts error:", getErrorMessage(e));
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [groupPostsHasMore, groupPostsPage]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  useFocusEffect(
    useCallback(() => {
      const id = sharedPostStore.consume();
      if (!id) return;
      const increment = (p: ApiPost) =>
        p.id === id ? { ...p, shares: (p.shares ?? 0) + 1 } : p;
      setPosts((prev) => prev.map(increment));
      setGroupPosts((prev) => prev.map(increment));
    }, [])
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

  const handleShare = useCallback((id: number) => {
    const post = posts.find((p) => p.id === id);
    const params = new URLSearchParams({ postId: String(id) });
    if (post?.image_url) params.set("imageUrl", post.image_url);
    if (post?.body) params.set("title", post.body.slice(0, 80));
    if (post?.location) params.set("subtitle", post.location);
    router.push(`/home/share-event?${params.toString()}` as never);
  }, [router, posts]);

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
        isVisible={item.id === visiblePostId}
      />
    ),
    [router, handleLike, handleSave, handleShare, handleFollow, handleComment, visiblePostId]
  );

  // ── Group feed handlers ─────────────────────────────────────────────────────
  const handleGroupLike = useCallback(async (id: number) => {
    setGroupPosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) } : p)
    );
    try {
      await postService.likePost(id);
    } catch {
      setGroupPosts((prev) =>
        prev.map((p) => p.id === id ? { ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) } : p)
      );
    }
  }, []);

  const handleGroupSave = useCallback(async (id: number) => {
    setGroupPosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) } : p)
    );
    try {
      await postService.savePost(id);
    } catch {
      setGroupPosts((prev) =>
        prev.map((p) => p.id === id ? { ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) } : p)
      );
    }
  }, []);

  const handleGroupShare = useCallback((id: number) => {
    const post = groupPosts.find((p) => p.id === id);
    const params = new URLSearchParams({ postId: String(id) });
    if (post?.image_url) params.set("imageUrl", post.image_url);
    if (post?.body) params.set("title", post.body.slice(0, 80));
    if (post?.location) params.set("subtitle", post.location);
    router.push(`/home/share-event?${params.toString()}` as never);
  }, [router, groupPosts]);

  const handleGroupComment = useCallback((id: number) => {
    setCommentGroupPostId(id);
  }, []);

  const renderGroupPost = useCallback(
    ({ item }: { item: ApiPost }) => (
      <PostCard
        item={item}
        router={router}
        onLike={handleGroupLike}
        onSave={handleGroupSave}
        onShare={handleGroupShare}
        onFollow={handleFollow}
        onComment={handleGroupComment}
        hideFollowBtn={item.is_author === true}
        isVisible={item.id === visibleGroupPostId}
      />
    ),
    [router, handleGroupLike, handleGroupSave, handleGroupShare, handleFollow, handleGroupComment, visibleGroupPostId]
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingTop: 4 }}>
        {Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)}
      </View>
    );
  };

  const renderEmpty = (isLoading: boolean) => {
    if (isLoading) {
      return (
        <View style={{ paddingTop: 8 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </View>
      );
    }
    return (
      <EmptyState
        icon="newspaper-outline"
        title="No posts yet"
        subtitle="Be the first to share something with the community"
      />
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
              Friends
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
          onViewableItemsChanged={onViewablePostsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
          windowSize={5}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
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
          renderItem={renderGroupPost}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchMoreGroupPosts}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => renderEmpty(loadingGroupPosts)}
          onViewableItemsChanged={onViewableGroupPostsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
          windowSize={5}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
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
              p.id === commentPostId ? { ...p, comments: (p.comments ?? 0) + 1 } : p
            )
          )
        }
      />

      <CommentsSheet
        visible={commentGroupPostId !== null}
        postId={commentGroupPostId ?? 0}
        onClose={() => setCommentGroupPostId(null)}
        onCommentAdded={() =>
          setGroupPosts((prev) =>
            prev.map((p) =>
              p.id === commentGroupPostId ? { ...p, comments: (p.comments ?? 0) + 1 } : p
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
