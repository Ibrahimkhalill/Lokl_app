import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  TextInput,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { useToast } from "../../context/ToastContext";
import { api, getErrorMessage } from "../../lib/api";
import { userService } from "../../services/userService";
import { messageService } from "../../services/messageService";
import { postService } from "../../services/postService";
import { sharedPostStore } from "../../lib/sharedPostStore";

type Target = { key: string; kind: "group" | "friend"; id: number; name: string; avatar: string | null };

const RECENT_KEY = "lokl_recent_shares";

/**
 * One share page for venues, events and posts: send to groups, send to friends (straight into the chat, with an
 * optional comment) or send externally through the phone's own share sheet.
 */
export default function ShareScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const p = useLocalSearchParams<{
    title?: string;
    subtitle?: string;
    image?: string;
    imageUrl?: string;
    link?: string;
    type?: string;
    postId?: string;
  }>();

  const type = p.type ?? (p.postId ? "post" : "event");
  const title = p.title ?? "Check this out on Lokl";
  const subtitle = p.subtitle ?? "";
  const image = p.image || p.imageUrl || null;
  const link = p.link || (p.postId ? `https://lokl.app/post/${p.postId}` : "");
  const label = type === "post" ? "Post" : type === "venue" ? "Venue" : "Event";

  const [tab, setTab] = useState<"groups" | "friends">("groups");
  const [search, setSearch] = useState("");
  const [comment, setComment] = useState("");
  const [groups, setGroups] = useState<Target[]>([]);
  const [friends, setFriends] = useState<Target[]>([]);
  const [recent, setRecent] = useState<Target[]>([]);
  const [picked, setPicked] = useState<Record<string, Target>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const recorded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(RECENT_KEY);
        if (raw) setRecent(JSON.parse(raw));
      } catch {}
      const [g, f] = await Promise.allSettled([api.get("/groups/?member=me&page_size=50"), userService.getFriends()]);
      if (g.status === "fulfilled") {
        const d = g.value.data?.data ?? g.value.data;
        const list = Array.isArray(d) ? d : d?.results ?? [];
        setGroups(
          list.map((x: any) => ({ key: `g${x.id}`, kind: "group" as const, id: x.id, name: x.name, avatar: x.photo_url ?? x.cover_image ?? null }))
        );
      }
      if (f.status === "fulfilled") {
        const d = f.value.data?.data ?? f.value.data;
        const list = Array.isArray(d) ? d : d?.results ?? [];
        setFriends(
          list.map((x: any) => ({ key: `f${x.id}`, kind: "friend" as const, id: x.id, name: x.name ?? x.username, avatar: x.avatar ?? x.profile_picture ?? null }))
        );
      }
      setLoading(false);
    })();
  }, []);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const src = tab === "groups" ? groups : friends;
    return q ? src.filter((t) => t.name?.toLowerCase().includes(q)) : src;
  }, [tab, groups, friends, search]);

  const toggle = (t: Target) =>
    setPicked((prev) => {
      const next = { ...prev };
      if (next[t.key]) delete next[t.key];
      else next[t.key] = t;
      return next;
    });

  const pickedList = Object.values(picked);

  const recordShare = () => {
    if (recorded.current) return;
    recorded.current = true;
    const id = Number(p.postId);
    if (id) {
      postService.sharePost(id).catch(() => {});
      sharedPostStore.set(id);
    }
  };

  const buildMessage = () => {
    const lines = [comment.trim(), `${label}: ${title}${subtitle ? ` - ${subtitle}` : ""}`, link].filter(Boolean);
    return lines.join("\n");
  };

  const handleSend = async () => {
    if (!pickedList.length || sending) return;
    Keyboard.dismiss();
    setSending(true);
    const text = buildMessage();
    const results = await Promise.allSettled(
      pickedList.map((t) =>
        t.kind === "group" ? messageService.sendGroupMessage(t.id, text) : messageService.sendDm(t.id, text)
      )
    );
    const ok = pickedList.filter((_, i) => results[i].status === "fulfilled");
    const failed = results.length - ok.length;
    setSending(false);
    if (ok.length) {
      recordShare();
      try {
        const merged = [...ok, ...recent.filter((r) => !ok.some((o) => o.key === r.key))].slice(0, 10);
        await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(merged));
      } catch {}
      showToast({
        type: failed ? "error" : "success",
        title: "Sent",
        message: failed
          ? `Sent to ${ok.length}. ${failed} could not be sent.`
          : `Sent to ${ok.length} ${ok.length === 1 ? "chat" : "chats"}.`,
      });
      router.back();
    } else {
      const firstErr = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
      showToast({ type: "error", title: "Could not send", message: getErrorMessage(firstErr?.reason) });
    }
  };

  const handleExternal = async () => {
    try {
      const message = [comment.trim(), `${title}${subtitle ? `\n${subtitle}` : ""}`, link].filter(Boolean).join("\n");
      const res = await Share.share({ message, title });
      if (res.action === Share.sharedAction) recordShare();
    } catch {
      showToast({ type: "error", title: "Error", message: "Could not open the share sheet." });
    }
  };

  const avatar = (t: Target) =>
    t.avatar ? (
      <Image source={{ uri: t.avatar }} style={s.avatar} />
    ) : (
      <View style={[s.avatar, s.avatarEmpty]}>
        <Ionicons name={t.kind === "group" ? "people" : "person"} size={16} color={Colors.textSecondary} />
      </View>
    );

  const row = (t: Target) => {
    const on = !!picked[t.key];
    return (
      <TouchableOpacity key={t.key} style={s.row} onPress={() => toggle(t)} activeOpacity={0.8}>
        {avatar(t)}
        <Text style={s.name} numberOfLines={1}>{t.name}</Text>
        <View style={[s.check, on && s.checkOn]}>{on && <Ionicons name="checkmark" size={14} color={Colors.black} />}</View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Share</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.preview}>
        {image ? (
          <Image source={{ uri: image }} style={s.previewImg} />
        ) : (
          <View style={[s.previewImg, s.avatarEmpty]}>
            <Ionicons
              name={type === "venue" ? "location-outline" : type === "post" ? "image-outline" : "calendar-outline"}
              size={22}
              color={Colors.textSecondary}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.previewTitle} numberOfLines={1}>{title}</Text>
          {!!subtitle && <Text style={s.previewSub} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>

      <TextInput
        style={s.comment}
        value={comment}
        onChangeText={setComment}
        placeholder="Add a comment (optional)"
        placeholderTextColor={Colors.textSecondary}
        multiline
      />

      <View style={s.tabs}>
        {(["groups", "friends"] as const).map((k) => (
          <TouchableOpacity
            key={k}
            style={[s.tab, tab === k && s.tabOn]}
            onPress={() => {
              Keyboard.dismiss();
              setTab(k);
            }}
          >
            <Text style={[s.tabText, tab === k && s.tabTextOn]}>{k === "groups" ? "Send to Groups" : "Send to Friends"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={tab === "groups" ? "Search groups" : "Search friends"}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          data={list}
          keyExtractor={(t) => t.key}
          renderItem={({ item }) => row(item)}
          ListHeaderComponent={
            recent.length && !search ? (
              <View>
                <Text style={s.sectionLabel}>Recently Shared</Text>
                {recent.map((t) => row(t))}
                <Text style={s.sectionLabel}>{tab === "groups" ? "Groups" : "Friends"}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={<Text style={s.empty}>{tab === "groups" ? "No groups yet." : "No friends to show yet."}</Text>}
          contentContainerStyle={{ paddingBottom: 150 }}
        />
      )}

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.sendBtn, (!pickedList.length || sending) && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!pickedList.length || sending}
        >
          {sending ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <Text style={s.sendText}>{pickedList.length ? `Send to ${pickedList.length}` : "Pick who to send to"}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={s.externalBtn} onPress={handleExternal}>
          <Ionicons name="share-outline" size={18} color={Colors.text} />
          <Text style={s.externalText}>Send External</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.cardBorder, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: "800" },
  preview: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, padding: 10, borderRadius: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  previewImg: { width: 52, height: 52, borderRadius: 10 },
  previewTitle: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  previewSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  comment: { marginHorizontal: 16, marginTop: 12, minHeight: 44, maxHeight: 90, color: Colors.text, backgroundColor: Colors.inputBg, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  tabs: { flexDirection: "row", gap: 8, marginHorizontal: 16, marginTop: 14 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.cardBorder },
  tabOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "600" },
  tabTextOn: { color: Colors.black, fontWeight: "700" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.cardBorder },
  searchInput: { flex: 1, color: Colors.text, paddingVertical: 10, fontSize: 14 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginHorizontal: 16, marginTop: 14, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarEmpty: { backgroundColor: Colors.card, justifyContent: "center", alignItems: "center" },
  name: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: "600" },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.cardBorder, justifyContent: "center", alignItems: "center" },
  checkOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  empty: { color: Colors.textSecondary, textAlign: "center", marginTop: 30 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 28, gap: 10, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 50, height: 50, justifyContent: "center", alignItems: "center" },
  sendText: { color: Colors.black, fontSize: 15, fontWeight: "700" },
  externalBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, height: 46, borderRadius: 50, borderWidth: 1, borderColor: Colors.cardBorder },
  externalText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
});
