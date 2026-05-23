import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import LocationIcon from "../../assets/icons/locations.svg";
import CommentsIcon from "../../assets/icons/comments.svg";
import NavigateIcon from "../../assets/icons/navigate.svg";
import BookmarkIcon from "../../assets/icons/bookmark.svg";
import MessengerIcon from "../../assets/icons/messenger.svg";
import NotificationsIcon from "../../assets/icons/notifications.svg";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";

const { width } = Dimensions.get("window");

type ApiPost = {
  id: number;
  author_name?: string;
  author_avatar?: string | null;
  type?: string;
  tag?: string;
  body?: string;
  location?: string;
  image_url?: string | null;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  lokl_score?: string;
  is_liked?: boolean;
  is_saved?: boolean;
  created_at: string;
  tagged_groups?: { id: number; name: string }[];
};

type ApiGroup = {
  id: number;
  name: string;
  avatar: string | null;
  members_count?: number;
  description?: string;
};

function PostCard({
  item,
  router,
  onLike,
  onSave,
  onShare,
}: {
  item: ApiPost;
  router: any;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onShare: (id: number) => void;
}) {
  const avatarUri = item.author_avatar || undefined;

  return (
    <View style={postStyles.card}>
      <View style={postStyles.header}>
        <TouchableOpacity
          style={postStyles.userRow}
          onPress={() => router.push("/explore/user-profile")}
          activeOpacity={0.8}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={postStyles.avatar} />
          ) : (
            <View style={[postStyles.avatar, postStyles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color={Colors.textSecondary} />
            </View>
          )}
          <Text style={postStyles.userName}>{item.author_name || ""}</Text>
        </TouchableOpacity>
      </View>
       {/* Tag + Location + Score */}
      <View style={postStyles.metaRow}>
        <Text style={postStyles.tag}>{item.tag}</Text>
        <LocationIcon width={13} height={13} color={Colors.textSecondary} />
        <Text style={postStyles.metaText}>{item.location}</Text>
        <View style={postStyles.scoreBadge}>
          <Text style={postStyles.scoreText}>{item.lokl_score}</Text>
        </View>
      </View>

      {item.body ? (
        <Text style={postStyles.content} numberOfLines={2}>
          {item.body}
        </Text>
      ) : null}

      {item.image_url ? (
        <View style={postStyles.imageWrap}>
          <Image
            source={{ uri: item.image_url }}
            style={postStyles.postImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <View style={postStyles.actions}>
        <TouchableOpacity
          style={postStyles.actionBtn}
          onPress={() => onLike(item.id)}
        >
          <Ionicons
            name={item.is_liked ? "heart" : "heart-outline"}
            size={20}
            color={item.is_liked ? "#FF4444" : Colors.text}
          />
          <Text style={postStyles.actionText}>{item.likes ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionBtn}>
          <CommentsIcon width={20} height={20} color={Colors.text} />
          <Text style={postStyles.actionText}>{item.comments ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={postStyles.actionBtn}
          onPress={() => onShare(item.id)}
        >
          <NavigateIcon width={20} height={20} color={Colors.text} />
          <Text style={postStyles.actionText}>{item.shares ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={postStyles.actionBtn}
          onPress={() => onSave(item.id)}
        >
          <BookmarkIcon
            width={20}
            height={20}
            color={item.is_saved ? Colors.primary : Colors.text}
          />
          <Text style={postStyles.actionText}>{item.saves ?? 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function GroupCard({ item, router }: { item: ApiGroup; router: any }) {
  return (
    <TouchableOpacity
      style={groupStyles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/explore/group/${item.id}`)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={groupStyles.avatar} />
      ) : (
        <View style={[groupStyles.avatar, groupStyles.placeholder]}>
          <Ionicons name="people" size={28} color={Colors.textSecondary} />
        </View>
      )}
      <View style={groupStyles.info}>
        <Text style={groupStyles.name}>{item.name}</Text>
        {item.members_count != null && (
          <Text style={groupStyles.members}>{item.members_count} members</Text>
        )}
        {item.description ? (
          <Text style={groupStyles.desc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
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
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#7B61FF",
  },
  avatarPlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
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
  followingBtn: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(123,97,255,0.1)",
  },
  followText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  followingText: { color: Colors.primary },
  content: {
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    lineHeight: 20,
  },
  imageWrap: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  postImage: { width: "100%", height: 200 },
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

const groupStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  avatar: { width: 52, height: 52, borderRadius: 12 },
  placeholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  name: { color: Colors.text, fontSize: 15, fontWeight: "700", marginBottom: 2 },
  members: { color: Colors.textSecondary, fontSize: 12, marginBottom: 2 },
  desc: { color: Colors.textSecondary, fontSize: 13 },
});

export default function ExploreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"public" | "group">("public");

  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshingPosts, setRefreshingPosts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [refreshingGroups, setRefreshingGroups] = useState(false);

  const fetchingRef = useRef(false);

  const fetchPosts = useCallback(async (refresh = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (refresh) setRefreshingPosts(true);
    else setLoadingPosts(true);
    try {
      const res = await postService.getFeed(1);
      const payload = res.data?.data ?? res.data;
      const results: ApiPost[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      setPosts(results);
      setNextUrl(payload?.next ?? null);
    } catch (e) {
      console.log("[Explore] fetchPosts error:", getErrorMessage(e));
    } finally {
      setLoadingPosts(false);
      setRefreshingPosts(false);
      fetchingRef.current = false;
    }
  }, []);

  const fetchMorePosts = useCallback(async () => {
    if (!nextUrl || loadingMore || fetchingRef.current) return;
    fetchingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await postService.getFeedByUrl(nextUrl);
      const payload = res.data?.data ?? res.data;
      const results: ApiPost[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      setPosts((prev) => [...prev, ...results]);
      setNextUrl(payload?.next ?? null);
      console.log("[Explore] fetchMorePosts nextUrl:", results);
    } catch (e) {
      console.log("[Explore] fetchMorePosts error:", getErrorMessage(e));
    } finally {
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [nextUrl, loadingMore]);

  const fetchGroups = useCallback(async (refresh = false) => {
    if (refresh) setRefreshingGroups(true);
    else setLoadingGroups(true);
    try {
      const res = await postService.getGroups();
      const payload = res.data?.data ?? res.data;
      const results: ApiGroup[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      setGroups(results);

    } catch (e) {
      console.log("[Explore] fetchGroups error:", getErrorMessage(e));
    } finally {
      setLoadingGroups(false);
      setRefreshingGroups(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      fetchGroups();
    }, [fetchPosts, fetchGroups])
  );

  const handleLike = useCallback(async (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) }
          : p
      )
    );
    try {
      await postService.likePost(id);
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, is_liked: !p.is_liked, likes: (p.likes ?? 0) + (p.is_liked ? -1 : 1) }
            : p
        )
      );
    }
  }, []);

  const handleSave = useCallback(async (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) }
          : p
      )
    );
    try {
      await postService.savePost(id);
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, is_saved: !p.is_saved, saves: (p.saves ?? 0) + (p.is_saved ? -1 : 1) }
            : p
        )
      );
    }
  }, []);

  const handleShare = useCallback(async (id: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, shares: (p.shares ?? 0) + 1 } : p))
    );
    try {
      await postService.sharePost(id);
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, shares: (p.shares ?? 0) - 1 } : p))
      );
    }
  }, []);

  const renderPost = useCallback(
    ({ item }: { item: ApiPost }) => (
      <PostCard
        item={item}
        // isGroup={activeTab === "group"}
        router={router}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        // onFollow={handleFollow}
      />
    ),
    [activeTab, router, handleLike, handleSave, handleShare]
  );

  const renderGroup = useCallback(
    ({ item }: { item: ApiGroup }) => <GroupCard item={item} router={router} />,
    [router]
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  const renderEmpty = (isLoading: boolean) => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Nothing here yet</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("public")}>
            <Text
              style={[styles.tabText, activeTab === "public" && styles.tabTextActive]}
            >
              Public
            </Text>
          </TouchableOpacity>
          <Text style={styles.tabDivider}>|</Text>
          <TouchableOpacity onPress={() => setActiveTab("group")}>
            <Text
              style={[styles.tabText, activeTab === "group" && styles.tabTextActive]}
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

      {activeTab === "public" ? (
        <FlatList<ApiPost>
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchMorePosts}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => renderEmpty(loadingPosts)}
          refreshControl={
            <RefreshControl
              refreshing={refreshingPosts}
              onRefresh={() => fetchPosts(true)}
              tintColor={Colors.primary}
            />
          }
        />
      ) : (
        <FlatList<ApiGroup>
          data={groups}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGroup}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => renderEmpty(loadingGroups)}
          refreshControl={
            <RefreshControl
              refreshing={refreshingGroups}
              onRefresh={() => fetchGroups(true)}
              tintColor={Colors.primary}
            />
          }
        />
      )}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});
