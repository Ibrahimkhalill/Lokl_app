import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
const SHARE_OPTIONS = [
  { icon: "chatbubble-outline", label: "Messages", bg: "#1A237E" },
  { icon: "logo-whatsapp", label: "WhatsApp", bg: "#1B5E20" },
  { icon: "mail-outline", label: "Email", bg: "#B71C1C" },
  { icon: "link-outline", label: "More", bg: "#4A148C" },
];

export default function ShareEventScreen() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Share</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.eventCard}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=200&q=80",
            }}
            style={s.eventThumb}
          />
          <View style={s.eventInfo}>
            <Text style={s.eventName}>BOXING FUNDAMENTALS</Text>
            <View style={s.eventMeta}>
              <Text style={s.eventMetaText}>Tomorrow</Text>
              <View style={s.dot} />
              <Text style={s.eventMetaText}>Downtown Courts</Text>
            </View>
          </View>
        </View>

        <Text style={s.label}>Event Link</Text>
        <View style={s.linkRow}>
          <Text style={s.linkText} numberOfLines={1}>
            https://lokl.app/event/2
          </Text>
          <TouchableOpacity style={s.copyBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={15} color={Colors.black} />
            <Text style={s.copyText}>{copied ? "Copied!" : "Copy"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.label}>Share</Text>
        <View style={s.shareGrid}>
          {SHARE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={s.shareOption}
              activeOpacity={0.8}
            >
              <View style={[s.shareIconWrap, { backgroundColor: opt.bg }]}>
                <Ionicons
                  name={opt.icon as any}
                  size={24}
                  color={Colors.white}
                />
              </View>
              <Text style={s.shareLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 18 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    marginBottom: 8,
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
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 22,
  },
  eventThumb: { width: 52, height: 52, borderRadius: 10 },
  eventInfo: { flex: 1 },
  eventName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventMetaText: { color: Colors.textSecondary, fontSize: 12 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
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
  linkText: { flex: 1, color: Colors.textSecondary, fontSize: 13 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    height: "100%",
  },
  copyText: { color: Colors.black, fontSize: 13, fontWeight: "700" },
  shareGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  shareOption: {
    width: "47%",
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 18,
    alignItems: "center",
    gap: 10,
  },
  shareIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  shareLabel: { color: Colors.text, fontSize: 13, fontWeight: "500" },
});
