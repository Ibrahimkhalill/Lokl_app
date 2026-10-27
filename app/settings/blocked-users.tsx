import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Avatar } from "../../components/primitives/Avatar";
import { EmptyState } from "../../components/primitives";
import { safetyService } from "../../services/safetyService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

type BlockedUser = { id: number; name: string; avatar: string | null };

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await safetyService.getBlocked();
      const data = res.data?.data ?? res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("[Blocked] load error:", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unblock = async (u: BlockedUser) => {
    if (busyId) return;
    setBusyId(u.id);
    try {
      await safetyService.unblock(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) {
      showToast({ type: "error", title: "Couldn't unblock", message: getErrorMessage(e) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Blocked users</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => String(u.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ListEmptyComponent={
            <EmptyState
              icon="ban-outline"
              title="No blocked users"
              subtitle="People you block won't see your posts or message you."
            />
          }
          renderItem={({ item }) => (
            <View style={s.row}>
              <Avatar uri={item.avatar} size={42} />
              <Text style={s.name} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity style={s.btn} onPress={() => unblock(item)} disabled={busyId === item.id}>
                <Text style={s.btnText}>{busyId === item.id ? "…" : "Unblock"}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  name: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: "600" },
  btn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  btnText: { color: Colors.primary, fontSize: 13, fontWeight: "700" },
});
