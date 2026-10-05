import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import PushIcon from "../../assets/icons/push.svg";
import EmailIcon from "../../assets/icons/email.svg";
import SmsIcon from "../../assets/icons/sms.svg";
import { settingService } from "../../services/settingServices";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function NotificationsSettingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Channels
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);

  // Activity alerts
  const [friendRanking, setFriendRanking] = useState(true);
  const [postLikes, setPostLikes] = useState(true);
  const [postComments, setPostComments] = useState(true);
  const [friendJoinsEvent, setFriendJoinsEvent] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [newVenues, setNewVenues] = useState(false);

  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { showToast } = useToast();
  const saveSeq = useRef<Record<string, number>>({});

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    settingService.getNotifications().then((res) => {
      const d = res.data?.data ?? res.data;
      setPush(d.push_notifications ?? true);
      setEmail(d.email_notifications ?? true);
      setSms(d.sms_notifications ?? false);
      setFriendRanking(d.notify_friend_ranking ?? true);
      setPostLikes(d.notify_post_likes ?? true);
      setPostComments(d.notify_post_comments ?? true);
      setFriendJoinsEvent(d.notify_friend_joins_event ?? true);
      setEventReminders(d.notify_event_reminders ?? true);
      setNewVenues(d.notify_new_venues ?? false);
    }).catch(() => setLoadError(true)) // don't present defaults as if they were the real settings
      .finally(() => setLoading(false));
  }, [reloadKey]);

  /** Persists a toggle; on failure runs `revert` (unless a newer change superseded it) and tells the user. */
  function save(patch: Parameters<typeof settingService.updateNotifications>[0], revert: () => void) {
    const key = Object.keys(patch)[0];
    const seq = (saveSeq.current[key] = (saveSeq.current[key] ?? 0) + 1);
    settingService.updateNotifications(patch).catch((e) => {
      if (saveSeq.current[key] !== seq) return;
      revert();
      showToast({ type: "error", title: "Couldn't save setting", message: getErrorMessage(e) });
    });
  }

  const CHANNELS = [
    {
      label: "Push Notifications",
      sub: "Receive notification on your device",
      icon: <PushIcon width={24} height={24} color={Colors.primary} />,
      value: push,
      onChange: (v: boolean) => { setPush(v); save({ push_notifications: v }, () => setPush(!v)); },
    },
    {
      label: "Email Notifications",
      sub: "Get updates via email",
      icon: <EmailIcon width={24} height={24} color={Colors.primary} />,
      value: email,
      onChange: (v: boolean) => { setEmail(v); save({ email_notifications: v }, () => setEmail(!v)); },
    },
    {
      label: "SMS Notifications",
      sub: "Text message alerts",
      icon: <SmsIcon width={24} height={24} color={Colors.primary} />,
      value: sms,
      onChange: (v: boolean) => { setSms(v); save({ sms_notifications: v }, () => setSms(!v)); },
    },
  ];

  const ACTIVITY: { label: string; sub: string; icon: string; value: boolean; onChange: (v: boolean) => void }[] = [
    {
      label: "Friend Rankings",
      sub: "When friends post a new ranking",
      icon: "trending-up-outline",
      value: friendRanking,
      onChange: (v: boolean) => { setFriendRanking(v); save({ notify_friend_ranking: v }, () => setFriendRanking(!v)); },
    },
    {
      label: "Post Likes",
      sub: "When someone likes your post",
      icon: "heart-outline",
      value: postLikes,
      onChange: (v: boolean) => { setPostLikes(v); save({ notify_post_likes: v }, () => setPostLikes(!v)); },
    },
    {
      label: "Post Comments",
      sub: "When someone comments on your post",
      icon: "chatbubble-outline",
      value: postComments,
      onChange: (v: boolean) => { setPostComments(v); save({ notify_post_comments: v }, () => setPostComments(!v)); },
    },
    {
      label: "Friends at Events",
      sub: "When a friend joins an event you're in",
      icon: "people-outline",
      value: friendJoinsEvent,
      onChange: (v: boolean) => { setFriendJoinsEvent(v); save({ notify_friend_joins_event: v }, () => setFriendJoinsEvent(!v)); },
    },
    {
      label: "Event Reminders",
      sub: "1 hour before events you've joined",
      icon: "alarm-outline",
      value: eventReminders,
      onChange: (v: boolean) => { setEventReminders(v); save({ notify_event_reminders: v }, () => setEventReminders(!v)); },
    },
    {
      label: "New Venues Nearby",
      sub: "When new venues are added near you",
      icon: "location-outline",
      value: newVenues,
      onChange: (v: boolean) => { setNewVenues(v); save({ notify_new_venues: v }, () => setNewVenues(!v)); },
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : loadError ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 }}>
          <Text style={{ color: Colors.textSecondary, textAlign: "center" }}>
            Couldn&apos;t load your settings. Check your connection and try again.
          </Text>
          <TouchableOpacity
            onPress={() => setReloadKey((k) => k + 1)}
            style={{ backgroundColor: Colors.primary, borderRadius: 24, paddingHorizontal: 28, paddingVertical: 12 }}
          >
            <Text style={{ color: Colors.black, fontWeight: "700" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Channels */}
          <View style={s.card}>
            <Text style={s.sectionTitle}>NOTIFICATION CHANNELS</Text>
            {CHANNELS.map((ch, i) => (
              <View key={ch.label}>
                {i > 0 && <View style={s.divider} />}
                <View style={s.row}>
                  <View style={s.rowLeft}>
                    <View style={s.iconWrap}>{ch.icon}</View>
                    <View style={s.rowTexts}>
                      <Text style={s.rowLabel}>{ch.label}</Text>
                      <Text style={s.rowSub}>{ch.sub}</Text>
                    </View>
                  </View>
                  <View style={s.switchWrap}>
                    <Switch
                      value={ch.value}
                      onValueChange={ch.onChange}
                      trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                      thumbColor={Colors.white}
                      ios_backgroundColor={Colors.cardBorder}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Activity Alerts */}
          <View style={s.card}>
            <Text style={s.sectionTitle}>ACTIVITY ALERTS</Text>
            {ACTIVITY.map((item, i) => (
              <View key={item.label}>
                {i > 0 && <View style={s.divider} />}
                <View style={s.row}>
                  <View style={s.rowLeft}>
                    <View style={s.iconWrap}>
                      <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                    </View>
                    <View style={s.rowTexts}>
                      <Text style={s.rowLabel}>{item.label}</Text>
                      <Text style={s.rowSub}>{item.sub}</Text>
                    </View>
                  </View>
                  <View style={s.switchWrap}>
                    <Switch
                      value={item.value}
                      onValueChange={item.onChange}
                      trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                      thumbColor={Colors.white}
                      ios_backgroundColor={Colors.cardBorder}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingBottom: 60, gap: 16 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11, fontWeight: "700", letterSpacing: 0.8,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  rowTexts: { flex: 1, flexShrink: 1 },
  iconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#3D4A1A",
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },

  rowLabel: { color: Colors.text, fontSize: 14, fontWeight: "600", marginBottom: 2 },
  rowSub: { color: Colors.textSecondary, fontSize: 12 },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginHorizontal: 16 },
  switchWrap: { flexShrink: 0 },
});
