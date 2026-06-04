import React, { useCallback, useMemo, useState } from "react";
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
import { AuthFooterLinkRow } from "../../components/auth";
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
import { authService } from "@/services/authService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

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

/** Venues, studios, and legacy types */
const BUSINESS_TYPES_BASE = [
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
] as const;

/** Coach / instructor / therapist roles (product list) */
const BUSINESS_TYPES_PROFESSIONS = [
  "Strength & conditioning coach",
  "Weightlifting / powerlifting coach",
  "Bodybuilding coach",
  "Cross-training / HIIT coach",
  "Functional fitness",
  "Basketball trainer",
  "Tennis / pickleball coach",
  "Soccer trainer",
  "Baseball / softball coach",
  "Golf instructors",
  "Running coach",
  "Cycling coach",
  "Swimming coach",
  "Boxing coach",
  "MMA / martial arts instructor",
  "Wrestling coach",
  "Yoga instructor",
  "Pilates instructor",
  "Barre instructor",
  "Dance instructor",
  "Spin / cycling instructor",
  "Zumba / cardio dance instructor",
  "Mobility / flexibility coach",
  "Stretch therapist",
  "Breathwork instructor",
  "Physical therapist (DPTs)",
  "Chiropractor",
  "Massage therapist",
  "Sports massage specialist",
  "Acupuncturist",
  "Cupping therapy practitioner",
  "IV therapy provider",
] as const;

const BUSINESS_TYPES = Array.from(
  new Set<string>([...BUSINESS_TYPES_BASE, ...BUSINESS_TYPES_PROFESSIONS])
);

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
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        style={modalStyles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
      </KeyboardAvoidingView>
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
  const { showToast } = useToast();
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

  const [businessNameError, setBusinessNameError] = useState("");
  const [businessTypeError, setBusinessTypeError] = useState("");
  const [ownerNameError, setOwnerNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialModalIndex, setSocialModalIndex] = useState(0);
  const [typeSearch, setTypeSearch] = useState("");

  const filteredTypes = useMemo(
    () =>
      BUSINESS_TYPES.filter((t) =>
        t.toLowerCase().includes(typeSearch.toLowerCase()),
      ),
    [typeSearch],
  );

  const onSelectBusinessType = useCallback((item: string) => {
    setBusinessType(item);
    setBusinessTypeError("");
    setShowTypeModal(false);
    setTypeSearch("");
  }, []);

  const renderBusinessTypeItem = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        style={styles.modalItem}
        onPress={() => onSelectBusinessType(item)}
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
    ),
    [businessType, onSelectBusinessType],
  );

  const keyByValue = useCallback((item: string) => item, []);

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

  const [loading, setLoading] = useState(false);

const handleSignUp = async () => {
  const bnErr = businessName.trim() ? "" : "Business name is required";
  const btErr = businessType ? "" : "Business type is required";
  const onErr = ownerName.trim() ? "" : "Owner name is required";
  const emErr = !email.trim() ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email address" : "";
  const phErr = phone.trim() ? "" : "Phone number is required";
  const adErr = address.trim() ? "" : "Address is required";
  const pwErr = !password ? "Password is required" : password.length < 8 ? "Password must be at least 8 characters" : "";
  const cpErr = !confirmPassword ? "Please confirm your password" : confirmPassword !== password ? "Passwords do not match" : "";

  setBusinessNameError(bnErr);
  setBusinessTypeError(btErr);
  setOwnerNameError(onErr);
  setEmailError(emErr);
  setPhoneError(phErr);
  setAddressError(adErr);
  setPasswordError(pwErr);
  setConfirmPasswordError(cpErr);

  if (bnErr || btErr || onErr || emErr || phErr || adErr || pwErr || cpErr) return;

  setLoading(true);
  try {
    const res = await authService.registerBusiness({
      business_name: businessName,
      business_type: businessType,
      owner_name: ownerName,
      email,
      phone,
      address,
      website: website || undefined,
      password,
      confirm_password: confirmPassword,
      social_media: socialEntries.filter((e) => e.link.trim() !== ""),
    });
    const userId: number = res.data.data.user_id;
    router.push({
        pathname: "/auth/email-otp-verifications",
        params: { user_id: String(userId) },
      });
  } catch (error) {
    showToast({ type: "error", title: "Registration Failed", message: getErrorMessage(error) });
  } finally {
    setLoading(false);
  }
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
          onChangeText={(v) => { setBusinessName(v); if (v.trim()) setBusinessNameError(""); }}
          onBlur={() => setBusinessNameError(businessName.trim() ? "" : "Business name is required")}
          error={businessNameError}
        />

        {/* Business Type — dropdown */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Business Type*</Text>
          <SelectRow
            style={[styles.dropdownBtn, businessTypeError ? { borderColor: "#FF4D4F" } : {}] as any}
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
          {businessTypeError ? <Text style={styles.errorText}>{businessTypeError}</Text> : null}
        </View>

        <Input
          label="Owner Name*"
          placeholder="Your full name"
          leftSlot={
            <PersonIcon width={18} height={18} color={Colors.textSecondary} />
          }
          value={ownerName}
          onChangeText={(v) => { setOwnerName(v); if (v.trim()) setOwnerNameError(""); }}
          onBlur={() => setOwnerNameError(ownerName.trim() ? "" : "Owner name is required")}
          error={ownerNameError}
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
          onChangeText={(v) => {
            setEmail(v);
            if (!v.trim()) setEmailError("Email is required");
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setEmailError("Enter a valid email address");
            else setEmailError("");
          }}
          onBlur={() => {
            if (!email.trim()) setEmailError("Email is required");
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setEmailError("Enter a valid email address");
          }}
          error={emailError}
        />
        <Input
          label="Business Phone*"
          placeholder="+1 (XXX) XXX-XXXX"
          leftSlot={
            <CallIcon width={18} height={18} color={Colors.textSecondary} />
          }
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(v) => { setPhone(v); if (v.trim()) setPhoneError(""); }}
          onBlur={() => setPhoneError(phone.trim() ? "" : "Phone number is required")}
          error={phoneError}
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
          onChangeText={(v) => { setAddress(v); if (v.trim()) setAddressError(""); }}
          onBlur={() => setAddressError(address.trim() ? "" : "Address is required")}
          error={addressError}
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
          onChangeText={(v) => {
            setPassword(v);
            if (!v) setPasswordError("Password is required");
            else if (v.length < 8) setPasswordError("Password must be at least 8 characters");
            else setPasswordError("");
            setConfirmPasswordError(confirmPassword && confirmPassword !== v ? "Passwords do not match" : "");
          }}
          error={passwordError}
        />
        <Input
          label="Confirm Password*"
          placeholder="Re-enter password"
          leftSlot={
            <LockIcon width={18} height={18} color={Colors.textSecondary} />
          }
          isPassword
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            if (!v) setConfirmPasswordError("Please confirm your password");
            else if (v !== password) setConfirmPasswordError("Passwords do not match");
            else setConfirmPasswordError("");
          }}
          error={confirmPasswordError}
        />

          <PrimaryButton
            title={loading ? "Creating account..." : "Sign Up"}
            onPress={handleSignUp}
            disabled={loading}
            style={styles.signupBtn}
          />

          <AuthFooterLinkRow
            prefixText="Already have an account? "
            linkText="Sign in"
            onPress={() => router.push("/auth/business-signin")}
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
          keyExtractor={keyByValue}
          renderItem={renderBusinessTypeItem}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
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
  errorText: {
    color: "#FF4D4F",
    fontSize: 12,
    marginTop: 4,
  },
});
