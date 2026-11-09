import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import { PostCard, ApiPost } from "../../components/feature-explore/PostCard";
import CommentsSheet from "../../components/feature-explore/CommentsSheet";
import { openPostShare } from "../../lib/sharePost";

/** One post on its own screen: opened when a ranking is tapped on a venue page. */
export default function SinglePostScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);

  const [post, setPost] = useState<ApiPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    postService
      .getPost(postId)
      .then((res) => {
        if (alive) setPost(res.data?.data ?? res.data);
      })
      .catch((e) => {
        if (alive) setError(getErrorMessage(e));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [postId]);

  const update = useCallback((fn: (p: ApiPost) => ApiPost) => setPost((p) => (p ? fn(p) : p)), []);

  const handleLike = useCallback(() => {
    const flip = (p: ApiPost) => ({ ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) });
    update(flip);
    postService.likePost(postId).catch(() => update(flip));
  }, [postId, update]);

  const handleSave = useCallback(() => {
    const flip = (p: ApiPost) => ({ ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) });
    update(flip);
    postService.savePost(postId).catch(() => update(flip));
  }, [postId, update]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : post ? (
        <ScrollView keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 60 }}>
          <PostCard
            item={post}
            router={router}
            onLike={handleLike}
            onSave={handleSave}
            onShare={() => openPostShare(router, postId, post)}
            onFollow={() => {}}
            onComment={() => setCommentsOpen(true)}
            hideFollowBtn
          />
        </ScrollView>
      ) : (
        <Text style={s.empty}>{error || "This post is not available."}</Text>
      )}

      <CommentsSheet
        visible={commentsOpen}
        postId={postId}
        onClose={() => setCommentsOpen(false)}
        onCommentAdded={() => update((p) => ({ ...p, comments: (p.comments ?? 0) + 1 }))}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.cardBorder, justifyContent: "center", alignItems: "center" },
  title: { color: Colors.text, fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },
  empty: { color: Colors.textSecondary, textAlign: "center", marginTop: 40, paddingHorizontal: 24 },
});
