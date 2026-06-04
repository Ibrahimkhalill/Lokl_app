import React, { useState } from "react";
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

export type ApiPost = {
  id: number;
  author_id?: number;
  author_name?: string;
  author_avatar?: string | null;
  type?: string;
  tag?: string;
  body?: string;
  location?: string;
  image_url?: string | null;
  video_url?: string | null;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  lokl_score?: string;
  is_liked?: boolean;
  is_saved?: boolean;
  is_following?: boolean;
  created_at: string;
  is_author?: boolean;
  tagged_groups?: { id: number; name: string }[];
  post_target?: { id: number; name: string; photo?: string | null }[];
};

function ExpandableBody({ body }: { body: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.bodyWrap}>
      <Text style={styles.content} numberOfLines={expanded ? undefined : 3}>
        {body}
      </Text>
      {!expanded && body.length > 120 && (
        <TouchableOpacity onPress={() => setExpanded(true)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
          <Text style={styles.readMore}>Read more</Text>
        </TouchableOpacity>
      )}
      {expanded && (
        <TouchableOpacity onPress={() => setExpanded(false)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
          <Text style={styles.readMore}>Show less</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function PostVideoPlayer({ uri, isVisible }: { uri: string; isVisible: boolean }) {
  const player = useVideoPlayer(
    { uri, useCaching: true },
    (p) => {
      p.loop = true;
      p.bufferOptions = { preferredForwardBufferDuration: 10 };
    }
  );

  React.useEffect(() => {
    if (isVisible) player.play();
    else player.pause();
  }, [isVisible, player]);

  return (
    <VideoView
      player={player}
      style={styles.postVideo}
      contentFit="cover"
      nativeControls
      requiresLinearPlayback
    />
  );
}

export const PostCard = React.memo(function PostCard({
  item,
  router,
  onLike,
  onSave,
  onShare,
  onFollow,
  onComment,
  hideFollowBtn,
  isVisible,
}: {
  item: ApiPost;
  router: any;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onShare: (id: number) => void;
  onFollow: (id: number, authorId: number, following: boolean) => void;
  onComment: (id: number) => void;
  hideFollowBtn?: boolean;
  isVisible?: boolean;
}) {
  const { preferences } = usePreferences();

  function haptic() {
    if (preferences.haptic) Vibration.vibrate(10);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userRow}
          onPress={() =>
            router.push(
              `/explore/user-profile?user_id=${item.author_id}&name=${encodeURIComponent(item.author_name ?? "")}`
            )
          }
          activeOpacity={0.8}
        >
          <Avatar uri={item.author_avatar} size={42} borderWidth={2} />
          <Text style={styles.userName}>{item.author_name || ""}</Text>
        </TouchableOpacity>
        {!hideFollowBtn && (
          <TouchableOpacity
            style={[styles.followBtn, item.is_following && styles.followingBtn]}
            onPress={() => onFollow(item.id, item.author_id ?? 0, !!item.is_following)}
          >
            <Text style={[styles.followText, item.is_following && styles.followingText]}>
              {item.is_following ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          {item.tagged_groups && item.tagged_groups.length > 0 && (
            <>
              {item.tagged_groups.map((g) => (
                <TouchableOpacity key={g.id} onPress={() => router.push(`/events/group-detail?id=${g.id}`)}>
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

      {!!item.body && <ExpandableBody body={item.body} />}

      {!!item.image_url && (
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.image_url }} style={styles.postImage} resizeMode="cover" />
        </View>
      )}

      {!!item.video_url && (
        <View style={styles.imageWrap}>
          <PostVideoPlayer uri={item.video_url} isVisible={preferences.autoplay && !!isVisible} />
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
});

const styles = StyleSheet.create({
  card: {
    paddingTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
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
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#7B61FF",
  },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: { color: Colors.text, fontSize: 15, fontWeight: "700" },
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
  groupTagText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  bodyWrap: { paddingHorizontal: 16, marginBottom: 10 },
  content: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  readMore: { color: Colors.primary, fontSize: 13, fontWeight: "600", marginTop: 4 },
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
