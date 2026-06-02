import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Vibration,
} from "react-native";
import { usePreferences } from "../../context/PreferencesContext";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import LocationIcon from "../../assets/icons/locations.svg";
import CommentsIcon from "../../assets/icons/comments.svg";
import NavigateIcon from "../../assets/icons/navigate.svg";
import BookmarkIcon from "../../assets/icons/bookmarks.svg";
import BookmarkFilledIcon from "../../assets/icons/bookmark-filled.svg";
import { useVideoPlayer, VideoView } from "expo-video";
import { Avatar } from "../primitives/Avatar";
import { ApiPost } from "./PostCard";

function PostVideoPlayer({ uri, autoPlay }: { uri: string; autoPlay: boolean }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    if (autoPlay) p.play();
  });
  return (
    <VideoView
      player={player}
      style={styles.postVideo}
      contentFit="cover"
      nativeControls
    />
  );
}

export function GroupFeedCard({
  item,
  currentGroup,
  router,
  onLike,
  onSave,
  onShare,
  onComment,
}: {
  item: ApiPost;
  currentGroup?: { id: number; name: string; photo?: string | null };
  router: any;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onShare: (id: number) => void;
  onComment: (id: number) => void;
}) {
  const { preferences } = usePreferences();

  function haptic() {
    if (preferences.haptic) Vibration.vibrate(10);
  }

  return (
    <View style={styles.card}>
      {/* Group header */}
      <View style={styles.headerRow}>
        {/* Group photo with author avatar overlaid at bottom */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            currentGroup && router.push(`/events/group-detail?id=${currentGroup.id}`)
          }
        >
          <View style={styles.groupPhotoWrap}>
            {currentGroup?.photo ? (
              <Image
                source={{ uri: currentGroup.photo }}
                style={styles.groupPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.groupPhoto, styles.groupPhotoPlaceholder]}>
                <Ionicons name="people" size={26} color={Colors.textSecondary} />
              </View>
            )}
            {/* Author avatar overlaid at bottom-right */}
            <TouchableOpacity
              style={styles.avatarOverlay}
              activeOpacity={0.8}
              onPress={() =>
                router.push(
                  `/explore/user-profile?user_id=${item.author_id}&name=${encodeURIComponent(item.author_name ?? "")}`
                )
              }
            >
              <Avatar uri={item.author_avatar} size={30} borderWidth={2} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Group name + author name */}
        <View style={styles.groupInfo}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              currentGroup && router.push(`/events/group-detail?id=${currentGroup.id}`)
            }
          >
            <Text style={styles.groupName} numberOfLines={1}>
              {currentGroup?.name ?? item.author_name}
            </Text>
          </TouchableOpacity>
          <Text style={styles.authorName} numberOfLines={1}>
            {item.author_name || ""}
          </Text>
        </View>
      </View>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          {item.tagged_groups && item.tagged_groups.length > 0 && (
            <>
              {item.tagged_groups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => router.push(`/events/group-detail?id=${g.id}`)}
                >
                  <Text style={styles.groupTagText}>@{g.name}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
          {!!item.location && (
            <View style={styles.locationWrap}>
              <LocationIcon width={13} height={13} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          )}
        </View>
        {!!item.lokl_score && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{item.lokl_score}</Text>
          </View>
        )}
      </View>

      {!!item.body && (
        <Text style={styles.content} numberOfLines={3}>
          {item.body}
        </Text>
      )}

      {!!item.image_url && (
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.image_url }} style={styles.postImage} resizeMode="cover" />
        </View>
      )}

      {!!item.video_url && (
        <View style={styles.imageWrap}>
          <PostVideoPlayer uri={item.video_url} autoPlay={preferences.autoplay} />
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { haptic(); onLike(item.id); }}>
          <Ionicons
            name={item.is_liked ? "heart" : "heart-outline"}
            size={20}
            color={item.is_liked ? "#FF4444" : Colors.text}
          />
          <Text
            style={styles.actionText}
            onPress={() => router.push(`/explore/post-likes?id=${item.id}`)}
          >
            {item.likes ?? 0} likes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { haptic(); onComment(item.id); }}>
          <CommentsIcon width={20} height={20} color={Colors.text} />
          <Text style={styles.actionText}>{item.comments ?? 0} comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { haptic(); onShare(item.id); }}>
          <NavigateIcon width={20} height={20} color={Colors.text} />
          <Text style={styles.actionText}>{item.shares ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { haptic(); onSave(item.id); }}>
          {item.is_saved ? (
            <BookmarkFilledIcon width={20} height={20} color={Colors.primary} />
          ) : (
            <BookmarkIcon width={20} height={20} color={Colors.text} />
          )}
          <Text style={styles.actionText}>{item.saves ?? 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerRow: {
    flexDirection: "row",
    // alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  groupPhotoWrap: {
    position: "relative",
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  groupPhoto: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: "hidden",
  },
  groupPhotoPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 8,
    right:0,
    borderRadius: 18,
    backgroundColor: Colors.background,
    padding: 2,
  },
  groupInfo: {
    flex: 1,
    gap: 4,
    marginTop: 5,
  },
  groupName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  authorName: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  followBtn: {
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  followingBtn: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(123,97,255,0.1)",
  },
  followText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  followingText: { color: Colors.primary },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  metaLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  locationWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: Colors.textSecondary, fontSize: 13 },
  scoreBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  scoreText: { color: Colors.black, fontSize: 13, fontWeight: "800" },
  groupTagText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  content: {
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    lineHeight: 20,
  },
  imageWrap: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  postImage: { width: "100%", height: 200 },
  postVideo: { width: "100%", height: 220 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { color: Colors.textSecondary, fontSize: 12 },
});
