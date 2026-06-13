import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageIcon from "../../assets/icons/image.svg";
import CheckIcon from "../../assets/icons/check.svg";
import { MediaPickerCard, FormField, AppTextInput } from "../../components/primitives";
import { LocationPickerModal, type LocationResult } from "../../components/primitives/LocationPickerModal";
import { pickCoverImage } from "../../lib/mediaPicker";
import { eventService } from "../../services/eventService";
import { userService } from "../../services/userService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const ACTIVITY_CATEGORIES = [
  { value: "boxing_combat",     label: "Boxing & Combat" },
  { value: "yoga_pilates",      label: "Yoga & Pilates" },
  { value: "strength_crossfit", label: "Strength & CrossFit" },
  { value: "court_sports",      label: "Court Sports" },
  { value: "cycling_cardio",    label: "Cycling & Cardio" },
  { value: "outdoor_adventure", label: "Outdoor & Adventure" },
  { value: "classes_studios",   label: "Classes & Studios" },
  { value: "wellness_recovery", label: "Wellness & Recovery" },
];

const NYC_NEIGHBORHOODS = [
  { value: "west_village",      label: "West Village" },
  { value: "fidi",              label: "FiDi" },
  { value: "east_village",      label: "East Village" },
  { value: "lower_east_side",   label: "Lower East Side" },
  { value: "tribeca",           label: "Tribeca" },
  { value: "midtown",           label: "Midtown" },
  { value: "murray_hill",       label: "Murray Hill" },
  { value: "chelsea",           label: "Chelsea" },
  { value: "soho",              label: "SoHo" },
  { value: "noho",              label: "NoHo" },
  { value: "nolita",            label: "Nolita" },
  { value: "battery_park",      label: "Battery Park" },
  { value: "flatiron",          label: "Flatiron" },
  { value: "gramercy",          label: "Gramercy" },
  { value: "hudson_square",     label: "Hudson Square" },
  { value: "hudson_yards",      label: "Hudson Yards" },
  { value: "greenwich_village", label: "Greenwich Village" },
  { value: "upper_west_side",   label: "Upper West Side" },
  { value: "upper_east_side",   label: "Upper East Side" },
];

type Friend = {
  id: number;
  name: string;
  avatar: string | null;
  bio?: string;
  role?: string;
};

type PickerItem = { value: string; label: string };

function PickerModal({
  visible,
  title,
  items,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: PickerItem[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [modalVisible, setModalVisible] = useState(visible);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const dismiss = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      onCloseRef.current();
    });
  }, [translateY]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      } as any).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible, translateY]);

  const dismissRef = useRef(dismiss);
  useEffect(() => { dismissRef.current = dismiss; }, [dismiss]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 140 || g.vy > 0.8) {
          dismissRef.current();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={dismiss}>
      <TouchableOpacity style={pm.backdrop} activeOpacity={1} onPress={dismiss} />
      <Animated.View style={[pm.sheet, { transform: [{ translateY }] }]}>
        <View {...panResponder.panHandlers} style={pm.dragArea}>
          <View style={pm.handle} />
          <View style={pm.sheetHeader}>
            <Text style={pm.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={dismiss} style={pm.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={items}
          keyExtractor={(i) => i.value}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const isSelected = selected === item.value;
            return (
              <TouchableOpacity
                style={[pm.option, isSelected && pm.optionActive]}
                onPress={() => { onSelect(item.value); dismiss(); }}
                activeOpacity={0.7}
              >
                <Text style={[pm.optionText, isSelected && pm.optionTextActive]}>
                  {item.label}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>
    </Modal>
  );
}

export default function GroupCreateScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupPhotoUri, setGroupPhotoUri] = useState<string | null>(null);
  const [groupPhotoFile, setGroupPhotoFile] = useState<{ uri: string; name: string; type: string } | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [activityTag, setActivityTag] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState("");

  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [showNeighborhoodPicker, setShowNeighborhoodPicker] = useState(false);

  const [meetupLocation, setMeetupLocation] = useState<LocationResult | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingFriends(true);
      try {
        const res = await userService.getFriends();
        const data = res.data;
        const list = data?.data ?? data;
        setFriends(Array.isArray(list) ? list : list?.results ?? []);
      } catch (e) {
        console.log("[GroupCreate] friends error:", getErrorMessage(e));
      } finally {
        setLoadingFriends(false);
      }
    })();
  }, []);

  const toggleFriend = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      showToast({ type: "warning", title: "Validation", message: "Group name is required." });
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", groupName.trim());
      if (description.trim()) form.append("bio", description.trim());
      if (activityTag) form.append("activity_tag", activityTag);
      if (neighborhood) form.append("neighborhood", neighborhood);
      form.append("is_private", isPrivate ? "true" : "false");
      if (maxMembers.trim()) form.append("max_members", maxMembers.trim());
      if (meetupLocation) {
        form.append("meetup_location_name", meetupLocation.address);
        form.append("meetup_latitude", meetupLocation.latitude.toFixed(6));
        form.append("meetup_longitude", meetupLocation.longitude.toFixed(6));
      }
      if (groupPhotoFile) {
        form.append("photo", {
          uri: groupPhotoFile.uri,
          name: groupPhotoFile.name,
          type: groupPhotoFile.type,
        } as any);
      }
      selectedIds.forEach((id) => form.append("member_ids", String(id)));

      await eventService.createSocialGroup(form);
      router.back();
    } catch (e) {
      showToast({ type: "error", title: "Error", message: getErrorMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const activityLabel = ACTIVITY_CATEGORIES.find((c) => c.value === activityTag)?.label;
  const neighborhoodLabel = NYC_NEIGHBORHOODS.find((n) => n.value === neighborhood)?.label;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Create Group</Text>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.photoLabel}>Group Photo</Text>
          <MediaPickerCard
            height={150}
            previewUri={groupPhotoUri}
            previewKind="image"
            onPress={async () => {
              const picked = await pickCoverImage();
              if (picked) {
                setGroupPhotoUri(picked.uri);
                const ext = picked.uri.split(".").pop() ?? "jpg";
                setGroupPhotoFile({
                  uri: picked.uri,
                  name: `group_${Date.now()}.${ext}`,
                  type: picked.type === "video" ? "video/mp4" : "image/jpeg",
                });
              }
            }}
            icon={<ImageIcon width={36} height={36} color={Colors.text} />}
            title="Group Photo"
            subtitle="Upload a photo"
          />

          {/* Group Name */}
          <FormField label="Group Name" labelStyle={s.fieldLabel}>
            <AppTextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="e.g. Sports Club"
              placeholderTextColor={Colors.textMuted}
            />
          </FormField>

          {/* Description */}
          <FormField label="Description" labelStyle={s.fieldLabel}>
            <AppTextInput
              style={s.bioInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Tell people what this group is about"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </FormField>

          {/* Activity — modal dropdown */}
          <FormField label="Activity / Sport" labelStyle={s.fieldLabel}>
            <TouchableOpacity
              style={s.dropdownBtn}
              onPress={() => setShowActivityPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[s.dropdownText, !!activityLabel && s.dropdownTextSelected]}>
                {activityLabel ?? "Select a category"}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </FormField>

          {/* Neighborhood — modal dropdown */}
          <FormField label="Neighborhood" labelStyle={s.fieldLabel}>
            <TouchableOpacity
              style={s.dropdownBtn}
              onPress={() => setShowNeighborhoodPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[s.dropdownText, !!neighborhoodLabel && s.dropdownTextSelected]}>
                {neighborhoodLabel ?? "Select a neighborhood"}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </FormField>

          {/* Public / Private toggle buttons */}
          <FormField label="Visibility" labelStyle={s.fieldLabel}>
            <View style={s.toggleBtnRow}>
              <TouchableOpacity
                style={[s.toggleBtn, !isPrivate && s.toggleBtnActive]}
                onPress={() => setIsPrivate(false)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="globe-outline"
                  size={16}
                  color={!isPrivate ? Colors.black : Colors.textSecondary}
                />
                <Text style={[s.toggleBtnText, !isPrivate && s.toggleBtnTextActive]}>Public</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.toggleBtn, isPrivate && s.toggleBtnActive]}
                onPress={() => setIsPrivate(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={isPrivate ? Colors.black : Colors.textSecondary}
                />
                <Text style={[s.toggleBtnText, isPrivate && s.toggleBtnTextActive]}>Private</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.toggleHint}>
              {isPrivate
                ? "Only approved members can see and join this group."
                : "Anyone can find and join this group."}
            </Text>
          </FormField>

          {/* Max Members */}
          <FormField label="Max Members (optional)" labelStyle={s.fieldLabel}>
            <AppTextInput
              value={maxMembers}
              onChangeText={setMaxMembers}
              placeholder="e.g. 20"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
            />
          </FormField>

          {/* Meetup Location */}
          <FormField label="Meetup Location" labelStyle={s.fieldLabel}>
            <TouchableOpacity style={s.locationBtn} onPress={() => setLocationModalVisible(true)} activeOpacity={0.7}>
              <Ionicons name="location-outline" size={18} color={meetupLocation ? Colors.primary : Colors.textMuted} />
              <Text style={[s.locationBtnText, meetupLocation && s.locationBtnTextSelected]} numberOfLines={1}>
                {meetupLocation ? meetupLocation.address : "Search or enter a location..."}
              </Text>
              {meetupLocation ? (
                <TouchableOpacity onPress={() => setMeetupLocation(null)} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          </FormField>

          <View style={s.divider} />

          {/* Add Friends */}
          {loadingFriends ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : friends.length === 0 ? (
            <Text style={s.emptyText}>No friends found</Text>
          ) : (
            friends.map((friend) => {
              const isSelected = selectedIds.includes(friend.id);
              return (
                <TouchableOpacity
                  key={friend.id}
                  style={s.memberRow}
                  onPress={() => toggleFriend(friend.id)}
                  activeOpacity={0.8}
                >
                  <View style={s.memberAvatarWrap}>
                    {friend.avatar ? (
                      <Image source={{ uri: friend.avatar }} style={s.memberAvatar} />
                    ) : (
                      <View style={[s.memberAvatar, s.memberAvatarPlaceholder]}>
                        <Ionicons name="person" size={22} color={Colors.textSecondary} />
                      </View>
                    )}
                    <View style={s.avatarOverlay} />
                    <View style={s.checkCircleWrap}>
                      {isSelected ? (
                        <CheckIcon width={22} height={22} />
                      ) : (
                        <View style={s.checkCircle} />
                      )}
                    </View>
                  </View>
                  <View style={s.memberInfo}>
                    <Text style={s.memberName}>{friend.name}</Text>
                    {friend.bio ? (
                      <Text style={s.memberBio} numberOfLines={2}>{friend.bio}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity
            style={[s.createBtn, submitting && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={s.createBtnText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelect={(result) => {
          setMeetupLocation(result);
          setLocationModalVisible(false);
        }}
      />

      <PickerModal
        visible={showActivityPicker}
        title="Activity / Sport"
        items={ACTIVITY_CATEGORIES}
        selected={activityTag}
        onSelect={setActivityTag}
        onClose={() => setShowActivityPicker(false)}
      />

      <PickerModal
        visible={showNeighborhoodPicker}
        title="Neighborhood"
        items={NYC_NEIGHBORHOODS}
        selected={neighborhood}
        onSelect={setNeighborhood}
        onClose={() => setShowNeighborhoodPicker(false)}
      />
    </SafeAreaView>
  );
}

// ── Picker modal styles ───────────────────────────────────────────────────────
const pm = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "65%",
    paddingBottom: 24,
  },
  dragArea: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: "center",
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    width: "100%",
  },
  sheetTitle: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  optionActive: { backgroundColor: "rgba(209,255,0,0.06)" },
  optionText: { color: Colors.text, fontSize: 15 },
  optionTextActive: { color: Colors.primary, fontWeight: "600" },
});

// ── Main styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  photoLabel: {
    color: Colors.text, fontSize: 14, fontWeight: "600",
    marginBottom: 10, marginTop: 8,
  },
  fieldLabel: {
    color: Colors.text, fontSize: 14, fontWeight: "600", marginBottom: 8,
  },
  bioInput: { height: 80, textAlignVertical: "top", paddingTop: 14 },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 18 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: "center", paddingVertical: 16 },

  // Dropdown button
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownText: { color: Colors.textMuted, fontSize: 14 },
  dropdownTextSelected: { color: Colors.text },

  // Public / Private toggle buttons
  toggleBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleBtnText: { color: Colors.textSecondary, fontSize: 15, fontWeight: "600" },
  toggleBtnTextActive: { color: Colors.black },
  toggleHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },

  locationBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.inputBg,
    borderWidth: 1, borderColor: Colors.inputBorder,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
  },
  locationBtnText: { flex: 1, color: Colors.textMuted, fontSize: 14 },
  locationBtnTextSelected: { color: Colors.text },

  memberRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  memberAvatarWrap: { position: "relative", width: 50, height: 50 },
  memberAvatar: { width: 50, height: 50, borderRadius: 25 },
  memberAvatarPlaceholder: {
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  checkCircleWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center", alignItems: "center",
  },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.white,
    backgroundColor: "transparent",
    justifyContent: "center", alignItems: "center",
  },
  memberInfo: { flex: 1 },
  memberName: { color: Colors.text, fontSize: 14, fontWeight: "700", marginBottom: 3 },
  memberBio: { color: Colors.textSecondary, fontSize: 12, lineHeight: 16 },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50, height: 56,
    justifyContent: "center", alignItems: "center",
    marginTop: 28,
  },
  createBtnText: { color: Colors.black, fontSize: 17, fontWeight: "700" },
});
