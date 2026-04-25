import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const NOTIFICATIONS = {
  new: [
    {
      id: "n1",
      name: "Katie Keller",
      action: "reacted to your review of Book Club",
      time: "2d",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    },
    {
      id: "n2",
      name: "Katie Keller",
      action: "reacted to your review of Book Club",
      time: "2d",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    },
  ],
  earlier: [
    {
      id: "n3",
      name: "Katie Keller",
      action: "reacted to your review of Book Club",
      time: "2d",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    },
    {
      id: "n4",
      name: "Katie Keller",
      action: "reacted to your review of Book Club",
      time: "2d",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    },
  ],
};

type NotifItem = {
  id: string;
  name: string;
  action: string;
  time: string;
  avatar: string;
};

function NotifRow({ item }: { item: NotifItem }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.rowContent}>
        <Text style={styles.rowText}>
          <Text style={styles.rowName}>{item.name} </Text>
          <Text style={styles.rowAction}>{item.action}</Text>
        </Text>
      </View>
      <Text style={styles.rowTime}>{item.time}</Text>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={[
          { type: "label", label: "New", id: "label-new" },
          ...NOTIFICATIONS.new.map((n) => ({ ...n, type: "notif" })),
          { type: "label", label: "Earlier", id: "label-earlier" },
          ...NOTIFICATIONS.earlier.map((n) => ({ ...n, type: "notif" })),
        ]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.type === "label") {
            return (
              <Text style={styles.sectionLabel}>{(item as any).label}</Text>
            );
          }
          return <NotifRow item={item as NotifItem} />;
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  rowContent: { flex: 1 },
  rowText: { fontSize: 14, lineHeight: 20 },
  rowName: { color: Colors.text, fontWeight: "700" },
  rowAction: { color: Colors.textSecondary },
  rowTime: { color: Colors.textMuted, fontSize: 12 },
  separator: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginVertical: 6,
  },
});
