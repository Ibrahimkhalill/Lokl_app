import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const USER_POSTS = [
  {
    id: "p1",
    type: "text",
    tag: "@FIFA World Cup",
    body: "Football is the world's most popular sport, played on a field with a ball between two teams of 11 players. The game requires physical strength, technique, and team coordination, where points are scored by scoring goals by getting the ball into the goalposts. Billions of people around the world enjoy various football tournaments, including the FIFA World Cup, with passion and enthusiasm.",
    likes: 6,
    comments: 18,
    shares: "2K",
    saves: 35,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
  },
  {
    id: "p2",
    type: "image",
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
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
  },
];

export default function UserProfileScreen() {
  const router = useRouter();
  const [following, setFollowing] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pixcraft_132</Text>
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={Colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>pixcraft_132</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2,644</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>6,401</Text>
                <Text style={styles.statLabel}>followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bio Card */}
        <View style={styles.bioCard}>
          <Text style={styles.bioText}>
            Fitness enthusiast _Yoga lover_{"\n"}Always looking for the next
            challenge
          </Text>
          <View style={styles.bioMeta}>
            <View style={styles.bioMetaItem}>
              <Ionicons
                name="location-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.bioMetaText}>San Francisco,CA</Text>
            </View>
            <View style={styles.bioMetaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.bioMetaText}>joined Jan 2025</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.followBtn, following && styles.followingBtn]}
            onPress={() => setFollowing(!following)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.followBtnText,
                following && styles.followingBtnText,
              ]}
            >
              {following ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageBtn} activeOpacity={0.85}>
            <Text style={styles.messageBtnText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        {USER_POSTS.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
              <Text style={styles.postUser}>Pixcraft_132</Text>
              <TouchableOpacity style={styles.smallFollowBtn}>
                <Text style={styles.smallFollowText}>Follow</Text>
              </TouchableOpacity>
            </View>

            {/* Tag + meta */}
            {post.type === "image" && (
              <View style={styles.postMeta}>
                <Text style={styles.postTag}>{post.tag}</Text>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={Colors.textSecondary}
                />
                <Text style={styles.postMetaText}>
                  {(post as any).location}
                </Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{(post as any).score}</Text>
                </View>
              </View>
            )}
            {post.type === "text" && (
              <Text style={styles.postTag}>{post.tag}</Text>
            )}

            {/* Content */}
            {post.type === "text" && (
              <Text style={styles.postBody}>{post.body}</Text>
            )}
            {post.type === "image" && (
              <View style={styles.postImageWrap}>
                <Image
                  source={{ uri: (post as any).image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
                <View style={styles.playBtn}>
                  <Ionicons name="play" size={22} color={Colors.white} />
                </View>
                <View style={styles.distBadge}>
                  <Ionicons
                    name="location-outline"
                    size={11}
                    color={Colors.text}
                  />
                  <Text style={styles.distText}>{(post as any).distance}</Text>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <Text style={styles.actionText}>{post.likes} likes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons
                  name="chatbubble-outline"
                  size={19}
                  color={Colors.textSecondary}
                />
                <Text style={styles.actionText}>{post.comments} comments</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons
                  name="navigate-outline"
                  size={19}
                  color={Colors.textSecondary}
                />
                <Text style={styles.actionText}>{post.shares}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons
                  name="bookmark-outline"
                  size={19}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: "#7B61FF",
  },
  profileInfo: { flex: 1 },
  username: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  statsRow: { flexDirection: "row", gap: 20 },
  statItem: { alignItems: "center" },
  statValue: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  statLabel: { color: Colors.textSecondary, fontSize: 12 },
  bioCard: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  bioText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  bioMeta: { flexDirection: "row", gap: 16 },
  bioMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  bioMetaText: { color: Colors.textSecondary, fontSize: 13 },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  followBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.modalHeader,
    justifyContent: "center",
    alignItems: "center",
  },
  followingBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  followBtnText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
  followingBtnText: { color: Colors.text },
  messageBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBtnText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  postCard: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#7B61FF",
  },
  postUser: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: "700" },
  smallFollowBtn: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  smallFollowText: { color: Colors.text, fontSize: 13 },
  postTag: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  postMetaText: { color: Colors.textSecondary, fontSize: 13 },
  scoreBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: "auto",
  },
  scoreText: { color: Colors.black, fontSize: 12, fontWeight: "800" },
  postBody: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postImageWrap: {
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
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 4,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { color: Colors.textSecondary, fontSize: 12 },
});
