import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { userService } from "../../services/userService";
import { eventService } from "../../services/eventService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

type Friend = { id: number; name: string; avatar?: string | null; username?: string | null };

/** Group admins pick friends here; each one gets an invitation they can accept or decline. */
export function GroupInviteModal({
  visible,
  groupId,
  groupName,
  onClose,
}: {
  visible: boolean;
  groupId: number;
  groupName: string;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPicked([]);
    setLoading(true);
    userService
      .getFriends()
      .then((res) => {
        const raw = res.data?.data ?? res.data;
        setFriends(Array.isArray(raw) ? raw : raw?.results ?? []);
      })
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, [visible]);

  const toggle = (id: number) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const send = async () => {
    if (!picked.length || sending) return;
    setSending(true);
    try {
      await eventService.inviteToGroup(groupId, picked);
      showToast({ type: "success", title: "Invitations sent", message: `${picked.length} invited to ${groupName}.` });
      onClose();
    } catch (e) {
      showToast({ type: "error", title: "Error", message: getErrorMessage(e) });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Invite people</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={s.sub}>They get a notification and can accept or decline.</Text>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 30 }} />
          ) : (
            <FlatList keyboardDismissMode="on-drag"
              data={friends}
              keyExtractor={(f) => String(f.id)}
              style={{ maxHeight: 360 }}
              ListEmptyComponent={<Text style={s.empty}>No friends to invite yet.</Text>}
              renderItem={({ item }) => {
                const on = picked.includes(item.id);
                return (
                  <TouchableOpacity style={s.row} onPress={() => toggle(item.id)} activeOpacity={0.8}>
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={s.avatar} />
                    ) : (
                      <View style={[s.avatar, s.avatarEmpty]}>
                        <Ionicons name="person" size={16} color={Colors.textSecondary} />
                      </View>
                    )}
                    <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                    <View style={[s.check, on && s.checkOn]}>
                      {on && <Ionicons name="checkmark" size={14} color={Colors.black} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <TouchableOpacity style={[s.sendBtn, (!picked.length || sending) && { opacity: 0.5 }]} onPress={send} disabled={!picked.length || sending}>
            {sending ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={s.sendText}>{picked.length ? `Invite ${picked.length}` : "Pick people to invite"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 34 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: Colors.text, fontSize: 18, fontWeight: "800" },
  sub: { color: Colors.textSecondary, fontSize: 12, marginTop: 4, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarEmpty: { backgroundColor: Colors.card, justifyContent: "center", alignItems: "center" },
  name: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: "600" },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.cardBorder, justifyContent: "center", alignItems: "center" },
  checkOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  empty: { color: Colors.textSecondary, textAlign: "center", paddingVertical: 24 },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 50, height: 50, justifyContent: "center", alignItems: "center", marginTop: 14 },
  sendText: { color: Colors.black, fontSize: 15, fontWeight: "700" },
});
