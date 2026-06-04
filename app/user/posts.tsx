import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import { EmptyState } from "../../components/primitives";
import { PostCard, ApiPost } from "../../components/feature-explore/PostCard";
import CommentsSheet from "../../components/feature-explore/CommentsSheet";
import { PostCardSkeleton } from "../../components/feature-explore/PostCardSkeleton";

export default function SavedPostsScreen() {
  const router = useRouter();

  const [savedPosts, setSavedPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);

  const fetchSaved = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await userService.getMe();
      const d = res.data?.data ?? res.data;
      setSavedPosts(d.saved_posts ?? []);
    } catch (e) {
      console.log("[Saved] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchSaved(); }, [fetchSaved]));

  const updatePosts = useCallback((id: number, updater: (p: ApiPost) => ApiPost) => {
    setSavedPosts((prev) => prev.map((p) => p.id === id ? updater(p) : p));
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

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>SAVED POSTS</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ paddingTop: 8 }}>
          {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={savedPosts}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchSaved(true)} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <EmptyState icon="bookmark-outline" title="No saved posts" subtitle="Posts you save will appear here" />
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
          setSavedPosts((prev) =>
            prev.map((p) => p.id === commentPostId ? { ...p, comments: (p.comments ?? 0) + 1 } : p)
          )
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  listContent: { paddingBottom: 80 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },
  title: { color: Colors.text, fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },
});
