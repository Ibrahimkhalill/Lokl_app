import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MediaPickerCard,
  FormField,
  AppTextInput,
  AppHeader,
  AppHeaderIconButton,
  SelectRow,
  InputRow,
  PickerModal,
  type PickerItem,
} from "../../components/primitives";
import { pickAvatarImage } from "../../lib/mediaPicker";
import { getErrorMessage } from "../../lib/api";
import { settingService } from "@/services/settingServices";
import { businessService } from "../../services/businessService";
import { useAuth } from "../../context/AuthContext";
import type { SvgProps } from "react-native-svg";
import InstagramIcon from "../../assets/icons/instagram.svg";
import YoutubeIcon from "../../assets/icons/youtube.svg";
import TiktokIcon from "../../assets/icons/tiktok.svg";
import ThreadsIcon from "../../assets/icons/threads.svg";
import XIcon from "../../assets/icons/x.svg";
import PinterestIcon from "../../assets/icons/pinterest.svg";
import SnapchatIcon from "../../assets/icons/snapchat.svg";
import LinkIcon from "../../assets/icons/link.svg";
import ChevronDownIcon from "../../assets/icons/chevron-down.svg";
import AddIcon from "../../assets/icons/add.svg";
import CloseIcon from "../../assets/icons/close.svg";

type SvgIconComponent = React.ComponentType<SvgProps>;

const SOCIAL_PLATFORMS: { name: string; Icon: SvgIconComponent }[] = [
  { name: "Instagram", Icon: InstagramIcon },
  { name: "YouTube",   Icon: YoutubeIcon },
  { name: "TikTok",   Icon: TiktokIcon },
  { name: "Threads",  Icon: ThreadsIcon },
  { name: "X",        Icon: XIcon },
  { name: "Pinterest",Icon: PinterestIcon },
  { name: "Snapchat", Icon: SnapchatIcon },
];

function SocialPlatformSvg({ platform }: { platform: string }) {
  const row = SOCIAL_PLATFORMS.find((p) => p.name === platform);
  const Icon = row?.Icon ?? LinkIcon;
  return <Icon width={18} height={18} color={Colors.textSecondary} />;
}

const SOCIAL_PICKER_ITEMS: PickerItem[] = SOCIAL_PLATFORMS.map((p) => ({
  label: p.name,
  value: p.name,
  icon: <p.Icon width={22} height={22} color={Colors.textSecondary} />,
}));

const BUSINESS_TYPES_BASE = [
  "Basketball court", "Tennis / pickleball club", "Soccer field",
  "Baseball / softball field", "Golf course", "Driving range",
  "Skating rink", "Skate park", "Yoga studio", "Pilates studio",
  "Dance studio", "Barre studio", "Stretch lab", "Cycling studio",
  "Boxing studio", "Martial arts studio", "Climbing gym",
  "Personal trainer", "Strength coach", "Golf instructor", "Tennis Coach",
  "Boxing trainer", "Running coach", "Yoga instructor", "Chiropractor",
  "Physical therapy", "Acupuncture", "Massage therapy", "IV therapy",
  "Sauna / cold plunge", "Cryotherapy", "Sports recovery center",
  "Salon", "Barbershop", "Tanning Salon", "Waxing studio", "Makeup Studio",
];

const BUSINESS_TYPES_PROFESSIONS = [
  "Strength & conditioning coach", "Weightlifting / powerlifting coach",
  "Bodybuilding coach", "Cross-training / HIIT coach", "Functional fitness",
  "Basketball trainer", "Tennis / pickleball coach", "Soccer trainer",
  "Baseball / softball coach", "Golf instructors", "Running coach",
  "Cycling coach", "Swimming coach", "Boxing coach",
  "MMA / martial arts instructor", "Wrestling coach", "Yoga instructor",
  "Pilates instructor", "Barre instructor", "Dance instructor",
  "Spin / cycling instructor", "Zumba / cardio dance instructor",
  "Mobility / flexibility coach", "Stretch therapist", "Breathwork instructor",
  "Physical therapist (DPTs)", "Chiropractor", "Massage therapist",
  "Sports massage specialist", "Acupuncturist", "Cupping therapy practitioner",
  "IV therapy provider",
];

const BUSINESS_TYPES = Array.from(
  new Set<string>([...BUSINESS_TYPES_BASE, ...BUSINESS_TYPES_PROFESSIONS])
);

const BUSINESS_TYPE_ITEMS: PickerItem[] = BUSINESS_TYPES.map((t) => ({
  label: t,
  value: t,
}));

// ── Business edit ──────────────────────────────────────────────────────────────

function BusinessEditForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [socials, setSocials] = useState<{ platform: string; link: string }[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [pickerIdx, setPickerIdx] = useState(-1);
  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await businessService.getBusinessProfile();
        const d = res.data?.data ?? res.data;
        setBusinessName(d.business_name ?? "");
        setOwnerName(d.owner_name ?? "");
        setBusinessType(d.business_type ?? "");
        setBio(d.bio ?? "");
        setAddress(d.address ?? "");
        setWebsite(d.website ?? "");
        setPhone(d.phone_number ?? "");
        setSocials(Array.isArray(d.social_media) ? d.social_media : []);
        const photoUrl = d.profile_photo_url ?? null;
        setAvatarUri(photoUrl);
        setOriginalAvatarUrl(photoUrl);
      } catch (e) {
        Alert.alert("Error", getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function addSocial() {
    setSocials((prev) => [...prev, { platform: "", link: "" }]);
  }

  function removeSocial(idx: number) {
    setSocials((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateSocial(idx: number, field: "platform" | "link", value: string) {
    setSocials((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }

  async function handleSave() {
    if (!businessName.trim()) {
      Alert.alert("Error", "Business name is required");
      return;
    }
    setSaving(true);
    try {
      await businessService.updateBusinessProfile({
        business_name: businessName,
        owner_name: ownerName,
        bio,
        address,
        website,
        social_media: socials.filter((s) => s.platform),
      } as any);

      if (avatarUri && avatarUri !== originalAvatarUrl) {
        const form = new FormData();
        const ext = avatarUri.split(".").pop() ?? "jpg";
        form.append("profile_photo", {
          uri: avatarUri,
          name: `photo_${Date.now()}.${ext}`,
          type: "image/jpeg",
        } as any);
        await businessService.updateProfileMedia(form);
      }

      Alert.alert("Success", "Profile updated");
      router.back();
    } catch (e) {
      Alert.alert("Error", getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={s.fieldLabel}>Profile Photo</Text>
      <MediaPickerCard
        height={150}
        previewUri={avatarUri}
        previewKind="image"
        onPress={async () => {
          const picked = await pickAvatarImage();
          if (picked) setAvatarUri(picked.uri);
        }}
        icon={<Ionicons name="image-outline" size={40} color={Colors.textSecondary} />}
        title="Change Photo"
        subtitle="tap to update"
      />

      <FormField label="Business Name *" labelStyle={s.fieldLabel}>
        <AppTextInput placeholder="Business name" value={businessName} onChangeText={setBusinessName} />
      </FormField>

      <FormField label="Owner Name" labelStyle={s.fieldLabel}>
        <AppTextInput placeholder="Owner name" value={ownerName} onChangeText={setOwnerName} />
      </FormField>

      <FormField label="Business Type" labelStyle={s.fieldLabel}>
        <SelectRow
          style={s.dropdownRow}
          value={businessType}
          placeholder="Select business type"
          rightSlot={<ChevronDownIcon width={18} height={18} color={Colors.textSecondary} />}
          onPress={() => setShowTypePicker(true)}
        />
      </FormField>

      <FormField label="Phone" labelStyle={s.fieldLabel}>
        <AppTextInput placeholder="Phone number" value={phone} readOnly keyboardType="phone-pad" />
      </FormField>

      <FormField label="Address" labelStyle={s.fieldLabel}>
        <AppTextInput placeholder="Business address" value={address} onChangeText={setAddress} />
      </FormField>

      <FormField label="Website" labelStyle={s.fieldLabel}>
        <AppTextInput placeholder="https://yourwebsite.com" value={website} onChangeText={setWebsite} keyboardType="url" autoCapitalize="none" />
      </FormField>

      <FormField label="Bio" labelStyle={s.fieldLabel}>
        <AppTextInput
          style={s.bioInput}
          placeholder="Tell people about your business..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </FormField>

      {/* Social Media */}
      <View style={s.socialHeader}>
        <Text style={s.fieldLabel}>Social Media</Text>
        <TouchableOpacity onPress={addSocial} style={s.addBtn}>
          <AddIcon width={16} height={16} color={Colors.primary} />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {socials.map((item, idx) => (
        <View key={idx} style={s.socialGroup}>
          <View style={{ flex: 1 }}>
            <SelectRow
              style={s.dropdownRow}
              leftSlot={
                <View style={s.fieldIcon}>
                  <SocialPlatformSvg platform={item.platform} />
                </View>
              }
              value={item.platform}
              placeholder="Select platform"
              rightSlot={<ChevronDownIcon width={18} height={18} color={Colors.textSecondary} />}
              onPress={() => setPickerIdx(idx)}
            />
            <InputRow
              leftSlot={
                <View style={s.fieldIcon}>
                  <LinkIcon width={18} height={18} color={Colors.textSecondary} />
                </View>
              }
              containerStyle={[s.dropdownRow, { marginTop: 8 }]}
              placeholder={item.platform ? `Enter ${item.platform} link` : "Enter link"}
              value={item.link}
              onChangeText={(v) => updateSocial(idx, "link", v)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity onPress={() => removeSocial(idx)} style={s.removeBtn}>
            <CloseIcon width={20} height={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      ))}

      <PickerModal
        visible={pickerIdx >= 0}
        title="Select social media type"
        items={SOCIAL_PICKER_ITEMS}
        selectedValue={pickerIdx >= 0 ? socials[pickerIdx]?.platform : undefined}
        onClose={() => setPickerIdx(-1)}
        onSelect={(value) => {
          updateSocial(pickerIdx, "platform", value);
          setPickerIdx(-1);
        }}
      />

      <PickerModal
        visible={showTypePicker}
        title="Select business type"
        items={BUSINESS_TYPE_ITEMS}
        selectedValue={businessType}
        searchable
        onClose={() => setShowTypePicker(false)}
        onSelect={(value) => {
          setBusinessType(value);
          setShowTypePicker(false);
        }}
      />

      <TouchableOpacity style={[s.saveBtn, saving && s.disabledBtn]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.black} /> : <Text style={s.saveBtnText}>Save Profile</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── User edit ──────────────────────────────────────────────────────────────────

function UserEditForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await settingService.getOwnProfile();
        const data = response.data?.data || response.data;
        setName(data.name || "");
        setBio(data.bio || "");
        setPhone(data.phone || "");
        setOriginalAvatarUrl(data.avatar || data.avatar_url || null);
        setAvatarUri(data.avatar || data.avatar_url || null);
      } catch (error) {
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("phone", phone);
      if (avatarUri && avatarUri !== originalAvatarUrl) {
        const ext = avatarUri.split(".").pop() ?? "jpg";
        formData.append("avatar", {
          uri: avatarUri,
          name: `avatar_${Date.now()}.${ext}`,
          type: "image/jpeg",
        } as any);
      }
      await settingService.updateProfile(formData);
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={s.fieldLabel}>Profile Photo</Text>
      <MediaPickerCard
        height={150}
        previewUri={avatarUri}
        previewKind="image"
        onPress={async () => {
          const picked = await pickAvatarImage();
          if (picked) setAvatarUri(picked.uri);
        }}
        icon={<Ionicons name="image-outline" size={40} color={Colors.textSecondary} />}
        title="Change Photo"
        subtitle="tap to update"
      />

      <FormField label="Name" labelStyle={s.fieldLabel}>
        <AppTextInput placeholder="Enter your name" value={name} onChangeText={setName} />
      </FormField>

      <FormField label="Phone" labelStyle={s.fieldLabel}>
        <AppTextInput placeholder="Phone number" value={phone} readOnly keyboardType="phone-pad" />
      </FormField>

      <FormField label="Bio" labelStyle={s.fieldLabel}>
        <AppTextInput
          style={s.bioInput}
          placeholder="Tell something about yourself"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </FormField>

      <TouchableOpacity style={[s.saveBtn, saving && s.disabledBtn]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.black} /> : <Text style={s.saveBtnText}>Save Profile</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Root screen ────────────────────────────────────────────────────────────────

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isBusiness = user?.role?.toLowerCase() === "business";

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={s.header}>
          <AppHeader
            title="Edit Profile"
            titleStyle={s.headerTitle}
            leftSlot={
              <AppHeaderIconButton onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={22} color={Colors.text} />
              </AppHeaderIconButton>
            }
            rightSlot={
              <AppHeaderIconButton onPress={() => router.back()}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </AppHeaderIconButton>
            }
          />
        </View>

        {isBusiness ? <BusinessEditForm /> : <UserEditForm />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  fieldLabel: { color: Colors.text, fontSize: 14, fontWeight: "600", marginBottom: 8 },
  bioInput: { height: 110, paddingTop: 14 },
  socialHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  socialGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondaryCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
    height: 52,
  },
  fieldIcon: { marginRight: 10 },
  removeBtn: { padding: 4 },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: { color: Colors.black, fontSize: 17, fontWeight: "700" },
  disabledBtn: { opacity: 0.6 },
});

