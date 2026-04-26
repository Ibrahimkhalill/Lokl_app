import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import MultisportIcon from "../../assets/icons/multisport.svg";
import MemberIcon from "../../assets/icons/member.svg";
import CommentIcon from "../../assets/icons/comments.svg";
import ImageIcon from "../../assets/icons/image.svg";

const POSTS = [
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DELETE_MENU_WIDTH = 126;
const EDGE_GAP = 12;

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isAdmin = params.admin === "true";
  const [joined, setJoined] = useState(isAdmin);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
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

        {/* Group Avatar overlapping hero */}
        <View style={s.groupAvatarWrap}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200&q=80",
            }}
            style={s.groupAvatar}
          />
        </View>

        <View style={s.content}>
          {/* Group Info */}
          <Text style={s.groupName}>Sports Club Group</Text>
          <Text style={s.groupDesc}>
            Great seeing you. i have to go now. I'll talk to you late.
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

          {/* Action Buttons */}
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

          {/* Post input (admin only) */}
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
                  onPress={() => router.push("/events/gallery")}
                >
                  <Text style={s.postInputPlaceholder}>Post something...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.postMediaBtn}
                  onPress={() => router.push("/events/gallery")}
                >
                  <ImageIcon width={20} height={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Posts Feed */}
          {POSTS.map((post) => (
            <View key={post.id} style={s.postCard}>
              <View style={s.postHeader}>
                <Image source={{ uri: post.avatar }} style={s.postAvatar} />
                <View style={s.postMeta}>
                  <Text style={s.postUser}>{post.user}</Text>
                  <Text style={s.postTime}>{post.time}</Text>
                </View>
                {isAdmin && (
                  <TouchableOpacity
                    onPress={(e) => {
                      const { pageX, pageY } = e.nativeEvent;
                      setMenuPos({ x: pageX, y: pageY });
                      setSelectedPost(post.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={18}
                      color={Colors.text}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {post.type === "image" && (
                <Image
                  source={{ uri: post.image }}
                  style={s.postImage}
                  resizeMode="cover"
                />
              )}
              {post.type === "text" && (
                <Text style={s.postText}>{post.text}</Text>
              )}
              <View style={s.postActions}>
                <TouchableOpacity style={s.postAction}>
                  <Ionicons
                    name="heart-outline"
                    size={18}
                    color={Colors.text}
                  />
                  <Text style={s.postActionText}>{post.likes} likes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.postAction}>
                  <CommentIcon width={18} height={18} color={Colors.text} />
                  <Text style={s.postActionText}>{post.comments} comments</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {showDeleteModal && (
        <View style={s.deleteOverlay} pointerEvents="box-none">
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowDeleteModal(false)}
            activeOpacity={1}
          />
          <View
            style={[
              s.deleteSheet,
              {
                top: menuPos.y + 17,
                left: Math.min(
                  SCREEN_WIDTH - DELETE_MENU_WIDTH - EDGE_GAP,
                  Math.max(EDGE_GAP, menuPos.x - DELETE_MENU_WIDTH + 18),
                ),
              },
            ]}
          >
            <TouchableOpacity
              style={s.deleteBtn}
              onPress={() => {
                // TODO: delete API call
                setShowDeleteModal(false);
                setSelectedPost(null);
              }}
            >
              <Text style={s.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  postMediaBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  postCard: {
    marginHorizontal: -18,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 16,
    marginBottom: 4,
    paddingHorizontal: 18,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  postAvatar: { width: 40, height: 40, borderRadius: 20 },
  postMeta: { flex: 1 },
  postUser: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  postTime: { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  postImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 12 },
  postText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  postActions: { flexDirection: "row", gap: 20, paddingBottom: 16 },
  postAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  postActionText: { color: Colors.text, fontSize: 13 },
  deleteOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  deleteSheet: {
    position: "absolute",
    backgroundColor: Colors.text,
    borderRadius: 12,
    minWidth: DELETE_MENU_WIDTH,
  },
  deleteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  deleteBtnText: { color: "#FF6B35", fontSize: 16, fontWeight: "700" },
});
