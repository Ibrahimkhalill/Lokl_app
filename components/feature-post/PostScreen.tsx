import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageIcon from "../../assets/icons/image.svg";
import TagIcon from "../../assets/icons/find.svg";
import ChevronDownIcon from "../../assets/icons/chevron-down.svg";
import { MediaPickerCard, FormField, AppTextInput } from "../primitives";
import { BottomSheet, BOTTOM_SHEET_MAX_LIST_HEIGHT } from "../overlays";
import { useToggleSet } from "../../hooks/useToggleSet";
import { pickPostMedia } from "../../lib/mediaPicker";
import { eventService } from "../../services/eventService";
import { userService } from "../../services/userService";
import { postService } from "../../services/postService";
import { getErrorMessage } from "../../lib/api";
import { reviewedVenueStore } from "../../lib/reviewedVenueStore";
import * as Location from "expo-location";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useToast } from "../../context/ToastContext";

type ApiGroup = {
  id: number;
  name: string;
  photo_url: string | null;
  members_count?: number;
};

type ApiFriend = {
  id: number;
  name: string;
  avatar: string | null;
  role?: string;
};

function Avatar({ uri, size = 38 }: { uri: string | null; size?: number }) {
  const s = { width: size, height: size, borderRadius: size / 2 };
  return uri ? (
    <Image source={{ uri }} style={s} />
  ) : (
    <View
      style={[
        s,
        { backgroundColor: Colors.card, justifyContent: "center", alignItems: "center" },
      ]}
    >
      <Ionicons name="person" size={size * 0.5} color={Colors.textSecondary} />
    </View>
  );
}

const SLIDER_MIN = 1;
const SLIDER_MAX = 10;
const THUMB_SIZE = 34;
const SLIDER_DEFAULT = 5.0;

export default function PostScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { event_id, venueId, groupId } = useLocalSearchParams<{ event_id?: string; venueId?: string; groupId?: string }>();
  const isReview = !!(event_id || venueId);

  const [caption, setCaption] = useState("");

  // Slider — Animated values for zero-rerender drag
  const [lokiScore, setLokiScore] = useState(SLIDER_DEFAULT);
  const trackWidthRef = useRef(1);
  const initialRatio = (SLIDER_DEFAULT - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
  const thumbAnim = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(initialRatio * 100)).current;
  const scoreDisplayRef = useRef(SLIDER_DEFAULT);
  const [scoreDisplay, setScoreDisplay] = useState(SLIDER_DEFAULT);

  const computeFromX = (x: number) => {
    const tw = trackWidthRef.current;
    const clamped = Math.min(Math.max(x, 0), tw);
    const ratio = clamped / tw;
    const next = SLIDER_MIN + ratio * (SLIDER_MAX - SLIDER_MIN);
    const newLeft = Math.max(0, Math.min(ratio * tw - THUMB_SIZE / 2, tw - THUMB_SIZE));
    thumbAnim.setValue(newLeft);
    fillAnim.setValue(ratio * 100);
    scoreDisplayRef.current = next;
    setScoreDisplay(Math.round(next * 10) / 10);
  };

  const sliderPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => computeFromX(e.nativeEvent.locationX),
      onPanResponderMove: (e) => computeFromX(e.nativeEvent.locationX),
      onPanResponderRelease: () => {
        setLokiScore(Math.round(scoreDisplayRef.current * 10) / 10);
      },
    })
  ).current;

  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [friends, setFriends] = useState<ApiFriend[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const { selected: selectedGroupIds, toggle: toggleGroupId, setSelected: resetGroupIds } = useToggleSet([]);
  const { selected: selectedFriendIds, toggle: toggleFriendId, setSelected: resetFriendIds } = useToggleSet([]);

  // "Where to post": "public" = special string key, group ids stored as strings
  const [postToPublic, setPostToPublic] = useState(!groupId);
  const { selected: postToGroupIds, toggle: togglePostToGroup, setSelected: resetPostToGroupIds } = useToggleSet(groupId ? [groupId] : []);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showPostToModal, setShowPostToModal] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<"image" | "video">("image");
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);

  const resetForm = () => {
    setCaption("");
    setMediaUri(null);
    setMediaKind("image");
    setVideoThumbnail(null);
    setPostToPublic(true);
    resetGroupIds([]);
    resetFriendIds([]);
    resetPostToGroupIds([]);
    setLokiScore(SLIDER_DEFAULT);
    setScoreDisplay(SLIDER_DEFAULT);
    const ratio = (SLIDER_DEFAULT - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
    const tw = trackWidthRef.current;
    thumbAnim.setValue(Math.max(0, Math.min(ratio * tw - THUMB_SIZE / 2, tw - THUMB_SIZE)));
    fillAnim.setValue(ratio * 100);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("body", caption);
      form.append("lokl_score", String(lokiScore.toFixed(1)));
      form.append("is_public", postToPublic ? "true" : "false");
      if (locationName) form.append("location", locationName);
      if (mediaUri) {
        const ext = mediaUri.split(".").pop() ?? "jpg";
        if (mediaKind === "video") {
          form.append("video", { uri: mediaUri, name: `video.${ext}`, type: `video/${ext}` } as any);
        } else {
          form.append("image", { uri: mediaUri, name: `image.${ext}`, type: `image/${ext}` } as any);
        }
      }
      selectedGroupIds.forEach((id) => form.append("tagged_group_ids", id));
      selectedFriendIds.forEach((id) => form.append("tagged_user_ids", id));
      postToGroupIds.forEach((id) => form.append("post_target_ids", id));
      if (event_id) form.append("event_id", event_id);
      if (venueId) form.append("venue_id", venueId);
      await postService.createPost(form);
      if (venueId) reviewedVenueStore.set(Number(venueId));
      resetForm();
      if (event_id || venueId) {
        router.back();
      } else {
        router.replace("/(tabs)/explore");
      }
    } catch (e) {
      showToast({ type: "error", title: "Error", message: getErrorMessage(e) || "Failed to share post." });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync(pos.coords);
      if (place) {
        const name = [place.city || place.district, place.country].filter(Boolean).join(", ");
        setLocationName(name || null);
      }
    })();

    console.log("[PostScreen] event_id:", event_id, "venueId:", venueId, "isReview:", isReview);
  }, [event_id, venueId, isReview]);

  useFocusEffect(
    useCallback(() => {
      setLoadingGroups(true);
      setLoadingFriends(true);

      eventService
        .getMyGroups()
        .then((res) => {
          const raw = res.data?.data ?? res.data;
          const data = Array.isArray(raw) ? raw : (raw?.results ?? []);
          setGroups(data);
        })
        .catch(() => {})
        .finally(() => setLoadingGroups(false));

      userService
        .getFriends()
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setFriends(Array.isArray(data) ? data : []);
        })
        .catch(() => {})
        .finally(() => setLoadingFriends(false));
    }, [])
  );

  const selectedGroupNames = groups
    .filter((g) => selectedGroupIds.includes(String(g.id)))
    .map((g) => g.name);

  const selectedFriendNames = friends
    .filter((f) => selectedFriendIds.includes(String(f.id)))
    .map((f) => f.name);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Share Your Content</Text>
          <Text style={styles.subtitle}>Share Your Moments With The World</Text>

          <MediaPickerCard
            height={140}
            previewUri={mediaUri}
            previewKind={mediaKind}
            videoThumbnailUri={videoThumbnail}
            onPress={async () => {
              const picked = await pickPostMedia();
              if (!picked) return;
              setMediaUri(picked.uri);
              setMediaKind(picked.type === "video" ? "video" : "image");
              if (picked.type === "video") {
                try {
                  const { uri } = await VideoThumbnails.getThumbnailAsync(picked.uri, { time: 0 });
                  setVideoThumbnail(uri);
                } catch {
                  setVideoThumbnail(null);
                }
              } else {
                setVideoThumbnail(null);
              }
            }}
            icon={
              <ImageIcon width={40} height={40} color={Colors.textSecondary} />
            }
            title="Select a image or video"
          />

          <FormField label="Add a Caption" style={{ marginBottom: 18 }}>
            <AppTextInput
              placeholder="add a caption"
              placeholderTextColor={Colors.textSecondary}
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
              style={styles.captionInput}
            />
          </FormField>

          {/* Tag your Groups */}
          <Text style={styles.label}>Tag your Groups</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowGroupModal(true)}
          >
            <TagIcon width={16} height={16} color={Colors.textSecondary} />
            {selectedGroupNames.length > 0 ? (
              <View style={styles.tagsRow}>
                {selectedGroupNames.map((name) => (
                  <View key={name} style={styles.groupTag}>
                    <Text style={styles.groupTagText}>{name}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.dropdownPlaceholder}>Choose Groups</Text>
            )}
            <ChevronDownIcon width={16} height={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Tag a friend */}
          <Text style={styles.label}>Tag a friend</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowFriendModal(true)}
          >
            <TagIcon width={16} height={16} color={Colors.textSecondary} />
            {selectedFriendNames.length > 0 ? (
              <View style={styles.tagsRow}>
                {selectedFriendNames.map((name) => (
                  <View key={name} style={styles.groupTag}>
                    <Text style={styles.groupTagText}>{name}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.dropdownPlaceholder}>Tag Friends</Text>
            )}
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Lokl Score */}
          <Text style={styles.label}>Lokl Score (1-10)</Text>
          <View style={styles.sliderWrap}>
            <View
              style={styles.sliderTrack}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                trackWidthRef.current = w;
                const ratio = (lokiScore - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
                thumbAnim.setValue(Math.max(0, Math.min(ratio * w - THUMB_SIZE / 2, w - THUMB_SIZE)));
                fillAnim.setValue(ratio * 100);
              }}
              {...sliderPan.panHandlers}
            >
              <Animated.View
                style={[
                  styles.sliderFill,
                  {
                    width: fillAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[styles.sliderThumb, { left: thumbAnim }]}
              >
                <Text style={styles.sliderThumbText}>{scoreDisplay.toFixed(1)}</Text>
              </Animated.View>
            </View>
          </View>

          {/* Location */}
          {/* {locationName ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.locationText}>{locationName}</Text>
            </View>
          ) : null} */}

          {/* Where to post */}
          <Text style={styles.label}>Where you want to post?</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowPostToModal((prev) => !prev)}
          >
            <Text style={styles.dropdownPlaceholder}>
              {postToPublic && postToGroupIds.length === 0
                ? "Public"
                : [
                    postToPublic ? "Public" : null,
                    ...groups
                      .filter((g) => postToGroupIds.includes(String(g.id)))
                      .map((g) => g.name),
                  ]
                    .filter(Boolean)
                    .join(", ") || "Select where to post..."}
            </Text>
            <Ionicons
              name={showPostToModal ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {showPostToModal && (
            <View style={styles.inlineDropdownList}>
              {/* Public option */}
              <TouchableOpacity
                style={styles.inlineDropdownItem}
                onPress={() => setPostToPublic((prev) => !prev)}
                activeOpacity={0.75}
              >
                <View style={[styles.checkbox, postToPublic && styles.checkboxChecked]}>
                  {postToPublic && (
                    <Ionicons name="checkmark" size={13} color={Colors.black} />
                  )}
                </View>
                <View style={styles.inlineItemLeft}>
                 
                  <Text style={styles.inlineDropdownText}>Public</Text>
                </View>
              </TouchableOpacity>

              {/* Real groups */}
              {loadingGroups ? (
                <View style={styles.inlineLoading}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : (
                groups.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={styles.inlineDropdownItem}
                    onPress={() => togglePostToGroup(String(g.id))}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        postToGroupIds.includes(String(g.id)) && styles.checkboxChecked,
                      ]}
                    >
                      {postToGroupIds.includes(String(g.id)) && (
                        <Ionicons name="checkmark" size={13} color={Colors.black} />
                      )}
                    </View>
                    <View style={styles.inlineItemLeft}>
                     
                      <Text style={styles.inlineDropdownText}>{g.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.shareBtn, submitting && { opacity: 0.6 }]}
            disabled={submitting}
            onPress={handleSubmit}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.black} />
            ) : (
              <Text style={styles.shareBtnText}>Share</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Tag Groups Bottom Sheet */}
      <BottomSheet
        visible={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Tag your Groups"
        subtitle=""
      >
        <View style={styles.groupsField}>
          <TagIcon width={16} height={16} color={Colors.textSecondary} />
          <Text style={styles.groupsFieldText}>Choose Groups</Text>
        </View>
        <ScrollView style={styles.sheetList}>
          {loadingGroups ? (
            <View style={styles.sheetLoading}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : groups.length === 0 ? (
            <Text style={styles.sheetEmpty}>No groups found</Text>
          ) : (
            groups.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.sheetItem,
                  selectedGroupIds.includes(String(g.id)) && styles.sheetItemActive,
                ]}
                onPress={() => toggleGroupId(String(g.id))}
                activeOpacity={0.7}
              >
                <View style={styles.sheetItemLeft}>
                  <Avatar uri={g.photo_url} size={42} />
                  <Text
                    style={[
                      styles.sheetItemText,
                      selectedGroupIds.includes(String(g.id)) && styles.sheetItemTextActive,
                    ]}
                  >
                    {g.name}
                  </Text>
                </View>
                {selectedGroupIds.includes(String(g.id)) && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
        <TouchableOpacity
          style={styles.sheetDoneBtn}
          onPress={() => setShowGroupModal(false)}
        >
          <Text style={styles.sheetDoneText}>Done</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Tag Friends Bottom Sheet */}
      <BottomSheet
        visible={showFriendModal}
        onClose={() => setShowFriendModal(false)}
        title="Tag a friend"
        subtitle=""
      >
        <View style={styles.groupsField}>
          <TagIcon width={16} height={16} color={Colors.textSecondary} />
          <Text style={styles.groupsFieldText}>Tag Friends</Text>
        </View>
        <ScrollView style={styles.sheetList}>
          {loadingFriends ? (
            <View style={styles.sheetLoading}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : friends.length === 0 ? (
            <Text style={styles.sheetEmpty}>No friends found</Text>
          ) : (
            friends.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.sheetItem,
                  selectedFriendIds.includes(String(f.id)) && styles.sheetItemActive,
                ]}
                onPress={() => toggleFriendId(String(f.id))}
                activeOpacity={0.7}
              >
                <View style={styles.sheetItemLeft}>
                  <Avatar uri={f.avatar} size={42} />
                  <View>
                    <Text
                      style={[
                        styles.sheetItemText,
                        selectedFriendIds.includes(String(f.id)) && styles.sheetItemTextActive,
                      ]}
                    >
                      {f.name}
                    </Text>
                   
                  </View>
                </View>
                {selectedFriendIds.includes(String(f.id)) && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
        <TouchableOpacity
          style={styles.sheetDoneBtn}
          onPress={() => setShowFriendModal(false)}
        >
          <Text style={styles.sheetDoneText}>Done</Text>
        </TouchableOpacity>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 120 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
  },

  title: { color: Colors.text, fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginBottom: 22 },

  label: { color: Colors.text, fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 4 },

  captionInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    color: Colors.text,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 18,
  },

  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 15,
    gap: 5,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  dropdownPlaceholder: { flex: 1, color: Colors.textSecondary, fontSize: 14 },

  tagsRow: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  groupTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  groupTagText: { color: Colors.text, fontSize: 12 },

  groupsField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  groupsFieldText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "500" },

  inlineDropdownList: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    marginTop: -8,
    marginBottom: 18,
    paddingVertical: 6,
    overflow: "hidden",
  },
  inlineDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inlineItemLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  inlinePublicAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  inlineDropdownText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "500" },
  inlineLoading: { paddingVertical: 12, alignItems: "center" },

  sliderWrap: { marginBottom: 28, paddingHorizontal: 4 },
  sliderTrack: {
    marginTop: 10,
    height: 6,
    backgroundColor: Colors.cardBorder,
    borderRadius: 3,
    position: "relative",
    marginBottom: 8,
  },
  sliderFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 3 },
  sliderThumb: {
    position: "absolute",
    top: -15,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderThumbText: { color: Colors.text, fontSize: 10, fontWeight: "700" },

  shareBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  shareBtnText: { color: Colors.black, fontSize: 17, fontWeight: "700" },

  sheetList: { maxHeight: BOTTOM_SHEET_MAX_LIST_HEIGHT },
  sheetLoading: { paddingVertical: 32, alignItems: "center" },
  sheetEmpty: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 24,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  sheetItemActive: { backgroundColor: "rgba(255,255,255,0.05)" },
  sheetItemLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  sheetItemText: { color: Colors.text, fontSize: 15, fontWeight: "500" },
  sheetItemTextActive: { color: Colors.primary },
  sheetItemRole: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sheetDoneBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetDoneText: { color: Colors.black, fontSize: 16, fontWeight: "700" },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 16,
  },
  locationText: { color: Colors.textSecondary, fontSize: 13 },
});
