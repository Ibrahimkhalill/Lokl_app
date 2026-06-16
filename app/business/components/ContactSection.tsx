import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert,
  Switch,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Colors } from "../../../constants/colors";
import { sharedStyles } from "./sharedStyles";
import { businessService } from "../../../services/businessService";
import { getErrorMessage } from "../../../lib/api";
import { CoachContactInfo } from "./types";

interface Props {
  contactInfo: CoachContactInfo | null | undefined;
  isOwner: boolean;
  businessProfileId: number;
  socialMedia: { platform: string; link: string }[];
  userEmail?: string;
  userPhone?: string;
  onUpdate: () => void;
}

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", placeholder: "@yourhandle" },
  { key: "tiktok", label: "TikTok", placeholder: "@yourhandle" },
  { key: "youtube", label: "YouTube", placeholder: "@yourchannel" },
  { key: "x", label: "X (Twitter)", placeholder: "@yourhandle" },
  { key: "threads", label: "Threads", placeholder: "@yourhandle" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/yourpage" },
  { key: "pinterest", label: "Pinterest", placeholder: "@yourhandle" },
  { key: "snapchat", label: "Snapchat", placeholder: "@yourhandle" },
];

function socialIcon(platform: string): string {
  const p = platform.toLowerCase();
  if (p === "instagram") return "logo-instagram";
  if (p === "facebook") return "logo-facebook";
  if (p === "youtube") return "logo-youtube";
  if (p === "x" || p === "twitter") return "logo-twitter";
  return "share-social-outline";
}

function socialLink(platform: string, handle: string): string {
  const h = handle.startsWith("@") ? handle.slice(1) : handle;
  const p = platform.toLowerCase();
  if (p === "instagram") return `https://instagram.com/${h}`;
  if (p === "tiktok") return `https://tiktok.com/@${h}`;
  if (p === "youtube") return `https://youtube.com/@${h}`;
  if (p === "x" || p === "twitter") return `https://x.com/${h}`;
  if (p === "threads") return `https://threads.net/@${h}`;
  if (p === "facebook") return handle.startsWith("http") ? handle : `https://facebook.com/${h}`;
  if (p === "pinterest") return `https://pinterest.com/${h}`;
  if (p === "snapchat") return `https://snapchat.com/add/${h}`;
  return handle;
}

function extractHandle(link: string): string {
  if (!link) return "";
  try {
    const url = new URL(link.startsWith("http") ? link : `https://${link}`);
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] ?? "";
    return last.startsWith("@") ? last : `@${last}`;
  } catch {
    return link;
  }
}

export function ContactSection({
  contactInfo,
  isOwner,
  businessProfileId,
  socialMedia,
  userEmail,
  userPhone,
  onUpdate,
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [platformPickerVisible, setPlatformPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedPlatform, setSelectedPlatform] = useState(contactInfo?.social_platform ?? "instagram");
  const [socialHandle, setSocialHandle] = useState(contactInfo?.social_handle ?? "");
  const [showSocial, setShowSocial] = useState(contactInfo?.show_social ?? true);
  const [email, setEmail] = useState(contactInfo?.email ?? "");
  const [showEmail, setShowEmail] = useState(contactInfo?.show_email ?? true);
  const [phone, setPhone] = useState(contactInfo?.phone ?? "");
  const [showPhone, setShowPhone] = useState(contactInfo?.show_phone ?? true);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const openContactModal = () => {
    const platform = contactInfo?.social_platform ?? "instagram";
    setSelectedPlatform(platform);
    let handle = contactInfo?.social_handle ?? "";
    if (!handle) {
      const match = socialMedia.find((s) => s.platform.toLowerCase() === platform.toLowerCase());
      if (match) handle = extractHandle(match.link);
    }
    setSocialHandle(handle);
    setShowSocial(contactInfo?.show_social ?? true);
    setEmail(contactInfo?.email ?? userEmail ?? "");
    setShowEmail(contactInfo?.show_email ?? true);
    setPhone(contactInfo?.phone ?? userPhone ?? "");
    setShowPhone(contactInfo?.show_phone ?? true);
    sheetRef.current?.present();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await businessService.updateContact(businessProfileId, {
        social_platform: selectedPlatform,
        social_handle: socialHandle,
        show_social: showSocial,
        email,
        show_email: showEmail,
        phone,
        show_phone: showPhone,
      });
      sheetRef.current?.dismiss();
      onUpdate();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPlatform = (key: string) => {
    setSelectedPlatform(key);
    const match = socialMedia.find((s) => s.platform.toLowerCase() === key.toLowerCase());
    if (match) setSocialHandle(extractHandle(match.link));
    setPlatformPickerVisible(false);
  };

  if (!isOwner && !contactInfo) return null;

  const items: { icon: string; label: string; value: string; url: string }[] = [];

  if (contactInfo?.social_handle && (isOwner || contactInfo.show_social)) {
    const platform = contactInfo.social_platform ?? "instagram";
    items.push({
      icon: socialIcon(platform),
      label: SOCIAL_PLATFORMS.find((p) => p.key === platform)?.label ?? platform,
      value: contactInfo.social_handle,
      url: socialLink(platform, contactInfo.social_handle),
    });
  }
  if (contactInfo?.email && (isOwner || contactInfo.show_email !== false)) {
    items.push({ icon: "mail-outline", label: "Email", value: contactInfo.email, url: `mailto:${contactInfo.email}` });
  }
  if (contactInfo?.phone && (isOwner || contactInfo.show_phone !== false)) {
    items.push({ icon: "call-outline", label: "Phone", value: contactInfo.phone, url: `tel:${contactInfo.phone}` });
  }

  const selectedPlatformMeta = SOCIAL_PLATFORMS.find((p) => p.key === selectedPlatform);

  return (
    <>
      <View style={sharedStyles.sectionHeaderRow}>
        <Text style={sharedStyles.sectionHeader}>Contact</Text>
        {isOwner && (
          <TouchableOpacity style={sharedStyles.sectionAddBtn} onPress={openContactModal} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={14} color={Colors.primary} />
            <Text style={sharedStyles.sectionAddBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 && isOwner && (
        <TouchableOpacity style={sharedStyles.addPlaceholder} onPress={openContactModal} activeOpacity={0.8}>
          <View style={sharedStyles.addPlaceholderIcon}>
            <Ionicons name="call-outline" size={26} color={Colors.primary} />
          </View>
          <Text style={sharedStyles.addPlaceholderTitle}>Add Contact Info</Text>
          <Text style={sharedStyles.addPlaceholderText}>Instagram, email, or phone</Text>
        </TouchableOpacity>
      )}

      {items.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={sharedStyles.infoCard}
          activeOpacity={0.75}
          onPress={() => Linking.openURL(item.url).catch(() => {})}
        >
          <View style={sharedStyles.infoIconWrap}>
            <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
          </View>
          <View style={sharedStyles.infoContent}>
            <Text style={sharedStyles.infoLabel}>{item.label}</Text>
            <Text style={sharedStyles.infoValue}>{item.value}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      ))}

      {/* Edit Contact — bottom sheet */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["58%", "88%"]}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={{ flex: 1 }}>
        <View style={styles.sheetHeader}>
          <Text style={sharedStyles.modalTitle}>Edit Contact Info</Text>
          <TouchableOpacity onPress={() => sheetRef.current?.dismiss()}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={sharedStyles.modalLabel}>Social DM</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[sharedStyles.modalPickerBtn, { flex: 0, marginBottom: 0, paddingVertical: 12 }]}
              onPress={() => setPlatformPickerVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name={socialIcon(selectedPlatform) as any} size={18} color={Colors.primary} />
              <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <TextInput
              style={[sharedStyles.modalInput, { flex: 1, marginBottom: 0 }]}
              value={socialHandle}
              onChangeText={setSocialHandle}
              placeholder={selectedPlatformMeta?.placeholder ?? "@yourhandle"}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.contactToggle}>
              <Text style={styles.contactToggleLabel}>{showSocial ? "Show" : "Hide"}</Text>
              <Switch
                value={showSocial}
                onValueChange={setShowSocial}
                trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          <Text style={[sharedStyles.modalLabel, { marginTop: 16 }]}>Email</Text>
          <View style={styles.contactRow}>
            <TextInput
              style={[sharedStyles.modalInput, { flex: 1, marginBottom: 0 }]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.contactToggle}>
              <Text style={styles.contactToggleLabel}>{showEmail ? "Show" : "Hide"}</Text>
              <Switch
                value={showEmail}
                onValueChange={setShowEmail}
                trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          <Text style={[sharedStyles.modalLabel, { marginTop: 16 }]}>Phone</Text>
          <View style={styles.contactRow}>
            <TextInput
              style={[sharedStyles.modalInput, { flex: 1, marginBottom: 0 }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 000 000 0000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />
            <View style={styles.contactToggle}>
              <Text style={styles.contactToggleLabel}>{showPhone ? "Show" : "Hide"}</Text>
              <Switch
                value={showPhone}
                onValueChange={setShowPhone}
                trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[sharedStyles.saveBtn, { marginTop: 20, marginBottom: 8 }, saving && sharedStyles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={sharedStyles.saveBtnText}>{saving ? "Saving…" : "Save Contact"}</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Platform picker — plain Modal (no text inputs) */}
      <Modal
        visible={platformPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlatformPickerVisible(false)}
      >
        <Pressable style={sharedStyles.pickerBackdrop} onPress={() => setPlatformPickerVisible(false)} />
        <View style={sharedStyles.pickerSheet}>
          <View style={sharedStyles.pickerBar}>
            <Text style={sharedStyles.modalTitle}>Select Platform</Text>
            <TouchableOpacity onPress={() => setPlatformPickerVisible(false)}>
              <Text style={sharedStyles.pickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          {SOCIAL_PLATFORMS.map((p) => {
            const isActive = selectedPlatform === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                style={[sharedStyles.pickerRow, isActive && sharedStyles.pickerRowActive]}
                onPress={() => handleSelectPlatform(p.key)}
                activeOpacity={0.75}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Ionicons name={socialIcon(p.key) as any} size={20} color={isActive ? Colors.primary : Colors.textSecondary} />
                  <Text style={[sharedStyles.pickerRowText, isActive && sharedStyles.pickerRowTextActive]}>{p.label}</Text>
                </View>
                {isActive && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: Colors.card },
  handle: { backgroundColor: Colors.textMuted },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  contactToggle: { alignItems: "center", gap: 2 },
  contactToggleLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "600" },
});
