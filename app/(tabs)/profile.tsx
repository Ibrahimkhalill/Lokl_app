import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

const STATS = [
  { label: "Reviews", value: "24" },
  { label: "Friends", value: "138" },
  { label: "Venues", value: "67" },
];

const MENU = [
  { icon: "heart-outline", label: "Saved Venues" },
  { icon: "people-outline", label: "My Friends" },
  { icon: "trophy-outline", label: "Achievements" },
  { icon: "settings-outline", label: "Settings" },
  { icon: "help-circle-outline", label: "Help & Support" },
  { icon: "log-out-outline", label: "Log Out", danger: true },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
              }}
              style={styles.avatar}
            />
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color={Colors.black} />
            </View>
          </View>
          <Text style={styles.userName}>Alex Johnson</Text>
          <Text style={styles.userHandle}>@alexj • New York, NY</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              activeOpacity={0.8}
            >
              <View
                style={[styles.menuIcon, item.danger && styles.menuIconDanger]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={item.danger ? "#FF4444" : Colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.menuLabel,
                  item.danger && styles.menuLabelDanger,
                ]}
              >
                {item.label}
              </Text>
              {!item.danger && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.textMuted}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: { color: Colors.text, fontSize: 22, fontWeight: "800" },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  userName: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  userHandle: { color: Colors.textSecondary, fontSize: 13 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 24,
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: { color: Colors.textSecondary, fontSize: 12 },
  menu: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.iconBg,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconDanger: { backgroundColor: "rgba(255,68,68,0.12)" },
  menuLabel: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: "500" },
  menuLabelDanger: { color: "#FF4444" },
});
