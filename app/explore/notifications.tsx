import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { notificationService } from "../../services/notificationService";
import { getErrorMessage } from "../../lib/api";
import { EmptyState } from "../../components/primitives";

type ApiNotification = {
  id: number;
  title: string;
  description: string;
  type: string;
  time: string;
  unread: boolean;
  created_at: string;
  sender_id?: number;
  sender_name?: string;
  sender_avatar?: string | null;
};

function Avatar({ uri, size = 46 }: { uri?: string | null; size?: number }) {
  const s = { width: size, height: size, borderRadius: size / 2 };
  return uri ? (
    <Image source={{ uri }} style={s} />
  ) : (
    <View style={[s, styles.avatarPlaceholder]}>
      <Ionicons name="person" size={size * 0.5} color={Colors.textSecondary} />
    </View>
  );
}

function NotifRow({ item }: { item: ApiNotification }) {
  return (
    <View style={[styles.row, item.unread && styles.rowUnread]}>
      <Avatar uri={item.sender_avatar} />
      <View style={styles.rowContent}>
        <Text style={styles.rowText} numberOfLines={2}>
          <Text style={styles.rowName}>{item.sender_name ?? item.title} </Text>
          <Text style={styles.rowAction}>{item.description}</Text>
        </Text>
      </View>
      <Text style={styles.rowTime}>{item.time}</Text>
    </View>
  );
}

type ListItem =
  | { kind: "label"; label: string; id: string }
  | { kind: "notif"; data: ApiNotification; id: string };

function buildList(notifications: ApiNotification[]): ListItem[] {
  const newItems = notifications.filter((n) => n.unread);
  const earlier = notifications.filter((n) => !n.unread);
  const list: ListItem[] = [];
  if (newItems.length > 0) {
    list.push({ kind: "label", label: "New", id: "label-new" });
    newItems.forEach((n) => list.push({ kind: "notif", data: n, id: String(n.id) }));
  }
  if (earlier.length > 0) {
    list.push({ kind: "label", label: "Earlier", id: "label-earlier" });
    earlier.forEach((n) => list.push({ kind: "notif", data: n, id: `e-${n.id}` }));
  }
  return list;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      const raw = res.data?.data ?? res.data;
      setNotifications(Array.isArray(raw) ? raw : (raw?.results ?? []));
    } catch (e) {
      console.log("[Notifications] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const listData = buildList(notifications);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => {
            if (item.kind === "label") {
              return <Text style={styles.sectionLabel}>{item.label}</Text>;
            }
            return <NotifRow item={item.data} />;
          }}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="No notifications yet"
              subtitle="You're all caught up!"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  headerTitle: { color: Colors.text, fontSize: 20, fontWeight: "700" },
  sectionLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowUnread: {
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  rowContent: { flex: 1 },
  rowText: { fontSize: 14, lineHeight: 20 },
  rowName: { color: Colors.text, fontWeight: "700" },
  rowAction: { color: Colors.textSecondary },
  rowTime: { color: Colors.textSecondary, fontSize: 12, alignSelf: "flex-start", marginTop: 2 },
  separator: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 16,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingTop: 80 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});
