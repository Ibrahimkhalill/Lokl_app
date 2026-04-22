import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import AutoPlayIcon from "../../assets/icons/auto_play.svg";
import DataServerIcon from "../../assets/icons/data_server.svg";
import SoundsIcon from "../../assets/icons/sounds.svg";
import HapticsIcon from "../../assets/icons/haptics.svg";
const SECTIONS = [
  {
    title: "MEDIA & PLAYBACK",
    items: [
      {
        id: "autoplay",
        label: "Auto-play Videos",
        sub: "videos play automatically in feed",
        icon: <AutoPlayIcon width={24} height={24} color={Colors.primary} />,
        on: true,
      },
      {
        id: "datasaver",
        label: "Date Saver",
        sub: "reduce date usage",
        icon: <DataServerIcon width={24} height={24} color={Colors.primary} />,
        on: true,
      },
    ],
  },
  {
    title: "SOUND & HAPTICS",
    items: [
      {
        id: "sound",
        label: "Sound effects",
        sub: "play sounds for actions",
        icon: <SoundsIcon width={24} height={24} color={Colors.primary} />,
        on: true,
      },
      {
        id: "haptic",
        label: "Haptic Feedback",
        sub: "vibration feedback",
        icon: <HapticsIcon width={24} height={24} color={Colors.primary} />,
        on: true,
      },
    ],
  },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    autoplay: true,
    datasaver: true,
    sound: true,
    haptic: true,
  });

  const toggle = (id: string) =>
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      {SECTIONS.map((section, si) => (
        <View key={si} style={[s.card, si > 0 && { marginTop: 14 }]}>
          <Text style={s.sectionTitle}>{section.title}</Text>
          {section.items.map((item, i) => (
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
                  trackColor={{
                    false: Colors.cardBorder,
                    true: Colors.primary,
                  }}
                  thumbColor={Colors.white}
                  ios_backgroundColor={Colors.cardBorder}
                />
              </View>
            </View>
          ))}
        </View>
      ))}
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
