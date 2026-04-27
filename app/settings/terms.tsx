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

const TERMS = [
  {
    num: "1.",
    title: "Acceptance Of Terms",
    body: "By accessing or using LOKL, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service. These terms apply to all visitors, users, and others who access the service.",
  },
  {
    num: "2.",
    title: "Use of Service",
    body: "LOKL grants you a limited, non-exclusive, non-transferable license to access and use the platform for personal, non-commercial purposes. You may not use the service for any illegal purpose or in violation of any regulations. You are responsible for your account security and all activity under your account.",
  },
  {
    num: "3.",
    title: "User Accounts",
    body: "You must be at least 13 years old to use LOKL. By creating an account, you represent that all information you provide is accurate. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
  },
];

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {TERMS.map((item, i) => (
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
