import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import MultisportIcon from "../../assets/icons/multisport.svg";
import MemberIcon from "../../assets/icons/member.svg";
import ImageIcon from "../../assets/icons/image.svg";
import { GroupPostCard, type GroupPostItem } from "../events";
import { ContextMenuDropdown, capturePressAnchor } from "../overlays";
import { pickPostMedia } from "../../lib/mediaPicker";

const POSTS: GroupPostItem[] = [
  {
    id: "p1",
    type: "image",
    user: "Anna Rui",
    time: "May 12, 2026 at 5:46 PM",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    image:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80",
    likes: 6,
    comments: 18,
  },
  {
    id: "p2",
    type: "text",
    user: "Anna Rui",
    time: "May 12, 2026 at 5:46 PM",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
    text: "Football is the world's most popular sport, played on a field with a ball between two teams of 11 players. The game requires physical strength, technique, and team e FIFA World Cup, with passion and enthusiasm.",
    likes: 6,
    comments: 18,
  },
];

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isAdmin = params.admin === "true";
  const [joined, setJoined] = useState(isAdmin);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [composerMedia, setComposerMedia] = useState<{
    uri: string;
    kind: "image" | "video";
  } | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
            }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={s.groupAvatarWrap}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200&q=80",
            }}
            style={s.groupAvatar}
          />
        </View>

        <View style={s.content}>
          <Text style={s.groupName}>Sports Club Group</Text>
          <Text style={s.groupDesc}>
            Great seeing you. i have to go now. I&apos;ll talk to you late.
          </Text>
          <View style={s.groupMeta}>
            <View style={s.metaChip}>
              <MultisportIcon
                width={14}
                height={14}
                color={Colors.textSecondary}
              />
              <Text style={s.metaChipText}>Multisport</Text>
            </View>
            <TouchableOpacity
              style={s.metaChip}
              onPress={() => router.push("/events/members" as never)}
              activeOpacity={0.8}
            >
              <MemberIcon width={14} height={14} color={Colors.textSecondary} />
              <Text style={s.metaChipText}>6 Members</Text>
            </TouchableOpacity>
          </View>

          {isAdmin ? (
            <View style={s.adminActions}>
              <TouchableOpacity style={s.adminBtn}>
                <Text style={s.adminBtnText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.messageBtn}
                onPress={() => router.push("/chat/id?id=1")}
              >
                <Text style={s.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          ) : !joined ? (
            <TouchableOpacity style={s.joinBtn} onPress={() => setJoined(true)}>
              <Text style={s.joinBtnText}>Join Group</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.adminActions}>
              <TouchableOpacity
                style={s.messageBtn}
                onPress={() => router.push("/chat/id?id=1")}
              >
                <Text style={s.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {isAdmin && (
            <View>
              <View style={s.fullDivider} />
              <View style={s.postInputRow}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
                  }}
                  style={s.postInputAvatar}
                />
                <TouchableOpacity
                  style={s.postInputField}
                  onPress={async () => {
                    const picked = await pickPostMedia();
                    if (!picked) return;
                    setComposerMedia({
                      uri: picked.uri,
                      kind: picked.type === "video" ? "video" : "image",
                    });
                  }}
                >
                  {composerMedia?.kind === "image" ? (
                    <View style={s.composerPreviewRow}>
                      <Image
                        source={{ uri: composerMedia.uri }}
                        style={s.composerThumb}
                      />
                      <Text style={s.composerHint}>Tap to change media</Text>
                    </View>
                  ) : composerMedia?.kind === "video" ? (
                    <Text style={s.composerVideoLabel}>
                      Video selected — tap to change
                    </Text>
                  ) : (
                    <Text style={s.postInputPlaceholder}>
                      Post something...
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.postMediaBtn}
                  onPress={async () => {
                    const picked = await pickPostMedia();
                    if (!picked) return;
                    setComposerMedia({
                      uri: picked.uri,
                      kind: picked.type === "video" ? "video" : "image",
                    });
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
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPost(null);
        }}
        anchor={menuPos}
        offsetBelow={17}
      >
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={() => {
            const id = selectedPost;
            if (id) {
              /* await deletePost(id) */
            }
            setShowDeleteModal(false);
            setSelectedPost(null);
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
  hero: { height: 200, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.text,
    justifyContent: "center",
    alignItems: "center",
  },
  groupAvatarWrap: { marginTop: -36, paddingLeft: 18, marginBottom: 12 },
  groupAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  groupName: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  groupDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
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
  adminActions: { flexDirection: "row", gap: 12, marginBottom: 20 },
  adminBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  adminBtnText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  messageBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBtnText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  fullDivider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: -18,
  },
  postInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    marginHorizontal: -18,
    backgroundColor: Colors.card,
    borderRadius: 0,

    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  postInputAvatar: { width: 36, height: 36, borderRadius: 18 },
  postInputField: { flex: 1 },
  postInputPlaceholder: { color: Colors.textMuted, fontSize: 14 },
  composerPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  composerThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.iconBg,
  },
  composerHint: { color: Colors.textSecondary, fontSize: 13 },
  composerVideoLabel: { color: Colors.text, fontSize: 14 },
  postMediaBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  deleteBtnText: { color: "#FF6B35", fontSize: 16, fontWeight: "700" },
});
