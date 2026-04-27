import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { BackButton, Input, PrimaryButton } from "../../components/ui";
import { SelectRow, InputRow } from "../../components/primitives";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import BusinessIcon from "../../assets/icons/bussiness.svg";
import BusinessTypeIcon from "../../assets/icons/business_type.svg";
import PersonIcon from "../../assets/icons/person.svg";
import EmailIcon from "../../assets/icons/email.svg";
import CallIcon from "../../assets/icons/call.svg";
import LocationsIcon from "../../assets/icons/locations.svg";
import LinkIcon from "../../assets/icons/link.svg";
import LockIcon from "../../assets/icons/loack.svg";
import InstagramIcon from "../../assets/icons/instagram.svg";
import YoutubeIcon from "../../assets/icons/youtube.svg";
import TiktokIcon from "../../assets/icons/tiktok.svg";
import ThreadsIcon from "../../assets/icons/threads.svg";
import XIcon from "../../assets/icons/x.svg";
import PinterestIcon from "../../assets/icons/pinterest.svg";
import SnapchatIcon from "../../assets/icons/snapchat.svg";
import SearchIcon from "../../assets/icons/search.svg";
import CloseIcon from "../../assets/icons/close.svg";
import ChevronDownIcon from "../../assets/icons/chevron-down.svg";
import AddIcon from "../../assets/icons/add.svg";
import type { SvgProps } from "react-native-svg";

type SvgIconComponent = React.ComponentType<SvgProps>;

const SOCIAL_PLATFORMS: { name: string; Icon: SvgIconComponent }[] = [
  { name: "Instagram", Icon: InstagramIcon },
  { name: "YouTube", Icon: YoutubeIcon },
  { name: "TikTok", Icon: TiktokIcon },
  { name: "Threads", Icon: ThreadsIcon },
  { name: "X", Icon: XIcon },
  { name: "Pinterest", Icon: PinterestIcon },
  { name: "Snapchat", Icon: SnapchatIcon },
];

function SocialPlatformSvg({ platform }: { platform: string }) {
  const row = SOCIAL_PLATFORMS.find((p) => p.name === platform);
  const Icon = row?.Icon ?? LinkIcon;
  return <Icon width={18} height={18} color={Colors.textSecondary} />;
}

const BUSINESS_TYPES = [
  "Basketball court",
  "Tennis / pickleball club",
  "Soccer field",
  "Baseball / softball field",
  "Golf course",
  "Driving range",
  "Skating rink",
  "Skate park",
  "Yoga studio",
  "Pilates studio",
  "Dance studio",
  "Barre studio",
  "Stretch lab",
  "Cycling studio",
  "Boxing studio",
  "Martial arts studio",
  "Climbing gym",
  "Personal trainer",
  "Strength coach",
  "Golf instructor",
  "Tennis Coach",
  "Boxing trainer",
  "Running coach",
  "Yoga instructor",
  "Chiropractor",
  "Physical therapy",
  "Acupuncture",
  "Massage therapy",
  "IV therapy",
  "Sauna / cold plunge",
  "Cryotherapy",
  "Sports recovery center",
  "Salon",
  "Barbershop",
  "Tanning Salon",
  "Waxing studio",
  "Makeup Studio",
];

interface SocialEntry {
  platform: string;
  link: string;
}

function BottomSheetModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <TouchableOpacity style={modalStyles.backdrop} onPress={onClose} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <CloseIcon width={22} height={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    overflow: "hidden",
  },
  header: {
    backgroundColor: Colors.modalHeader,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default function BusinessSignUp() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [socialEntries, setSocialEntries] = useState<SocialEntry[]>([
    { platform: "Instagram", link: "" },
  ]);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialModalIndex, setSocialModalIndex] = useState(0);
  const [typeSearch, setTypeSearch] = useState("");

  const filteredTypes = BUSINESS_TYPES.filter((t) =>
    t.toLowerCase().includes(typeSearch.toLowerCase()),
  );

  const addSocialEntry = () => {
    setSocialEntries([...socialEntries, { platform: "Instagram", link: "" }]);
  };

  const openSocialPicker = (index: number) => {
    setSocialModalIndex(index);
    setShowSocialModal(true);
  };

  const selectPlatform = (platform: string) => {
    const updated = [...socialEntries];
    updated[socialModalIndex].platform = platform;
    setSocialEntries(updated);
    setShowSocialModal(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton onPress={() => router.back()} />

        {/* Header icon */}
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <BusinessIcon height={30} width={30} />
          </View>
          <Text style={styles.title}>Create Business account</Text>
          <Text style={styles.subtitle}>
            Grow your sports business with LOKL
          </Text>
        </View>

        {/* Business Name */}
        <Input
          label="Business Name*"
          placeholder="Your business name"
          leftSlot={
            <BusinessIcon width={18} height={18} color={Colors.textSecondary} />
          }
          value={businessName}
          onChangeText={setBusinessName}
        />

        {/* Business Type — dropdown */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Business Type*</Text>
          <SelectRow
            style={styles.dropdownBtn}
            leftSlot={
              <View style={styles.fieldIcon}>
                <BusinessTypeIcon
                  width={18}
                  height={18}
                  color={Colors.textSecondary}
                />
              </View>
            }
            value={businessType || undefined}
            placeholder="Enter Business type"
            rightSlot={
              <ChevronDownIcon
                width={18}
                height={18}
                color={Colors.textSecondary}
              />
            }
            onPress={() => setShowTypeModal(true)}
          />
        </View>

        <Input
          label="Owner Name*"
          placeholder="Your full name"
          leftSlot={
            <PersonIcon width={18} height={18} color={Colors.textSecondary} />
          }
          value={ownerName}
          onChangeText={setOwnerName}
        />
        <Input
          label="Email*"
          placeholder="business@gmail.com"
          leftSlot={
            <EmailIcon width={18} height={18} color={Colors.textSecondary} />
          }
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Business Phone*"
          placeholder="+880 1XXX-XXXXXX"
          leftSlot={
            <CallIcon width={18} height={18} color={Colors.textSecondary} />
          }
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Input
          label="Business Address*"
          placeholder="Street address"
          leftSlot={
            <LocationsIcon
              width={18}
              height={18}
              color={Colors.textSecondary}
            />
          }
          value={address}
          onChangeText={setAddress}
        />
        <Input
          label="Website link"
          placeholder="Enter link"
          leftSlot={
            <LinkIcon width={18} height={18} color={Colors.textSecondary} />
          }
          autoCapitalize="none"
          value={website}
          onChangeText={setWebsite}
        />

        {/* Social Media */}
        <Text style={styles.label}>Social Media</Text>
        {socialEntries.map((entry, index) => (
          <View key={index} style={styles.socialGroup}>
            <SelectRow
              style={styles.dropdownBtn}
              leftSlot={
                <View style={styles.fieldIcon}>
                  <SocialPlatformSvg platform={entry.platform} />
                </View>
              }
              value={entry.platform}
              rightSlot={
                <ChevronDownIcon
                  width={18}
                  height={18}
                  color={Colors.textSecondary}
                />
              }
              onPress={() => openSocialPicker(index)}
            />
            <InputRow
              leftSlot={
                <View style={styles.fieldIcon}>
                  <LinkIcon width={18} height={18} color={Colors.textSecondary} />
                </View>
              }
              containerStyle={[styles.dropdownBtn, { marginTop: 8 }]}
              placeholder={`Enter ${entry.platform} link`}
              value={entry.link}
              onChangeText={(text) => {
                const updated = [...socialEntries];
                updated[index].link = text;
                setSocialEntries(updated);
              }}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addSocialBtn} onPress={addSocialEntry}>
          <AddIcon width={18} height={18} color={Colors.textSecondary} />
          <Text style={styles.addSocialText}>Add social media</Text>
        </TouchableOpacity>

        <Input
          label="Password*"
          placeholder="Create password"
          leftSlot={
            <LockIcon width={18} height={18} color={Colors.textSecondary} />
          }
          isPassword
          value={password}
          onChangeText={setPassword}
        />
        <Input
          label="Confirm Password*"
          placeholder="Re-enter password"
          leftSlot={
            <LockIcon width={18} height={18} color={Colors.textSecondary} />
          }
          isPassword
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

          <PrimaryButton
            title="Sign Up"
            onPress={() => router.push("/auth/email-otp-verifications")}
            style={styles.signupBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Business Type Modal */}
      <BottomSheetModal
        visible={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        title="Select business type"
      >
        <View style={styles.searchWrap}>
          <View style={styles.searchIcon}>
            <SearchIcon width={16} height={16} color={Colors.textSecondary} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={Colors.textMuted}
            value={typeSearch}
            onChangeText={setTypeSearch}
          />
        </View>
        <FlatList
          data={filteredTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setBusinessType(item);
                setShowTypeModal(false);
                setTypeSearch("");
              }}
            >
              <Text
                style={[
                  styles.modalItemText,
                  businessType === item && styles.modalItemSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheetModal>

      {/* Social Media Modal */}
      <BottomSheetModal
        visible={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        title="Select social media type"
      >
        <FlatList
          data={SOCIAL_PLATFORMS}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => selectPlatform(item.name)}
            >
              <View style={{ marginRight: 14 }}>
                <item.Icon
                  width={22}
                  height={22}
                  color={Colors.textSecondary}
                />
              </View>
              <Text style={styles.modalItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  iconHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#00CCA8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  fieldWrap: { marginBottom: 16 },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    height: 52,
    paddingHorizontal: 16,
  },
  fieldIcon: { marginRight: 10 },
  dropdownText: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  placeholder: { color: Colors.textMuted },
  socialGroup: { marginBottom: 16 },
  inlineInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  addSocialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 20,
  },
  addSocialText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  signupBtn: { marginTop: 8 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    margin: 14,
    backgroundColor: "#2E3A3F",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  modalItemText: {
    color: Colors.text,
    fontSize: 15,
  },
  modalItemSelected: {
    color: Colors.primary,
    fontWeight: "700",
  },
  textMuted: { color: Colors.textMuted },
});
