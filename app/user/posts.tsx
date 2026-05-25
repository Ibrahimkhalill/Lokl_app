import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import { PostCard, ApiPost } from "../../components/feature-explore/PostCard";
import CommentsSheet from "../../components/feature-explore/CommentsSheet";

type Tab = "posts" | "saved";

export default function UserPostsScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: Tab }>();
  const [activeTab, setActiveTab] = useState<Tab>(tab ?? "posts");

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);

  const fetchMe = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await userService.getMe();
      const d = res.data?.data ?? res.data;
      setPosts(d.posts ?? []);
      setSavedPosts(d.saved_posts ?? []);
    } catch (e) {
      console.log("[Posts] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchMe(); }, [fetchMe]));

  const updatePosts = useCallback((id: number, updater: (p: ApiPost) => ApiPost) => {
    setPosts((prev) => prev.map((p) => p.id === id ? updater(p) : p));
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

  const handleComment = useCallback((id: number) => setCommentPostId(id), []);

  const displayPosts = activeTab === "posts" ? posts : savedPosts;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.navigate("/(tabs)/profile")}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === "posts" ? "My Posts" : "Saved Posts"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayPosts}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchMe(true)} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name={activeTab === "posts" ? "images-outline" : "bookmark-outline"}
                size={42}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                {activeTab === "posts" ? "No posts yet" : "No saved posts"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostCard
              item={item}
              router={router}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
              onFollow={() => {}}
              onComment={handleComment}
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
  listContent: { paddingBottom: 80 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: {
    color: Colors.text, fontSize: 17, fontWeight: "700",
  },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 50,
    padding: 4,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 50,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "600" },
  tabBtnTextActive: { color: Colors.black },
});
