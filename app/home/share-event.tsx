import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Share, Linking, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import MessagesIcon from "../../assets/icons/comments.svg";
import WhatsAppIcon from "../../assets/icons/whatsapp.svg";
import EmailIcon from "../../assets/icons/email.svg";
import MoreIcon from "../../assets/icons/link.svg";
import * as Clipboard from "expo-clipboard";
import { postService } from "../../services/postService";
import { sharedPostStore } from "../../lib/sharedPostStore";

export default function ShareEventScreen() {
  const router = useRouter();
  const { postId, imageUrl, title, subtitle } = useLocalSearchParams<{
    postId?: string;
    imageUrl?: string;
    title?: string;
    subtitle?: string;
  }>();
  const [copied, setCopied] = React.useState(false);
  const sharedRef = useRef(false);

  const postUrl = `https://lokl.app/post/${postId ?? ""}`;

  const recordShare = () => {
    if (sharedRef.current) return;
    sharedRef.current = true;
    const id = Number(postId);
    if (id) {
      postService.sharePost(id).catch(() => {});
      sharedPostStore.set(id);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(postUrl);
    recordShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const message = title ? `${title}\n${postUrl}` : postUrl;

  const openOrFallback = async (url: string) => {
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
      recordShare();
    } else {
      handleMore();
    }
  };

  const handleMessages = () =>
    openOrFallback(`sms:?body=${encodeURIComponent(message)}`);

  const handleWhatsApp = () =>
    openOrFallback(`whatsapp://send?text=${encodeURIComponent(message)}`);

  const handleEmail = () =>
    openOrFallback(
      `mailto:?subject=${encodeURIComponent(title ?? "Check this post on Lokl")}&body=${encodeURIComponent(message)}`
    );

  const handleMore = async () => {
    try {
      const result = await Share.share({ message, url: postUrl, title: title ?? "Check this post on Lokl" });
      if (result.action === Share.sharedAction) recordShare();
    } catch {}
  };

  const hasPreview = !!imageUrl || !!title;

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

        {/* Post preview card — horizontal, small image left */}
        {hasPreview && (
          <View style={styles.preview}>
            {!!imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
            )}
            <View style={styles.previewText}>
              {!!title && (
                <Text style={styles.previewTitle} numberOfLines={2}>
                  {title.toUpperCase()}
                </Text>
              )}
              {!!subtitle && (
                <Text style={styles.previewSubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Link */}
        <Text style={styles.label}>Post Link</Text>
        <View style={styles.linkRow}>
          <Text style={styles.linkText} numberOfLines={1}>
            {postUrl}
          </Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={16} color={Colors.black} />
            <Text style={styles.copyText}>{copied ? "Copied!" : "Copy"}</Text>
          </TouchableOpacity>
        </View>

        {/* Share options */}
        <Text style={styles.label}>Share</Text>
        <View style={styles.shareGrid}>
          {([
            { label: "Messages", icon: <MessagesIcon width={22} height={22} color={Colors.text} />, onPress: handleMessages },
            { label: "WhatsApp", icon: <WhatsAppIcon width={22} height={22} color={Colors.text} />, onPress: handleWhatsApp },
            { label: "Email",    icon: <EmailIcon    width={22} height={22} color={Colors.text} />, onPress: handleEmail },
            { label: "More",     icon: <MoreIcon     width={22} height={22} color={Colors.text} />, onPress: handleMore },
          ] as const).map((opt) => (
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
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1,
    borderColor: Colors.cardBorder, justifyContent: "center", alignItems: "center",
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },

  preview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
    marginBottom: 24,
    gap: 12,
  },
  previewImage: {
    width: 72,
    height: 72,
  },
  previewText: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  previewTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  previewSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },

  label: { color: Colors.text, fontSize: 15, fontWeight: "600", marginBottom: 12 },
  linkRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.cardBorder,
    height: 52, paddingLeft: 14, marginBottom: 24, overflow: "hidden",
  },
  linkText: { flex: 1, color: Colors.textSecondary, fontSize: 14 },
  copyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: 16,
    height: "100%", borderRadius: 12,
  },
  copyText: { color: Colors.black, fontSize: 14, fontWeight: "700" },

  shareGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  shareOption: {
    width: "47%", backgroundColor: Colors.card,
    borderRadius: 14, borderWidth: 1,
    borderColor: Colors.cardBorder, padding: 20,
    alignItems: "center", gap: 10,
  },
  shareIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.iconBg,
    justifyContent: "center", alignItems: "center",
  },
  shareLabel: { color: Colors.text, fontSize: 14, fontWeight: "500" },
});
