import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import CommentIcon from "../../assets/icons/comments.svg";
import ShareIcon from "../../assets/icons/share.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";

const POSTS = [
  {
    id: "1",
    username: "Pixcraft_132",
    tag: "@FIFA World Cup",
    text: "Football is the world's most popular sport, played on a field with a ball between two teams of 11 players. The game requires physical strength, technique, and team coordination, where points are scored by scoring goals by getting the ball into the goalposts. Billions of people around the world enjoy various football tournaments, including the FIFA World Cup, with passion and enthusiasm.",
    image: null,
    likes: 6,
    comments: 18,
    shares: "2K",
    saves: 35,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
  },
  {
    id: "2",
    username: "Pixcraft_132",
    tag: "@FIFA World Cup",
    text: null,
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80",
    distance: "1.2 mi",
    likes: 6,
    comments: 18,
    shares: "2K",
    saves: 35,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
  },
];

export default function PostsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.profileRow}>
          <LinearGradient
            colors={["rgba(0, 119, 255, 1)", "rgba(246, 53, 221, 1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarBorder}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
              }}
              style={styles.avatar}
            />
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>pixcraft_132</Text>
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem}>
                <View style={styles.statActive}>
                  <Text style={styles.statNumActive}>2,644</Text>
                  <Text style={styles.statLabelActive}>posts</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push("/profile/follow?type=followers")}
              >
                <Text style={styles.statNum}>6,401</Text>
                <Text style={styles.statLabel}>followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push("/profile/follow?type=following")}
              >
                <Text style={styles.statNum}>2</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {POSTS.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <LinearGradient
                colors={["rgba(0, 119, 255, 1)", "rgba(246, 53, 221, 1)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.postAvatarBorder}
              >
                <Image
                  source={{ uri: post.avatar }}
                  style={styles.postAvatar}
                />
              </LinearGradient>
              <View style={styles.postMeta}>
                <Text style={styles.postUsername}>{post.username}</Text>
                <Text style={styles.postTag}>{post.tag}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons
                  name="ellipsis-vertical"
                  size={18}
                  color={Colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Post Content */}
            {post.text && <Text style={styles.postText}>{post.text}</Text>}
            {post.image && (
              <View style={styles.postImageWrap}>
                <Image
                  source={{ uri: post.image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
                {post.distance && (
                  <View style={styles.distanceBadge}>
                    <Ionicons
                      name="location-outline"
                      size={11}
                      color={Colors.text}
                    />
                    <Text style={styles.distanceText}>{post.distance}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.playBtn}>
                  <Ionicons name="play" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>
            )}

            {/* Actions */}
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionItem}>
                <Ionicons name="heart-outline" size={20} color={Colors.text} />
                <Text style={styles.actionText}>{post.likes} likes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem}>
                <CommentIcon width={20} height={20} color={Colors.text} />
                <Text style={styles.actionText}>{post.comments} comments</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem}>
                <ShareIcon width={20} height={20} color={Colors.text} />
                <Text style={styles.actionText}>{post.shares}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem}>
                <BookmarkIcon
                  width={20}
                  height={20}
                  color={Colors.textSecondary}
                />
                <Text style={styles.actionText}>{post.saves}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: Colors.background,
  },
  profileInfo: { flex: 1 },
  username: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  statsRow: { flexDirection: "row", gap: 12 },
  statItem: {},
  statActive: {
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  statNumActive: { color: "#fff", fontSize: 15, fontWeight: "800" },
  statLabelActive: { color: "#fff", fontSize: 10 },
  statNum: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  statLabel: { color: Colors.textSecondary, fontSize: 10, textAlign: "center" },

  postCard: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    paddingBottom: 16,
    marginBottom: 4,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  postAvatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 2,
  },
  postAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    backgroundColor: Colors.background,
  },
  postMeta: { flex: 1 },
  postUsername: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  postTag: { color: Colors.textSecondary, fontSize: 13 },
  postText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postImageWrap: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
    marginBottom: 12,
    position: "relative",
  },
  postImage: { width: "100%", height: "100%" },
  distanceBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(20,22,26,0.85)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  distanceText: { color: Colors.text, fontSize: 11, fontWeight: "600" },
  playBtn: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -20,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 20,
  },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { color: Colors.textSecondary, fontSize: 13 },
});
