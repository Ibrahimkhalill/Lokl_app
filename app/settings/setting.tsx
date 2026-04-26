import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

import AccountIcon from "../../assets/icons/account.svg";
import NotificationsIcon from "../../assets/icons/notifications.svg";
import PrivacySecurityIcon from "../../assets/icons/security.svg";
import AppPreferenceCseIcon from "../../assets/icons/app_preference_cse.svg";
import TermsIcon from "../../assets/icons/terms.svg";
import LogoutIcon from "../../assets/icons/logout.svg";
import ArrowForwardIcon from "../../assets/icons/arrow-forward.svg";

const MENU_ITEMS = [
  {
    label: "ACCOUNT SETTING",
    sub: "Profile, email, password",
    icon: <AccountIcon width={24} height={24} color={Colors.primary} />,
    iconBg: "#3D4A1A",
    route: "/settings/account",
    danger: false,
  },
  {
    label: "NOTIFICATION",
    sub: "Push, email, SMS preferences",
    icon: <NotificationsIcon width={24} height={24} color={Colors.primary} />,
    iconBg: "#3D4A1A",
    route: "/settings/notifications",
    danger: false,
  },
  {
    label: "PRIVACY & SECURITY",
    sub: "Visibility, location, blocking",
    icon: <PrivacySecurityIcon width={24} height={24} color={Colors.primary} />,
    iconBg: "#3D4A1A",
    route: "/settings/privacy-security",
    danger: false,
  },

  {
    label: "APP PREFERENCE CSE",
    sub: "Auto-play, data, sound",
    icon: (
      <AppPreferenceCseIcon width={24} height={24} color={Colors.primary} />
    ),
    iconBg: "#3D4A1A",
    route: "/settings/preferences",
    danger: false,
  },
  {
    label: "TERMS & CONDITIONS",
    sub: "Version, terms",
    icon: <TermsIcon width={24} height={24} color={Colors.primary} />,
    iconBg: "#3D4A1A",
    route: "/settings/terms",
    danger: false,
  },
  {
    label: "PRIVACY POLICY",
    sub: "How your data is handled",
    icon: (
      <Ionicons
        name="shield-checkmark-outline"
        size={24}
        color={Colors.primary}
      />
    ),
    iconBg: "#3D4A1A",
    route: "/settings/privacy-policy",
    danger: false,
  },
  {
    label: "LOGOUT",
    sub: "Sign out of your account",
    icon: (
      <LogoutIcon width={24} height={24} color={"rgba(255, 100, 103, 1)"} />
    ),
    iconBg: "#4A1A1A",
    route: null,
    danger: true,
  },
];

export default function Settings() {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  const handlePress = (item: (typeof MENU_ITEMS)[0]) => {
    if (item.danger) {
      setShowLogout(true);
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ width: 40 }} />
        <Text style={s.headerTitle}>Setting</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Menu list */}
      <View style={s.menuList}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[s.menuItem]}
            onPress={() => handlePress(item)}
            activeOpacity={0.75}
          >
            <View style={[s.iconWrap, { backgroundColor: item.iconBg }]}>
              {item.icon}
            </View>
            <View style={s.menuText}>
              <Text style={[s.menuLabel]}>{item.label}</Text>
              <Text style={s.menuSub}>{item.sub}</Text>
            </View>
            {item.label !== "LOGOUT" && (
              <ArrowForwardIcon
                width={24}
                height={24}
                color={item.danger ? "#FF444466" : Colors.textMuted}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogout} transparent animationType="fade">
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <View style={s.logoutIconCircle}>
              <Ionicons name="log-out-outline" size={30} color="#FF4444" />
            </View>
            <Text style={s.logoutTitle}>LOGOUT</Text>
            <Text style={s.logoutBody}>
              Are you sure you want to logout from your account?
            </Text>
            <View style={s.logoutBtns}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setShowLogout(false)}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmBtn}
                onPress={() => {
                  setShowLogout(false);
                  router.replace("/auth/sign-in");
                }}
              >
                <Text style={s.confirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
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
  menuList: { paddingHorizontal: 20, gap: 10 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  menuItemDanger: {
    borderColor: "rgba(255,68,68,0.25)",
    backgroundColor: "rgba(255,68,68,0.06)",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { flex: 1 },
  menuLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 2,
  },

  menuSub: { color: Colors.textSecondary, fontSize: 12 },
  // Modal
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  logoutIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(255,68,68,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  logoutTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  logoutBody: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 26,
  },
  logoutBtns: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  confirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
});
