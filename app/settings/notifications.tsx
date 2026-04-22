import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import PushIcon from "../../assets/icons/push.svg";
import EmailIcon from "../../assets/icons/email.svg";
import SmsIcon from "../../assets/icons/sms.svg";
const CHANNELS = [
  {
    id: "push",
    label: "Push Notifications",
    sub: "Receive notification on your device",
    icon: <PushIcon width={24} height={24} color={Colors.text} />,
    defaultOn: true,
  },
  {
    id: "email",
    label: "Email Notifications",
    sub: "Get updates via email",
    icon: <EmailIcon width={24} height={24} color={Colors.text} />,
    defaultOn: true,
  },
  {
    id: "sms",
    label: "SMS Notifications",
    sub: "Text message alerts",
    icon: <SmsIcon width={24} height={24} color={Colors.text} />,
    defaultOn: false,
  },
];

export default function NotificationsSettingScreen() {
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true,
    email: true,
    sms: false,
  });

  const toggle = (id: string) =>
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>NOTIFICATION CHANNELS</Text>
        {CHANNELS.map((ch, i) => (
          <View key={ch.id}>
            {i > 0 && <View style={s.divider} />}
            <View style={s.row}>
              <View style={s.rowLeft}>
                <View style={s.iconWrap}>{ch.icon}</View>
                <View>
                  <Text style={s.rowLabel}>{ch.label}</Text>
                  <Text style={s.rowSub}>{ch.sub}</Text>
                </View>
              </View>
              <Switch
                value={toggles[ch.id]}
                onValueChange={() => toggle(ch.id)}
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
    paddingBottom: 6,
  },
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
    backgroundColor: "#3D4A1A",
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
