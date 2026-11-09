import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Modal, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";

type Badge = { key: string; title: string; description: string; icon: string; unlocked: boolean };

const SEEN_KEY = (userId: number | string) => `lokl_seen_badges_${userId}`;

/**
 * A short celebration the moment a badge is earned. It checks when the app opens, comes back to the foreground
 * and when the person moves between screens (at most every 20 seconds). The first check only remembers the badges
 * the person already has, so nobody gets a pile of pop-ups for old rankings.
 */
export function BadgeCelebration() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [queue, setQueue] = useState<Badge[]>([]);
  const lastCheck = useRef(0);
  const busy = useRef(false);

  const check = useCallback(async () => {
    if (!user?.id || busy.current || Date.now() - lastCheck.current < 20000) return;
    busy.current = true;
    lastCheck.current = Date.now();
    try {
      const res = await userService.getAchievements();
      const d = res.data?.data ?? res.data;
      const unlocked: Badge[] = (d?.achievements ?? []).filter((a: Badge) => a.unlocked);
      const raw = await AsyncStorage.getItem(SEEN_KEY(user.id));
      const keys = unlocked.map((b) => b.key);
      if (raw === null) {
        await AsyncStorage.setItem(SEEN_KEY(user.id), JSON.stringify(keys));
        return;
      }
      const seen: string[] = JSON.parse(raw);
      const fresh = unlocked.filter((b) => !seen.includes(b.key));
      if (fresh.length) {
        await AsyncStorage.setItem(SEEN_KEY(user.id), JSON.stringify([...seen, ...fresh.map((b) => b.key)]));
        setQueue((q) => [...q, ...fresh]);
      }
    } catch {
      // never bother the person with a failed badge check
    } finally {
      busy.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    void check();
  }, [check, pathname]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void check();
    });
    return () => sub.remove();
  }, [check]);

  const badge = queue[0];
  if (!badge) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setQueue((q) => q.slice(1))}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Ionicons name={(badge.icon || "trophy-outline") as any} size={44} color={Colors.primary} />
          </View>
          <Text style={s.kicker}>BADGE EARNED</Text>
          <Text style={s.title}>{badge.title}</Text>
          <Text style={s.desc}>{badge.description}</Text>
          <TouchableOpacity style={s.btn} onPress={() => setQueue((q) => q.slice(1))}>
            <Text style={s.btnText}>{queue.length > 1 ? "Next" : "Nice!"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setQueue([]);
              router.push("/user/streaks?tab=achievements" as never);
            }}
          >
            <Text style={s.link}>See all badges</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 28 },
  card: { width: "100%", backgroundColor: Colors.card, borderRadius: 24, borderWidth: 1, borderColor: Colors.cardBorder, padding: 26, alignItems: "center" },
  iconWrap: { width: 92, height: 92, borderRadius: 46, backgroundColor: "rgba(255,255,255,0.06)", justifyContent: "center", alignItems: "center", marginBottom: 14 },
  kicker: { color: Colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: Colors.text, fontSize: 24, fontWeight: "800", marginTop: 6 },
  desc: { color: Colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: 6, marginBottom: 18 },
  btn: { alignSelf: "stretch", backgroundColor: Colors.primary, borderRadius: 50, height: 48, justifyContent: "center", alignItems: "center" },
  btnText: { color: Colors.black, fontSize: 15, fontWeight: "700" },
  link: { color: Colors.textSecondary, fontSize: 13, marginTop: 14 },
});
