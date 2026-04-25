import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const FOLLOWERS = Array(8)
  .fill(null)
  .map((_, i) => ({
    id: `f${i}`,
    name: "Villa_266",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    isFollowing: false,
  }));

const FOLLOWING = [
  {
    id: "f1",
    name: "Villa_266",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    isFollowing: true,
  },
  {
    id: "f2",
    name: "Villa_266",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
    isFollowing: true,
  },
];

export default function FollowScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const isFollowers = type !== "following";
  const data = isFollowers ? FOLLOWERS : FOLLOWING;

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
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push("/profile/posts")}
              >
                <Text style={styles.statNum}>2,644</Text>
                <Text style={styles.statLabel}>posts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push("/profile/follow?type=followers")}
              >
                <View
                  style={[
                    styles.statBox,
                    !isFollowers && null,
                    isFollowers && styles.statBoxActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statNum,
                      isFollowers && styles.statNumActiveColor,
                    ]}
                  >
                    6,401
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      isFollowers && styles.statNumActiveColor,
                    ]}
                  >
                    followers
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push("/profile/follow?type=following")}
              >
                <View
                  style={[styles.statBox, !isFollowers && styles.statBoxActive]}
                >
                  <Text
                    style={[
                      styles.statNum,
                      !isFollowers && styles.statNumActiveColor,
                    ]}
                  >
                    2
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      !isFollowers && styles.statNumActiveColor,
                    ]}
                  >
                    Following
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
            <Text style={styles.userName}>{item.name}</Text>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>
                {isFollowers ? "Follow Back" : "Unfollow"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    backgroundColor: Colors.background,
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
  profileInfo: { flex: 1 },
  username: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  statsRow: { flexDirection: "row", gap: 8 },
  statItem: {},
  statBox: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  statBoxActive: { backgroundColor: "#4A90E2" },
  statNum: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  statNumActiveColor: { color: "#fff" },
  statLabel: { color: Colors.textSecondary, fontSize: 10, textAlign: "center" },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  userAvatar: { width: 48, height: 48, borderRadius: 24 },
  userName: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: "600" },
  actionBtn: {
    backgroundColor: "#4A90E2",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
