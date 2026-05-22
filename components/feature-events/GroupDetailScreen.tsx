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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import MemberIcon from "../../assets/icons/member.svg";
import ImageIcon from "../../assets/icons/image.svg";
import { GroupPostCard, type GroupPostItem } from "../events";
import { ContextMenuDropdown, capturePressAnchor } from "../overlays";
import { pickPostMedia, pickCoverImage, pickAvatarImage } from "../../lib/mediaPicker";
import { eventService } from "../../services/eventService";
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
};

const POSTS: GroupPostItem[] = [
  {
    id: "p1",
    type: "image",
    user: "Anna Rui",
    time: "May 12, 2026 at 5:46 PM",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80",
    likes: 6,
    comments: 18,
  },
  {
    id: "p2",
    type: "text",
    user: "Anna Rui",
    time: "May 12, 2026 at 5:46 PM",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
    text: "Football is the world's most popular sport, played on a field with a ball between two teams of 11 players.",
    likes: 6,
    comments: 18,
  },
];

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; admin?: string }>();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localCoverUri, setLocalCoverUri] = useState<string | null>(null);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [composerMedia, setComposerMedia] = useState<{ uri: string; kind: "image" | "video" } | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  useFocusEffect(useCallback(() => { fetchGroup(); }, [fetchGroup]));

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
        {/* Hero cover */}
        <TouchableOpacity
          style={s.hero}
          activeOpacity={isAdmin ? 0.85 : 1}
          disabled={!isAdmin}
          onPress={handlePickCover}
        >
          {(localCoverUri ?? group.cover_photo_url) ? (
            <Image source={{ uri: (localCoverUri ?? group.cover_photo_url)! }} style={s.heroImage} resizeMode="cover" />
          ) : (
            <View style={[s.heroImage, s.heroPlaceholder]} />
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
          {group.bio ? (
            <Text style={s.groupDesc}>{group.bio}</Text>
          ) : null}

          <View style={s.groupMeta}>
            <TouchableOpacity
              style={s.metaChip}
              onPress={() => router.push(`/events/members?id=${groupId}` as never)}
            >
              <MemberIcon width={14} height={14} color={Colors.textSecondary} />
              <Text style={s.metaChipText}>{group.members_count ?? 0} Members</Text>
            </TouchableOpacity>
          </View>

          {isAdmin ? (
            <View style={s.actionRow}>
              <TouchableOpacity style={s.outlineBtn}>
                <Text style={s.outlineBtnText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.outlineBtn}
                onPress={() => router.push("/chat/id?id=1")}
              >
                <Text style={s.outlineBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          ) : !isMember ? (
            <TouchableOpacity
              style={[s.joinBtn, joining && { opacity: 0.7 }]}
              onPress={handleJoin}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={s.joinBtnText}>Join Group</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={s.actionRow}>
              <TouchableOpacity
                style={s.outlineBtn}
                onPress={() => router.push("/chat/id?id=1")}
              >
                <Text style={s.outlineBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {isMember && (
            <View>
              <View style={s.fullDivider} />
              <View style={s.postInputRow}>
                <View style={[s.postInputAvatar, s.postInputAvatarPlaceholder]}>
                  <Ionicons name="person" size={16} color={Colors.textSecondary} />
                </View>
                <TouchableOpacity
                  style={s.postInputField}
                  onPress={async () => {
                    const picked = await pickPostMedia();
                    if (!picked) return;
                    setComposerMedia({ uri: picked.uri, kind: picked.type === "video" ? "video" : "image" });
                  }}
                >
                  {composerMedia?.kind === "image" ? (
                    <View style={s.composerPreviewRow}>
                      <Image source={{ uri: composerMedia.uri }} style={s.composerThumb} />
                      <Text style={s.composerHint}>Tap to change media</Text>
                    </View>
                  ) : composerMedia?.kind === "video" ? (
                    <Text style={s.composerVideoLabel}>Video selected — tap to change</Text>
                  ) : (
                    <Text style={s.postInputPlaceholder}>Post something...</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.postMediaBtn}
                  onPress={async () => {
                    const picked = await pickPostMedia();
                    if (!picked) return;
                    setComposerMedia({ uri: picked.uri, kind: picked.type === "video" ? "video" : "image" });
                  }}
                >
                  <ImageIcon width={20} height={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {POSTS.map((post) => (
            <GroupPostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              onPressMenu={(postId, e) => {
                setMenuPos(capturePressAnchor(e));
                setSelectedPost(postId);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <ContextMenuDropdown
        visible={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedPost(null); }}
        anchor={menuPos}
        offsetBelow={17}
      >
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={() => { setShowDeleteModal(false); setSelectedPost(null); }}
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
  heroPlaceholder: { backgroundColor: Colors.card },
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
  fullDivider: { height: 1, backgroundColor: Colors.cardBorder, marginHorizontal: -18 },
  postInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
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
  postInputPlaceholder: { color: Colors.textMuted, fontSize: 14 },
  composerPreviewRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  composerThumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: Colors.card },
  composerHint: { color: Colors.textSecondary, fontSize: 13 },
  composerVideoLabel: { color: Colors.text, fontSize: 14 },
  postMediaBtn: { justifyContent: "center", alignItems: "center" },
  deleteBtn: { paddingVertical: 12, paddingHorizontal: 20, alignItems: "center" },
  deleteBtnText: { color: "#FF6B35", fontSize: 16, fontWeight: "700" },
});
