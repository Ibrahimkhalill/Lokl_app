import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import { EmptyState } from "../../components/primitives";

type LikeUser = {
  id: number;
  name: string;
  avatar: string | null;
};

export default function PostLikesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [users, setUsers] = useState<LikeUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    postService
      .getLikes(Number(id))
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setUsers(data?.users ?? []);
      })
      .catch((e) => console.log("[PostLikes] error:", getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Like</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            users.length > 0 ? (
              <Text style={styles.sectionLabel}>New</Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState icon="heart-outline" title="No likes yet" subtitle="Be the first to like this post" />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={22} color={Colors.textSecondary} />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.name}{" "}
                  <Text style={styles.action}>liked your post</Text>
                </Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
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
  title: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  name: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  action: { color: Colors.textSecondary, fontWeight: "400" },
  separator: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 16,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});
