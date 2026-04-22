import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountIcon from "../../assets/icons/account.svg";
import CameraIcon from "../../assets/icons/camera.svg";
import LockIcon from "../../assets/icons/loack.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
export default function Account() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Account</Text>
        <TouchableOpacity
          style={s.closeBtn}
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Ionicons name="close" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Account Setting banner */}
      <View style={s.bannerCard}>
        <View style={s.bannerIconWrap}>
          <AccountIcon width={24} height={24} />
        </View>
        <View>
          <Text style={s.bannerTitle}>ACCOUNT SETTING</Text>
          <Text style={s.bannerSub}>Profile, email, password</Text>
        </View>
      </View>

      {/* Profile Information section */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>PROFILE INFORMATION</Text>
        <TouchableOpacity
          style={s.row}
          onPress={() => router.push("/settings/edit-profile")}
        >
          <Text style={s.rowLabel}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={s.divider} />
        <TouchableOpacity style={s.row}>
          <Text style={s.rowLabel}>Name</Text>
        </TouchableOpacity>
        <View style={s.divider} />
        <TouchableOpacity style={s.row}>
          <Text style={s.rowLabel}>Change Profile Photo</Text>
          <CameraIcon width={24} height={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={s.divider} />
        <TouchableOpacity style={s.row}>
          <Text style={s.rowLabel}>Change Password</Text>
          <LockIcon width={24} height={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Delete Account */}
      <View style={s.deleteSection}>
        <TouchableOpacity style={s.deleteRow}>
          <Text style={s.deleteLabel}>Delete Account</Text>
          <DeleteIcon width={24} height={24} color="#FF4444" />
        </TouchableOpacity>
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#3D4A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  bannerSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  section: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowLabel: { color: Colors.text, fontSize: 15 },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 16,
  },
  deleteSection: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255,68,68,0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.2)",
  },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  deleteLabel: { color: "#FF4444", fontSize: 15, fontWeight: "500" },
});
