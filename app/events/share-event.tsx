import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import MessagesIcon from "../../assets/icons/comments.svg";
import WhatsAppIcon from "../../assets/icons/whatsapp.svg";
import EmailIcon from "../../assets/icons/email.svg";
import MoreIcon from "../../assets/icons/link.svg";

export default function ShareScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string;
    subtitle?: string;
    image?: string;
    link?: string;
    type?: string;
  }>();

  const title = params.title ?? "Check this out on Lokl!";
  const subtitle = params.subtitle ?? "";
  const image = params.image ?? null;
  const link = params.link ?? "https://lokl.app";
  const type = params.type ?? "event";

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async (platform?: string) => {
    try {
      const message = platform === "whatsapp"
        ? `${title}\n${link}`
        : platform === "email"
        ? link
        : `${title}\n${subtitle}\n${link}`;

      await Share.share({ message, title });
    } catch (e: any) {
      if (e.message !== "The user did not share") {
        Alert.alert("Error", "Could not open share sheet.");
      }
    }
  };

  const labelForType = type === "post" ? "Post" : type === "venue" ? "Venue" : "Event";

  const shareOptions = [
    {
      icon: <MessagesIcon width={24} height={24} color={Colors.text} />,
      label: "Messages",
      onPress: () => nativeShare("messages"),
    },
    {
      icon: <WhatsAppIcon width={24} height={24} color={Colors.text} />,
      label: "WhatsApp",
      onPress: () => nativeShare("whatsapp"),
    },
    {
      icon: <EmailIcon width={24} height={24} color={Colors.text} />,
      label: "Email",
      onPress: () => nativeShare("email"),
    },
    {
      icon: <MoreIcon width={24} height={24} color={Colors.text} />,
      label: "More",
      onPress: () => nativeShare(),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Preview Card */}
        <View style={styles.previewCard}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={[styles.previewImage, styles.previewImagePlaceholder]}>
              <Ionicons
                name={type === "post" ? "image-outline" : type === "venue" ? "location-outline" : "calendar-outline"}
                size={24}
                color={Colors.textSecondary}
              />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle} numberOfLines={1}>{title.toUpperCase()}</Text>
            {subtitle ? (
              <View style={styles.previewMeta}>
                <Text style={styles.previewMetaText} numberOfLines={1}>{subtitle}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Link */}
        <Text style={styles.label}>{labelForType} Link</Text>
        <View style={styles.linkRow}>
          <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={16} color={Colors.black} />
            <Text style={styles.copyText}>{copied ? "Copied!" : "Copy"}</Text>
          </TouchableOpacity>
        </View>

        {/* Share Options */}
        <Text style={styles.label}>Share</Text>
        <View style={styles.shareGrid}>
          {shareOptions.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.shareOption}
              activeOpacity={0.8}
              onPress={opt.onPress}
            >
              <View style={styles.shareIconWrap}>{opt.icon}</View>
              <Text style={styles.shareLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 24,
  },
  previewImage: { width: 52, height: 52, borderRadius: 10 },
  previewImagePlaceholder: {
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  previewInfo: { flex: 1 },
  previewTitle: { color: Colors.text, fontSize: 14, fontWeight: "700", marginBottom: 4 },
  previewMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  previewMetaText: { color: Colors.textSecondary, fontSize: 13 },
  label: { color: Colors.text, fontSize: 15, fontWeight: "600", marginBottom: 12 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    height: 52,
    paddingLeft: 14,
    marginBottom: 24,
    overflow: "hidden",
  },
  linkText: { flex: 1, color: Colors.textSecondary, fontSize: 14 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    height: "100%",
    borderRadius: 12,
  },
  copyText: { color: Colors.black, fontSize: 14, fontWeight: "700" },
  shareGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  shareOption: {
    width: "47%",
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  shareIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.iconBg,
    justifyContent: "center",
    alignItems: "center",
  },
  shareLabel: { color: Colors.text, fontSize: 14, fontWeight: "500" },
});
