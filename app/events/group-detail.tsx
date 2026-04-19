import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

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

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isAdmin = params.admin === "true";
  const [joined, setJoined] = useState(isAdmin);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

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
              <Ionicons
                name="ribbon-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={s.metaChipText}>Multisport</Text>
            </View>
            <View style={s.metaChip}>
              <Ionicons
                name="people-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={s.metaChipText}>6 Members</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {isAdmin ? (
            <View style={s.adminActions}>
              <TouchableOpacity style={s.adminBtn}>
                <Text style={s.adminBtnText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.messageBtn}
                onPress={() => router.push("/events/chatting")}
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
                onPress={() => router.push("/events/chatting")}
              >
                <Text style={s.messageBtnText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Post input (admin only) */}
          {isAdmin && (
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
                <Ionicons
                  name="image-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
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
                    onPress={() => {
                      setSelectedPost(post.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={18}
                      color={Colors.textSecondary}
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
                    color={Colors.textSecondary}
                  />
                  <Text style={s.postActionText}>{post.likes} likes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.postAction}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={17}
                    color={Colors.textSecondary}
                  />
                  <Text style={s.postActionText}>{post.comments} comments</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Delete modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <TouchableOpacity
          style={s.deleteOverlay}
          onPress={() => setShowDeleteModal(false)}
          activeOpacity={1}
        >
          <View style={s.deleteSheet}>
            <TouchableOpacity
              style={s.deleteBtn}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={s.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    backgroundColor: "rgba(20,22,26,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  groupAvatarWrap: { marginTop: -36, paddingLeft: 18, marginBottom: 12 },
  groupAvatar: {
    width: 72,
    height: 72,
    borderRadius: 18,
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
  postInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 10,
  },
  postInputAvatar: { width: 36, height: 36, borderRadius: 18 },
  postInputField: { flex: 1 },
  postInputPlaceholder: { color: Colors.textMuted, fontSize: 14 },
  postMediaBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.iconBg,
    justifyContent: "center",
    alignItems: "center",
  },
  postCard: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 16,
    marginBottom: 4,
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
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  postActions: { flexDirection: "row", gap: 20, paddingBottom: 16 },
  postAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  postActionText: { color: Colors.textSecondary, fontSize: 13 },
  deleteOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteSheet: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: "hidden",
    minWidth: 160,
  },
  deleteBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  deleteBtnText: { color: "#FF6B35", fontSize: 16, fontWeight: "700" },
});
