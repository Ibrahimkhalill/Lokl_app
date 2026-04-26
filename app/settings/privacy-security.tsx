import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationIcon from "../../assets/icons/locations_sharing.svg";
import EmailIcon from "../../assets/icons/email.svg";
type Visibility = "public" | "followers" | "private";

const TOGGLES = [
  {
    id: "location",
    label: "Location Sharing",
    sub: "Share your location with friends",
    icon: <LocationIcon width={24} height={24} color={Colors.primary} />,
    defaultOn: true,
  },
  {
    id: "activity",
    label: "Activity Status",
    sub: "Show when you're active",
    icon: <EmailIcon width={24} height={24} color={Colors.primary} />,
    defaultOn: true,
  },
];

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    location: true,
    activity: true,
  });

  const toggle = (id: string) =>
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  const visibilityOptions: { key: Visibility; label: string }[] = [
    { key: "public", label: "Public" },
    { key: "followers", label: "Followers" },
    { key: "private", label: "Private" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Privacy & security</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Information section */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>PROFILE INFORMATION</Text>
        <View style={s.visibilityRow}>
          <Text style={s.visibilityLabel}>Profile Visibility</Text>
          <View style={s.visibilityOptions}>
            {visibilityOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[s.visBtn, visibility === opt.key && s.visBtnActive]}
                onPress={() => setVisibility(opt.key)}
              >
                <Text
                  style={[
                    s.visBtnText,
                    visibility === opt.key && s.visBtnTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Notification Channels section */}
      <View style={[s.card, { marginTop: 14 }]}>
        <Text style={s.sectionTitle}>NOTIFICATION CHANNELS</Text>
        {TOGGLES.map((item, i) => (
          <View key={item.id}>
            {i > 0 && <View style={s.divider} />}
            <View style={s.row}>
              <View style={s.rowLeft}>
                <View style={s.iconWrap}>{item.icon}</View>
                <View>
                  <Text style={s.rowLabel}>{item.label}</Text>
                  <Text style={s.rowSub}>{item.sub}</Text>
                </View>
              </View>
              <Switch
                value={toggles[item.id]}
                onValueChange={() => toggle(item.id)}
                trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.cardBorder}
              />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  visibilityRow: { paddingHorizontal: 16, paddingBottom: 16 },
  visibilityLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  visibilityOptions: { flexDirection: "row", gap: 10 },
  visBtn: {
    flex: 1,
    height: 40,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  visBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  visBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "600" },
  visBtnTextActive: { color: Colors.black, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    // backgroundColor: "#3D4A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  rowSub: { color: Colors.textSecondary, fontSize: 12 },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 16,
  },
});
