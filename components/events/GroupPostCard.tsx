// components/groups/GroupPostCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import CommentIcon from "../../assets/icons/comments.svg";
import LocationIcon from "../../assets/icons/locations.svg";

export type GroupPostItem = {
  id: string;
  type: "image" | "text" | "video";
  user: string;
  time: string;
  avatar?: string;
  image?: string | null;
  video?: string | null;
  text?: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  isLiked?: boolean;
  isSaved?: boolean;
  location?: string;
  tag?: string;
  loklScore?: string;
  eventTitle?: string;
  taggedUsers?: { id: number; name: string }[];
  taggedGroups?: { id: number; name: string }[];
};

export interface GroupPostCardProps {
  post: GroupPostItem;
  isAdmin?: boolean;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onPressMenu?: (postId: string, e: GestureResponderEvent) => void;
}

export function GroupPostCard({ 
  post, 
  isAdmin, 
  onLike,
  onComment,
  onDelete,
  onPressMenu 
}: GroupPostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handlePressMenu = (event: GestureResponderEvent) => {
    event.persist();
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setShowMenu(true);
    onPressMenu?.(post.id, event);
  };

  return (
    <>
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.postHeader}>
          <Image 
            source={{ uri: post.avatar || "https://via.placeholder.com/40" }} 
            style={styles.postAvatar} 
          />
          <View style={styles.postMeta}>
            <Text style={styles.postUser}>{post.user}</Text>
            <Text style={styles.postTime}>{post.time}</Text>
          </View>
          {isAdmin && (
            <TouchableOpacity
              onPress={handlePressMenu}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="ellipsis-vertical" size={18} color={Colors.text} />
            </TouchableOpacity>
          )}
        </View>

       
        {/* Post Content - Text */}
        {post.text && (
          <Text style={styles.postText}>{post.text}</Text>
        )}

        {/* Post Content - Image */}
        {!!post.image && (
          <Image
            source={{ uri: post.image }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {/* Post Content - Video */}
        {!!post.video && (
          <View style={styles.postVideo}>
            <Ionicons name="play-circle" size={50} color={Colors.primary} />
          </View>
        )}

        {/* Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.postAction} 
            onPress={() => onLike?.(post.id)}
          >
            <Ionicons 
              name={post.isLiked ? "heart" : "heart-outline"} 
              size={18} 
              color={post.isLiked ? "#FF4444" : Colors.text} 
            />
            <Text style={styles.postActionText}>{post.likes || 0} likes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.postAction} 
            onPress={() => onComment?.(post.id)}
          >
            <CommentIcon width={18} height={18} color={Colors.text} />
            <Text style={styles.postActionText}>{post.comments || 0} comments</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Context Menu Modal */}
    
    </>
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
    backgroundColor: Colors.background,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  postAvatar: { width: 44, height: 44, borderRadius: 22 },
  postMeta: { flex: 1 },
  postUser: { 
    color: Colors.text, 
    fontSize: 15, 
    fontWeight: "700",
    marginBottom: 2,
  },
  postTime: { 
    color: Colors.textMuted, 
    fontSize: 12,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  groupTag: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  withText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  userTag: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  postText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: { 
    width: "100%", 
    height: 240, 
    borderRadius: 12, 
    marginBottom: 12,
    backgroundColor: Colors.card,
  },
  postVideo: { 
    width: "100%", 
    height: 240, 
    borderRadius: 12, 
    marginBottom: 12,
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  postActions: { 
    flexDirection: "row", 
    gap: 24, 
    paddingVertical: 10,
  },
  postAction: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
  },
  postActionText: { 
    color: Colors.textSecondary, 
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  contextMenu: {
    position: "absolute",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemTextDelete: {
    color: "#FF4444",
    fontSize: 14,
    fontWeight: "500",
  },
});