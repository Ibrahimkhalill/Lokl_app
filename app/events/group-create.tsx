import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
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

type Friend = {
  id: number;
  name: string;
  avatar: string | null;
  bio?: string;
  role?: string;
};

export default function GroupCreateScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [bio, setBio] = useState("");
  const [groupPhotoUri, setGroupPhotoUri] = useState<string | null>(null);
  const [groupPhotoFile, setGroupPhotoFile] = useState<{ uri: string; name: string; type: string } | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [meetupLocation, setMeetupLocation] = useState<LocationResult | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingFriends(true);
      try {
        const res = await userService.getFriends();
        const data = res.data;
        console.log("[GroupCreate] friends response:", data);
        const list = data?.data ?? data;
        // console.log("[GroupCreate] friends list:", list);
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
      Alert.alert("Validation", "Group name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", groupName.trim());
      if (bio.trim()) form.append("bio", bio.trim());
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
      Alert.alert("Error", getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

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

          <FormField label="Group Name" labelStyle={s.fieldLabel}>
            <AppTextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="e.g. Sports Club"
              placeholderTextColor={Colors.textMuted}
            />
          </FormField>

          <FormField label="Bio" labelStyle={s.fieldLabel}>
            <AppTextInput
              style={s.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="What's this group about?"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </FormField>

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
          {/* <Text style={s.sectionTitle}>Add Friends</Text> */}

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
                    {(friend.bio) ? (
                      <Text style={s.memberBio} numberOfLines={2}>
                        {friend.bio}
                      </Text>
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
    </SafeAreaView>
  );
}

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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  photoLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 8,
  },
  fieldLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  bioInput: { height: 80, textAlignVertical: "top", paddingTop: 14 },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 18 },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: "center", paddingVertical: 16 },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  memberAvatarWrap: { position: "relative", width: 50, height: 50 },
  memberAvatar: { width: 50, height: 50, borderRadius: 25 },
  memberAvatarPlaceholder: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  checkCircleWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  memberInfo: { flex: 1 },
  memberName: { color: Colors.text, fontSize: 14, fontWeight: "700", marginBottom: 3 },
  memberBio: { color: Colors.textSecondary, fontSize: 12, lineHeight: 16 },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  createBtnText: { color: Colors.black, fontSize: 17, fontWeight: "700" },

  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  locationBtnText: { flex: 1, color: Colors.textMuted, fontSize: 14 },
  locationBtnTextSelected: { color: Colors.text },
});
