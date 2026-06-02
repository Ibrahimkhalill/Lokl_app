import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import MemberIcon from "../../assets/icons/member.svg";
import LocationsIcon from "../../assets/icons/locations.svg";
import ImageIcon from "../../assets/icons/image.svg";
import { GroupPostCard, type GroupPostItem } from "../events";
import { ContextMenuDropdown, capturePressAnchor } from "../overlays";
import { pickCoverImage, pickAvatarImage } from "../../lib/mediaPicker";
import { eventService } from "../../services/eventService";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";

type GroupDetail = {
  id: number;
  name: string;
  bio?: string;
  photo_url?: string | null;
  cover_photo_url?: string | null;
  members_count?: number;
  is_member?: boolean;
  is_admin?: boolean;
  recent_members?: { id: number; name: string; profile_picture: string | null }[];
  meetup?: { name?: string; address?: string; latitude?: number; longitude?: number } | null;
};

type ApiPost = {
  id: number;
  author_id: number;
  author_name: string;
  author_avatar: string | null;
  type: string;
  is_public: boolean;
  tag: string;
  body: string;
  location: string;
  image_url: string | null;
  video_url: string | null;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  is_liked: boolean;
  is_saved: boolean;
  is_following: boolean;
  lokl_score: string;
  event_id: number | null;
  event_title: string | null;
  tagged_users: { id: number; name: string }[];
  tagged_groups: { id: number; name: string }[];
  post_target: { id: number; name: string }[];
  created_at: string;
};

const convertApiPostToGroupPost = (apiPost: ApiPost): GroupPostItem => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return {
    id: apiPost.id.toString(),
    type: apiPost.type === "video" ? "video" : (apiPost.type === "image" ? "image" : "text"),
    user: apiPost.author_name,
    time: formatTime(apiPost.created_at),
    avatar: apiPost.author_avatar || undefined,
    text: apiPost.body || undefined,
    image: apiPost.image_url || undefined,
    video: apiPost.video_url || undefined,
    likes: apiPost.likes,
    comments: apiPost.comments,
    shares: apiPost.shares,
    saves: apiPost.saves,
    isLiked: apiPost.is_liked,
    isSaved: apiPost.is_saved,
    location: apiPost.location || undefined,
    tag: apiPost.tag || undefined,
    loklScore: apiPost.lokl_score,
    eventTitle: apiPost.event_title || undefined,
    taggedUsers: apiPost.tagged_users,
    taggedGroups: apiPost.tagged_groups,
  };
};

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; admin?: string }>();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localCoverUri, setLocalCoverUri] = useState<string | null>(null);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [posts, setPosts] = useState<GroupPostItem[]>([]);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await eventService.getSocialGroup(groupId);
      const data = res.data?.data ?? res.data;
      setGroup(data);
    } catch (e) {
      console.log("[GroupDetail]", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const fetchGroupPosts = useCallback(async () => {
    if (!groupId) return;
    setPostsLoading(true);
    try {
      const res = await eventService.getSocialGroupPost(groupId);
      const data = res.data?.data ?? res.data;
      const apiPosts = data?.posts || [];
      const convertedPosts = apiPosts.map(convertApiPostToGroupPost);
      setPosts(convertedPosts);
      console.log("[GroupDetail] fetched posts:", convertedPosts);
    } catch (e) {
      console.log("[GroupDetail] Posts fetch error:", getErrorMessage(e));
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      fetchGroup();
      fetchGroupPosts();
    }, [fetchGroup, fetchGroupPosts])
  );

  const handlePickCover = async () => {
    const picked = await pickCoverImage();
    if (!picked) return;
    setLocalCoverUri(picked.uri);
    setUploadingCover(true);
    try {
      const form = new FormData();
      const ext = picked.uri.split(".").pop() ?? "jpg";
      form.append("cover_photo", { uri: picked.uri, name: `cover_${Date.now()}.${ext}`, type: "image/jpeg" } as any);
      await eventService.uploadGroupCover(groupId, form);
      await fetchGroup();
    } catch (e) {
      Alert.alert("Error", getErrorMessage(e));
      setLocalCoverUri(null);
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePickPhoto = async () => {
    const picked = await pickAvatarImage();
    if (!picked) return;
    setLocalPhotoUri(picked.uri);
    setUploadingPhoto(true);
    try {
      const form = new FormData();
      const ext = picked.uri.split(".").pop() ?? "jpg";
      form.append("photo", { uri: picked.uri, name: `photo_${Date.now()}.${ext}`, type: "image/jpeg" } as any);
      await eventService.uploadGroupPhoto(groupId, form);
      await fetchGroup();
    } catch (e) {
      Alert.alert("Error", getErrorMessage(e));
      setLocalPhotoUri(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      await eventService.joinSocialGroup(groupId);
      setGroup((prev) => prev ? { ...prev, is_member: true } : prev);
    } catch (e) {
      Alert.alert("Error", getErrorMessage(e));
    } finally {
      setJoining(false);
    }
  };

  const handleLike = useCallback(async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: (p.likes ?? 0) + (p.isLiked ? -1 : 1) }
          : p
      )
    );
    
    try {
      await postService.likePost(parseInt(postId));
    } catch (e) {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likes: (p.likes ?? 0) + (p.isLiked ? -1 : 1) }
            : p
        )
      );
      Alert.alert("Error", getErrorMessage(e));
    }
  }, [posts]);

  const handleSave = useCallback(async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isSaved: !p.isSaved, saves: (p.saves ?? 0) + (p.isSaved ? -1 : 1) }
          : p
      )
    );
    
    try {
      await postService.savePost(parseInt(postId));
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isSaved: !p.isSaved, saves: (p.saves ?? 0) + (p.isSaved ? -1 : 1) }
            : p
        )
      );
      Alert.alert("Error", getErrorMessage(e));
    }
  }, [posts]);



  const handleComment = useCallback((postId: string) => {
    setCommentPostId(postId);
    setCommentText("");
  }, []);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !commentPostId) return;
    
    try {
      await postService.postComment(parseInt(commentPostId), commentText);
      
      // Update comment count
      setPosts((prev) =>
        prev.map((p) =>
          p.id === commentPostId
            ? { ...p, comments: (p.comments ?? 0) + 1 }
            : p
        )
      );
      
      setCommentPostId(null);
      setCommentText("");
      Alert.alert("Success", "Comment added");
    } catch (e) {
      Alert.alert("Error", getErrorMessage(e));
    }
  };

  const handleDeletePost = async (postId: string) => {
    // Optimistically remove first
    const removed = posts.find((p) => p.id === postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await postService.deletePost(parseInt(postId));
    } catch (e: any) {
      // 204 No Content — server confirmed deletion, ignore axios parse quirk
      const status = e?.response?.status;
      if (status && status >= 400) {
        // Real server error — put post back and show message
        if (removed) setPosts((prev) => [...prev, removed]);
        Alert.alert("Error", getErrorMessage(e));
      }
      // network-level error with no response: delete already succeeded on server, do nothing
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={s.container}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={s.centered}>
          <Text style={{ color: Colors.textSecondary }}>Group not found</Text>
        </View>
      </View>
    );
  }

  const isAdmin = group.is_admin || params.admin === "true";
  const isMember = group.is_member || isAdmin;

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero cover - same as before */}
        <TouchableOpacity
          style={s.hero}
          activeOpacity={isAdmin ? 0.85 : 1}
          disabled={!isAdmin}
          onPress={handlePickCover}
        >
          {(localCoverUri ?? group.cover_photo_url) ? (
            <Image source={{ uri: (localCoverUri ?? group.cover_photo_url)! }} style={s.heroImage} resizeMode="cover" />
          ) : (
            <View style={[s.heroImage, s.heroPlaceholder]}>
              <Ionicons name="image-outline" size={48} color={Colors.textSecondary} />
              <Text style={s.heroPlaceholderText}>No Cover Photo</Text>
            </View>
          )}
          {isAdmin && (
            <View style={s.coverOverlay}>
              {uploadingCover ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={s.coverEditBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                  <Text style={s.coverEditText}>
                    {(localCoverUri ?? group.cover_photo_url) ? "Edit Cover" : "Add Cover Photo"}
                  </Text>
                </View>
              )}
            </View>
          )}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Group avatar */}
        <TouchableOpacity
          style={s.groupAvatarWrap}
          onPress={handlePickPhoto}
          disabled={!isAdmin}
          activeOpacity={isAdmin ? 0.8 : 1}
        >
          {(localPhotoUri ?? group.photo_url) ? (
            <Image source={{ uri: (localPhotoUri ?? group.photo_url)! }} style={s.groupAvatar} />
          ) : (
            <View style={[s.groupAvatar, s.groupAvatarPlaceholder]}>
              <Ionicons name="people" size={30} color={Colors.textSecondary} />
            </View>
          )}
          {isAdmin && (
            <View style={s.avatarEditBadge}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={12} color="#000" />
              )}
            </View>
          )}
        </TouchableOpacity>

        <View style={s.content}>
          <Text style={s.groupName}>{group.name}</Text>
          {group.bio ? <Text style={s.groupDesc}>{group.bio}</Text> : null}

          <View style={s.groupMeta}>
            <TouchableOpacity
              style={s.metaChip}
              onPress={() => router.push(`/events/members?id=${groupId}` as never)}
            >
              <MemberIcon width={14} height={14} color={Colors.textSecondary} />
              <Text style={s.metaChipText}>{group.members_count ?? 0} Members</Text>
            </TouchableOpacity>
            {!!group.meetup?.name && (
              <View style={s.metaChip}>
                <LocationsIcon width={14} height={14} color={Colors.textSecondary} />
                <Text style={s.metaChipText} numberOfLines={1}>{group.meetup.name}</Text>
              </View>
            )}
          </View>

          {isAdmin ? (
            <View style={s.actionRow}>
              <TouchableOpacity style={s.outlineBtn}>
                <Text style={s.outlineBtnText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.outlineBtn} onPress={() => router.push(`/chat/id?group_id=${groupId}&name=${encodeURIComponent(group.name)}` as never)}>
                <Text style={s.outlineBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          ) : !isMember ? (
            <TouchableOpacity style={[s.joinBtn, joining && { opacity: 0.7 }]} onPress={handleJoin} disabled={joining}>
              {joining ? <ActivityIndicator color={Colors.black} /> : <Text style={s.joinBtnText}>Join Group</Text>}
            </TouchableOpacity>
          ) : (
            <View style={s.actionRow}>
              <TouchableOpacity style={s.outlineBtn} onPress={() => router.push(`/chat/id?group_id=${groupId}&name=${encodeURIComponent(group.name)}` as never)}>
                <Text style={s.outlineBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {isMember && (
            <View>
              <View style={s.fullDivider} />
              <TouchableOpacity style={s.postInputRow} activeOpacity={0.7} onPress={() => router.push(`/(tabs)/post?groupId=${groupId}` as never)}>
                <View style={s.postInputAvatar}>
                  {(localPhotoUri ?? group.photo_url) ? (
                    <Image source={{ uri: (localPhotoUri ?? group.photo_url)! }} style={s.postAvatar} />
                  ) : (
                    <View style={[s.postInputAvatar, s.postInputAvatarPlaceholder]}>
                      <Ionicons name="people" size={16} color={Colors.textSecondary} />
                    </View>
                  )}
                </View>
                <Text style={s.postPlaceholder}>Post something...</Text>
                <ImageIcon width={20} height={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {postsLoading ? (
            <View style={s.postsLoading}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={s.loadingText}>Loading posts...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={s.emptyPosts}>
              <Text style={s.emptyPostsText}>No posts yet</Text>
              <Text style={s.emptyPostsSubtext}>Be the first to post in this group!</Text>
            </View>
          ) : (
            posts.map((post) => (
            <GroupPostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              onLike={() => handleLike(post.id)}
              onComment={() => handleComment(post.id)}
              onPressMenu={(postId, e) => {
                setMenuPos(capturePressAnchor(e));
                setSelectedPost(postId);
                setShowDeleteModal(true);
              }}
            />
            ))
          )}
        </View>
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={!!commentPostId}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentPostId(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Add Comment</Text>
            <TextInput
              style={s.commentInput}
              placeholder="Write your comment..."
              placeholderTextColor={Colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              autoFocus
            />
            <View style={s.modalButtons}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setCommentPostId(null)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSubmitBtn} onPress={handleSubmitComment}>
                <Text style={s.modalSubmitText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ContextMenuDropdown
        visible={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedPost(null); }}
        anchor={menuPos}
        offsetBelow={17}
      >
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={() => {
            const postId = selectedPost;
            setShowDeleteModal(false);
            setSelectedPost(null);
            if (!postId) return;
            Alert.alert(
              "Delete Post",
              "Are you sure you want to delete this post?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => handleDeletePost(postId) },
              ]
            );
          }}
        >
          <Text style={s.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </ContextMenuDropdown>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  hero: { height: 200, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroPlaceholder: { backgroundColor: Colors.card, justifyContent: "center", alignItems: "center", gap: 8 },
  heroPlaceholderText: { color: Colors.textSecondary, fontSize: 13 },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  coverEditBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  coverEditText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(20,22,26,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  groupAvatarWrap: { marginTop: -36, paddingLeft: 18, marginBottom: 12, width: 72 + 18, position: "relative" },
  groupAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  groupAvatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  groupName: { color: Colors.text, fontSize: 22, fontWeight: "800", marginBottom: 6 },
  groupDesc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 14 },
  groupMeta: { flexDirection: "row", gap: 14, marginBottom: 18 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaChipText: { color: Colors.textSecondary, fontSize: 13 },
  joinBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  joinBtnText: { color: Colors.black, fontSize: 16, fontWeight: "700" },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  outlineBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  outlineBtnText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  fullDivider: { height: 1, backgroundColor: Colors.cardBorder, marginHorizontal: -18, marginVertical: 12 },
  postInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: -18,
    backgroundColor: Colors.card,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  postInputAvatar: { width: 36, height: 36, borderRadius: 18 },
  postInputAvatarPlaceholder: {
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  postInputField: { flex: 1 },
  postTextInput: {
    color: Colors.text,
    fontSize: 14,
    padding: 0,
    margin: 0,
    minHeight: 40,
  },
  postInputPlaceholder: { color: Colors.textMuted, fontSize: 14 },
  mediaPreview: {
    marginTop: 10,
    position: "relative",
    alignSelf: "flex-start",
  },
  mediaPreviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  mediaPreviewVideo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaPreviewText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  removeMediaBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  postMediaBtn: { justifyContent: "center", alignItems: "center", padding: 8 },
  postActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    marginHorizontal: -18,
  },
  cancelPostBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelPostText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  submitPostBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitPostText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "600",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  deleteBtn: { paddingVertical: 12, paddingHorizontal: 20, alignItems: "center" },
  deleteBtnText: { color: "#FF6B35", fontSize: 16, fontWeight: "700" },
  postsLoading: { paddingVertical: 40, alignItems: "center", justifyContent: "center" },
  loadingText: { color: Colors.textSecondary, marginTop: 12, fontSize: 14 },
  emptyPosts: { paddingVertical: 60, alignItems: "center", justifyContent: "center" },
  emptyPostsText: { color: Colors.textSecondary, fontSize: 16, fontWeight: "600", marginBottom: 8 },
  emptyPostsSubtext: { color: Colors.textMuted, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  commentInput: {
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalSubmitText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "600",
  },
  postPlaceholder: { flex: 1, color: Colors.textMuted, fontSize: 14 },
  addImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignSelf: "flex-start",
  },
  addImageText: { color: Colors.textSecondary, fontSize: 13 },

  postSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    minHeight: 300,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  sheetInput: {
    color: Colors.text,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
    padding: 0,
    marginBottom: 12,
  },
  sheetFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 12,
  },
  sheetMediaBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetSubmitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 50,
  },
  sheetSubmitText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "700",
  },
});