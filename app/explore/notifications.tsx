import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { notificationService } from "../../services/notificationService";
import { eventService } from "../../services/eventService";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../lib/api";
import { EmptyState } from "../../components/primitives";
import { NotifRowSkeleton } from "../../components/primitives/Skeletons";

type GroupInvite = {
  id: number;
  group_id: number;
  group_name: string;
  group_photo: string | null;
  invited_by: string;
};

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

function timeLabel(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

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

/** Moderation / account notices from Lokl (no personal sender). */
function isSystemAlert(item: ApiNotification) {
  return item.type === "alert" && !item.sender_name;
}

function NotifRow({ item }: { item: ApiNotification }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.row, item.unread && styles.rowUnread]}
      activeOpacity={0.75}
      onPress={() => setExpanded((v) => !v)}
    >
      {isSystemAlert(item) ? (
        <View style={styles.systemIcon}>
          <Ionicons name="shield-checkmark" size={22} color={Colors.primary} />
        </View>
      ) : (
        <Avatar uri={item.sender_avatar} />
      )}
      <View style={styles.rowContent}>
        <Text style={styles.rowText} numberOfLines={expanded ? undefined : 2}>
          <Text style={styles.rowName}>{item.sender_name ?? item.title} </Text>
          <Text style={styles.rowAction}>{item.description}</Text>
        </Text>
      </View>
      <Text style={styles.rowTime}>{timeLabel(item.created_at)}</Text>
    </TouchableOpacity>
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
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [answering, setAnswering] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchInvites = useCallback(async () => {
    try {
      const res = await eventService.getMyGroupInvites();
      const raw = res.data?.data ?? res.data;
      setInvites(Array.isArray(raw) ? raw : []);
    } catch {
      setInvites([]);
    }
  }, []);

  const answerInvite = async (invite: GroupInvite, accept: boolean) => {
    if (answering) return;
    setAnswering(invite.id);
    try {
      await eventService.respondGroupInvite(invite.id, accept);
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      if (accept) {
        showToast({ type: "success", title: "Joined", message: `You joined ${invite.group_name}.` });
        router.push(`/events/group-detail?id=${invite.group_id}` as never);
      }
    } catch (e) {
      showToast({ type: "error", title: "Error", message: getErrorMessage(e) });
    } finally {
      setAnswering(null);
    }
  };

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    fetchInvites();
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

  const invitesHeader =
    invites.length > 0 ? (
      <View style={styles.inviteWrap}>
        <Text style={styles.sectionLabel}>Group invitations</Text>
        {invites.map((inv) => (
          <View key={inv.id} style={styles.inviteCard}>
            {inv.group_photo ? (
              <Image source={{ uri: inv.group_photo }} style={styles.inviteImg} />
            ) : (
              <View style={[styles.inviteImg, styles.inviteImgEmpty]}>
                <Ionicons name="people" size={20} color={Colors.textSecondary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.inviteTitle} numberOfLines={1}>{inv.group_name}</Text>
              <Text style={styles.inviteSub} numberOfLines={1}>
                {inv.invited_by ? `${inv.invited_by} invited you` : "You were invited"}
              </Text>
              <View style={styles.inviteBtns}>
                <TouchableOpacity
                  style={[styles.inviteBtn, styles.inviteAccept]}
                  disabled={answering === inv.id}
                  onPress={() => answerInvite(inv, true)}
                >
                  <Text style={styles.inviteAcceptText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.inviteBtn, styles.inviteDecline]}
                  disabled={answering === inv.id}
                  onPress={() => answerInvite(inv, false)}
                >
                  <Text style={styles.inviteDeclineText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    ) : null;

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
        <View style={{ paddingTop: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => <NotifRowSkeleton key={i} />)}
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
          ListHeaderComponent={invitesHeader}
          ListEmptyComponent={
            invites.length > 0 ? null : (
              <EmptyState
                icon="notifications-off-outline"
                title="No notifications yet"
                subtitle="You're all caught up!"
              />
            )
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inviteWrap: { paddingBottom: 6 },
  inviteCard: {
    flexDirection: "row", gap: 12, marginHorizontal: 16, marginBottom: 10, padding: 12,
    backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  inviteImg: { width: 56, height: 56, borderRadius: 12 },
  inviteImgEmpty: { backgroundColor: Colors.inputBg, justifyContent: "center", alignItems: "center" },
  inviteTitle: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  inviteSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  inviteBtns: { flexDirection: "row", gap: 8, marginTop: 10 },
  inviteBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 50 },
  inviteAccept: { backgroundColor: Colors.primary },
  inviteAcceptText: { color: Colors.black, fontSize: 13, fontWeight: "700" },
  inviteDecline: { borderWidth: 1, borderColor: Colors.cardBorder },
  inviteDeclineText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  systemIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
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
