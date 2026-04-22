import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTIONS = [
  {
    num: "1.",
    title: "Information We Collect",
    body: "We collect information you provide directly: name, email, profile photo, sport preferences, and location when permitted. We also collect usage data, device information, and interaction logs to improve our service. Payment information is processed by certified third-party providers and we do not store full card details.",
  },
  {
    num: "2.",
    title: "How We Use Your Information",
    body: "Your information is used to: provide and improve our services, personalize your experience, process bookings and payments, send important notifications, analyze usage patterns, and ensure safety and security of the platform. We do not sell your personal data to third parties.",
  },
  {
    num: "3.",
    title: "Location Data",
    body: "Location data is used to show nearby venues and events, enable map features, and provide location-based recommendations. You can disable location sharing at any time in Settings → Privacy & Security → Location Sharing. Disabling may limit certain features.",
  },
  {
    num: "4.",
    title: "Data Sharing",
    body: "We may share your information with service providers who assist in our operations, business partners with your consent, and as required by law. All third-party partners are contractually obligated to protect your information and use it only as directed.",
  },
  {
    num: "5.",
    title: "Data Retention",
    body: "We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time through Settings → Account → Delete Account. Some data may be retained for legal compliance purposes.",
  },
  {
    num: "6.",
    title: "Your Rights",
    body: "You have the right to access, correct, or delete your personal information. You may opt out of marketing communications at any time. For data requests or privacy concerns, contact our privacy team through the Help & Support section of the app.",
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Privacy policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((item, i) => (
          <View key={i} style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardNum}>{item.num}</Text>
              <Text style={s.cardTitle}>{item.title}</Text>
            </View>
            <Text style={s.cardBody}>{item.body}</Text>
          </View>
        ))}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
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
  scroll: { padding: 20, gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 18,
  },
  cardHeader: { marginBottom: 10 },
  cardNum: { color: Colors.primary, fontSize: 14, fontWeight: "700" },
  cardTitle: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 1,
  },
  cardBody: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
