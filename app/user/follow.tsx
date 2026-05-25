import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";

type Tab = "followers" | "following";

type FollowUser = {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
};

type MeData = {
  profile: { id: number; name: string; username: string | null; avatar: string | null };
  stats: { posts: number; followers: number; following: number };
  followers: FollowUser[];
  following: FollowUser[];
};

function UserAvatar({ uri, size }: { uri: string | null; size: number }) {
  return (
    <LinearGradient
      colors={["#0077FF", "#F635DD"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, padding: 2 }}
    >
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        overflow: "hidden", backgroundColor: Colors.card,
        justifyContent: "center", alignItems: "center",
      }}>
        {uri
          ? <Image source={{ uri }} style={{ width: size, height: size }} />
          : <Ionicons name="person" size={size * 0.45} color={Colors.textSecondary} />
        }
      </View>
    </LinearGradient>
  );
}

export default function FollowScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: Tab }>();
  const [activeTab, setActiveTab] = useState<Tab>(tab === "following" ? "following" : "followers");

  const [meData, setMeData] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getMe();
      const d = res.data?.data ?? res.data;
      setMeData(d);
      const ids = new Set<number>((d.following ?? []).map((u: FollowUser) => u.id));
      setFollowingIds(ids);
    } catch (e) {
      console.log("[Follow] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchMe(); }, [fetchMe]));

  const handleToggleFollow = useCallback(async (userId: number) => {
    const alreadyFollowing = followingIds.has(userId);
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (alreadyFollowing) next.delete(userId); else next.add(userId);
      return next;
    });
    if (activeTab === "following" && alreadyFollowing) {
      setMeData((prev) =>
        prev ? { ...prev, following: prev.following.filter((u) => u.id !== userId) } : prev
      );
    }
    try {
      if (alreadyFollowing) await postService.unfollowUser(userId);
      else await postService.followUser(userId);
    } catch {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (alreadyFollowing) next.add(userId); else next.delete(userId);
        return next;
      });
      if (activeTab === "following" && alreadyFollowing) fetchMe();
    }
  }, [followingIds, activeTab, fetchMe]);

  function getFollowBtnLabel(userId: number): string {
    if (activeTab === "followers") return followingIds.has(userId) ? "Following" : "Follow Back";
    return "Unfollow";
  }

  const profile = meData?.profile;
  const stats = meData?.stats;

  const renderHeader = () => (
    <View style={styles.profileHeader}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.navigate("/(tabs)/profile")}>
        <Ionicons name="arrow-back" size={20} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.profileRow}>
        <UserAvatar uri={profile?.avatar ?? null} size={60} />
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{profile?.username ?? profile?.name ?? ""}</Text>
          <View style={styles.statsRow}>
            <TouchableOpacity onPress={() => router.push("/user/posts?tab=posts")}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{stats?.posts ?? 0}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab("followers")}>
              <View style={[styles.statBox, activeTab === "followers" && styles.statBoxActive]}>
                <Text style={[styles.statNum, activeTab === "followers" && styles.statNumActive]}>
                  {stats?.followers ?? 0}
                </Text>
                <Text style={[styles.statLabel, activeTab === "followers" && styles.statNumActive]}>
                  followers
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab("following")}>
              <View style={[styles.statBox, activeTab === "following" && styles.statBoxActive]}>
                <Text style={[styles.statNum, activeTab === "following" && styles.statNumActive]}>
                  {stats?.following ?? 0}
                </Text>
                <Text style={[styles.statLabel, activeTab === "following" && styles.statNumActive]}>
                  Following
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        {renderHeader()}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const listData: FollowUser[] =
    activeTab === "followers" ? (meData?.followers ?? []) : (meData?.following ?? []);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={listData}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="people-outline" size={42} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {activeTab === "followers" ? "No followers yet" : "Not following anyone"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isOutline = activeTab === "followers" ? followingIds.has(item.id) : true;
          return (
            <View style={styles.userRow}>
              <UserAvatar uri={item.avatar} size={46} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                {!!item.username && <Text style={styles.userHandle}>@{item.username}</Text>}
              </View>
              <TouchableOpacity
                style={[styles.actionBtn, isOutline && styles.actionBtnOutline]}
                onPress={() => handleToggleFollow(item.id)}
              >
                <Text style={[styles.actionBtnText, isOutline && styles.actionBtnTextOutline]}>
                  {getFollowBtnLabel(item.id)}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },

  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
    marginBottom: 14,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  profileInfo: { flex: 1 },
  username: { color: Colors.text, fontSize: 15, fontWeight: "700", marginBottom: 8 },

  statsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statBox: {
    borderRadius: 8, paddingVertical: 4,
    alignItems: "center", borderWidth: 1,
    borderColor: Colors.cardBorder, width: 68,
  },
  statBoxActive: { backgroundColor: "#4A90E2", borderColor: "#4A90E2" },
  statNum: { color: Colors.text, fontSize: 13, fontWeight: "800", textAlign: "center" },
  statNumActive: { color: "#fff" },
  statLabel: { color: Colors.textSecondary, fontSize: 9, textAlign: "center" },

  listContent: { paddingBottom: 80 },
  userRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10, gap: 12,
  },
  userInfo: { flex: 1 },
  userName: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  userHandle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },

  actionBtn: {
    backgroundColor: "#4A90E2", borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 9,
  },
  actionBtnOutline: {
    backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.cardBorder,
  },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  actionBtnTextOutline: { color: Colors.text },
});
