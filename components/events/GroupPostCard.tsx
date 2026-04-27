import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import CommentIcon from "../../assets/icons/comments.svg";

export type GroupPostItem = {
  id: string;
  type: "image" | "text";
  user: string;
  time: string;
  avatar: string;
  image?: string;
  text?: string;
  likes: number;
  comments: number;
};

export interface GroupPostCardProps {
  post: GroupPostItem;
  isAdmin: boolean;
  onPressMenu?: (postId: string, e: GestureResponderEvent) => void;
}

export function GroupPostCard({ post, isAdmin, onPressMenu }: GroupPostCardProps) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
        <View style={styles.postMeta}>
          <Text style={styles.postUser}>{post.user}</Text>
          <Text style={styles.postTime}>{post.time}</Text>
        </View>
        {isAdmin && onPressMenu ? (
          <TouchableOpacity
            onPress={(e) => onPressMenu(post.id, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-vertical" size={18} color={Colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      {post.type === "image" && post.image ? (
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}
      {post.type === "text" && post.text ? (
        <Text style={styles.postText}>{post.text}</Text>
      ) : null}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="heart-outline" size={18} color={Colors.text} />
          <Text style={styles.postActionText}>{post.likes} likes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <CommentIcon width={18} height={18} color={Colors.text} />
          <Text style={styles.postActionText}>{post.comments} comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
