import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const TERMS = [
  {
    number: "1.",
    title: "Acceptance Of Terms",
    body: "By accessing or using LOKL, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service. These terms apply to all visitors, users, and others who access the service.",
  },
  {
    number: "2.",
    title: "Use of Service",
    body: "LOKL grants you a limited, non-exclusive, non-transferable license to access and use the platform for personal, non-commercial purposes. You may not use the service for any illegal purpose or in violation of any regulations. You are responsible for your account security and all activity under your account.",
  },
  {
    number: "3.",
    title: "User Accounts",
    body: "You must be at least 13 years old to use LOKL. By creating an account, you represent that all information you provide is accurate. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
  },
  {
    number: "4.",
    title: "Privacy Policy",
    body: "Your use of LOKL is also governed by our Privacy Policy, which is incorporated into these Terms of Service by reference. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information.",
  },
  {
    number: "5.",
    title: "Prohibited Conduct",
    body: "You agree not to engage in any conduct that restricts or inhibits anyone's use of LOKL. This includes harassment, hate speech, unauthorized access attempts, or any activity that violates applicable laws or regulations.",
  },
];

export default function Terms() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {TERMS.map((term, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionNumber}>{term.number}</Text>
            <Text style={styles.sectionTitle}>{term.title}</Text>
            <Text style={styles.sectionBody}>{term.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  scroll: {
    padding: 20,
    gap: 14,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sectionNumber: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionBody: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
