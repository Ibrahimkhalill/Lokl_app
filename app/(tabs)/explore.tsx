import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationIcon from "../../assets/icons/locations.svg";
import HeartIcon from "../../assets/icons/heart.svg";
import CommentsIcon from "../../assets/icons/comments.svg";
import NavigateIcon from "../../assets/icons/navigate.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import MessengerIcon from "../../assets/icons/messenger.svg";
import NotificationsIcon from "../../assets/icons/notifications.svg";

const { width } = Dimensions.get("window");

type ExplorePost = {
  id: string;
  user: string;
  avatar: string;
  tag: string;
  location: string;
  score: string;
  distance: string;
  image: string;
  likes: number;
  comments: number;
  shares: string;
  saves: number;
  isFollowing?: boolean;
  group?: string | null;
  groupAvatar?: string;
};

const POSTS: ExplorePost[] = [
  {
    id: "1",
    user: "Pixcraft_132",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    tag: "@FIFA World Cup,",
    location: "San Francisco,CA",
    score: "9.2",
    distance: "1.2 mi",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
    likes: 6,
    comments: 18,
    shares: "2K",
    saves: 35,
    isFollowing: false,
    group: null,
  },
  {
    id: "2",
    user: "Pixcraft_132",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    tag: "@FIFA World Cup,",
    location: "San Francisco,CA",
    score: "9.2",
    distance: "1.2 mi",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
    likes: 6,
    comments: 18,
    shares: "2K",
    saves: 35,
    isFollowing: false,
    group: null,
  },
  {
    id: "3",
    user: "Pixcraft_132",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    tag: "@FIFA World Cup,",
    location: "San Francisco,CA",
    score: "9.2",
    distance: "1.2 mi",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
    likes: 6,
    comments: 18,
    shares: "2K",
    saves: 35,
    isFollowing: false,
    group: null,
  },
];

const GROUP_POSTS: ExplorePost[] = [
  {
    id: "g1",
    group: "Football Club",
    user: "Pixcraft_132",
    avatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=100&q=80",
    groupAvatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=100&q=80",
    tag: "@FIFA World Cup,",
    location: "San Francisco,CA",
    score: "9.2",
    distance: "1.2 mi",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
    likes: 6,
    comments: 18,
    shares: "2K",
    saves: 35,
  },
  {
    id: "g2",
    group: "Football Club",
    user: "Pixcraft_132",
    avatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=100&q=80",
    groupAvatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=100&q=80",
    tag: "@FIFA World Cup,",
    location: "San Francisco,CA",
    score: "9.2",
    distance: "1.2 mi",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
    likes: 6,
    comments: 18,
    shares: "2K",
    saves: 35,
  },
  {
    id: "g3",
    group: "Football Club",
    user: "Pixcraft_132",
    avatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=100&q=80",
    groupAvatar:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=100&q=80",
    tag: "@FIFA World Cup,",
    location: "San Francisco,CA",
    score: "9.2",
    distance: "1.2 mi",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
    likes: 6,
    comments: 18,
    shares: "2K",
    saves: 35,
  },
];

function PostCard({
  item,
  isGroup,
  router,
}: {
  item: ExplorePost;
  isGroup: boolean;
  router: any;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <View style={postStyles.card}>
      {/* User Header */}
      <View style={postStyles.header}>
        <TouchableOpacity
          style={postStyles.userRow}
          onPress={() => router.push("/explore/user-profile")}
          activeOpacity={0.8}
        >
          {isGroup ? (
            <View style={postStyles.groupAvatarWrap}>
              <Image
                source={{ uri: item.groupAvatar }}
                style={postStyles.groupAvatar}
              />
              <Image
                source={{ uri: item.avatar }}
                style={postStyles.groupAvatarSmall}
              />
            </View>
          ) : (
            <Image source={{ uri: item.avatar }} style={postStyles.avatar} />
          )}
          <View>
            {isGroup && <Text style={postStyles.groupName}>{item.group}</Text>}
            <Text
              style={isGroup ? postStyles.userNameSmall : postStyles.userName}
            >
              {item.user}
            </Text>
          </View>
        </TouchableOpacity>
        {!isGroup && (
          <TouchableOpacity style={postStyles.followBtn}>
            <Text style={postStyles.followText}>Follow</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tag + Location + Score */}
      <View style={postStyles.metaRow}>
        <Text style={postStyles.tag}>{item.tag}</Text>
        <LocationIcon width={13} height={13} color={Colors.textSecondary} />
        <Text style={postStyles.metaText}>{item.location}</Text>
        <View style={postStyles.scoreBadge}>
          <Text style={postStyles.scoreText}>{item.score}</Text>
        </View>
      </View>

      {/* Post Image */}
      <View style={postStyles.imageWrap}>
        <Image
          source={{ uri: item.image }}
          style={postStyles.postImage}
          resizeMode="cover"
        />
        {/* Play button */}
        <View style={postStyles.playBtn}>
          <Ionicons name="play" size={22} color={Colors.white} />
        </View>
        {/* Distance badge */}
        <View style={postStyles.distBadge}>
          <Ionicons name="location-outline" size={11} color={Colors.text} />
          <Text style={postStyles.distText}>{item.distance}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={postStyles.actions}>
        <TouchableOpacity
          style={postStyles.actionBtn}
          onPress={() => setLiked(!liked)}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={20}
            color={liked ? "#FF4444" : Colors.text}
          />
          <Text style={postStyles.actionText}>
            {liked ? item.likes + 1 : item.likes} likes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionBtn}>
          <CommentsIcon width={20} height={20} color={Colors.text} />
          <Text style={postStyles.actionText}>{item.comments} comments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={postStyles.actionBtn}
          onPress={() => router.push("/home/share-event")}
        >
          <NavigateIcon width={20} height={20} color={Colors.text} />
          <Text style={postStyles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={postStyles.actionBtn}
          onPress={() => setSaved(!saved)}
        >
          <BookmarkIcon width={20} height={20} color={Colors.text} />
          <Text style={postStyles.actionText}>{item.saves}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const postStyles = StyleSheet.create({
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
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#7B61FF",
  },
  groupAvatarWrap: { width: 52, height: 42, position: "relative" },
  groupAvatar: { width: 42, height: 42, borderRadius: 10 },
  groupAvatarSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: "absolute",
    bottom: -4,
    right: -4,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  groupName: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  userName: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  userNameSmall: { color: Colors.textSecondary, fontSize: 12 },
  followBtn: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  followText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  tag: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  metaText: { color: Colors.textSecondary, fontSize: 13 },
  scoreBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: "auto",
  },
  scoreText: { color: Colors.black, fontSize: 12, fontWeight: "800" },
  imageWrap: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
  },
  postImage: { width: "100%", height: 200 },
  playBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -22,
    marginTop: -22,
  },
  distBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(20,22,26,0.8)",
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  distText: { color: Colors.text, fontSize: 11, fontWeight: "600" },
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

export default function ExploreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"public" | "group">("public");

  const data: ExplorePost[] = activeTab === "public" ? POSTS : GROUP_POSTS;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("public")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "public" && styles.tabTextActive,
              ]}
            >
              Public
            </Text>
          </TouchableOpacity>
          <Text style={styles.tabDivider}>|</Text>
          <TouchableOpacity onPress={() => setActiveTab("group")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "group" && styles.tabTextActive,
              ]}
            >
              Your Group
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/chat/inbox")}
          >
            <MessengerIcon width={20} height={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/explore/notifications")}
          >
            <NotificationsIcon width={20} height={20} color={Colors.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList<ExplorePost>
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            isGroup={activeTab === "group"}
            router={router}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  tabs: { flexDirection: "row", alignItems: "center", gap: 12 },
  tabText: { color: Colors.textSecondary, fontSize: 16, fontWeight: "600" },
  tabTextActive: { color: Colors.primary },
  tabDivider: { color: Colors.cardBorder, fontSize: 18 },
  headerIcons: { flexDirection: "row", gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
});
