import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageIcon from "../../assets/icons/image.svg";

const MEMBERS = [
  {
    id: "m1",
    name: "Shane Martinez",
    status: "On my way home but i needed to stop by books store to...",
    time: "5 min",
    unread: 1,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
  },
  {
    id: "m2",
    name: "Katie Keller",
    status: "I'm watching friends. What are you doing?",
    time: "15 min",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  },
  {
    id: "m3",
    name: "Stephen Mann",
    status: "I'm working now. I'm marking a deposit for our company.",
    time: "20 min",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
  {
    id: "m4",
    name: "Melvin Pratt",
    status: "Great seeing you. i have to go now. I'll talk to you late.",
    time: "1hour",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
  },
];

export default function GroupCreateScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("Sports Club");
  const [bio, setBio] = useState('"Energy, Passion and Sports."');
  const [selected, setSelected] = useState<string[]>(["m2", "m3", "m4"]);

  const toggleMember = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo Upload */}
        <Text style={s.photoLabel}>Chose group photo</Text>
        <TouchableOpacity
          style={s.photoBox}
          onPress={() => router.push("/events/gallery")}
        >
          <ImageIcon width={36} height={36} color={Colors.text} />
          <Text style={s.photoTitle}>Group Photos</Text>
          <Text style={s.photoSub}>upload a new photo</Text>
        </TouchableOpacity>

        {/* Group Name */}
        <Text style={s.fieldLabel}>Group Name</Text>
        <TextInput
          style={s.input}
          value={groupName}
          onChangeText={setGroupName}
          placeholderTextColor={Colors.textMuted}
        />

        {/* Bio */}
        <Text style={s.fieldLabel}>Bio</Text>
        <TextInput
          style={[s.input, s.bioInput]}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          placeholderTextColor={Colors.textMuted}
        />

        {/* Member Selection */}
        <View style={s.divider} />
        {MEMBERS.map((member) => {
          const isSelected = selected.includes(member.id);
          return (
            <TouchableOpacity
              key={member.id}
              style={s.memberRow}
              onPress={() => toggleMember(member.id)}
              activeOpacity={0.8}
            >
              <View style={s.memberAvatarWrap}>
                <Image source={{ uri: member.avatar }} style={s.memberAvatar} />
                <View
                  style={[s.checkOverlay, isSelected && s.checkOverlaySelected]}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={Colors.primary}
                    />
                  )}
                </View>
              </View>
              <View style={s.memberInfo}>
                <Text style={s.memberName}>{member.name}</Text>
                <Text style={s.memberStatus} numberOfLines={2}>
                  {member.status}
                </Text>
              </View>
              <View style={s.memberRight}>
                <Text style={s.memberTime}>{member.time}</Text>
                {member.unread > 0 && (
                  <View style={s.unreadBadge}>
                    <Text style={s.unreadText}>{member.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Create Button */}
        <TouchableOpacity style={s.createBtn} onPress={() => router.back()}>
          <Text style={s.createBtnText}>Create Group</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
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
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  photoLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 8,
  },
  photoBox: {
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 22,
  },
  photoTitle: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  photoSub: { color: Colors.textSecondary, fontSize: 13 },
  fieldLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    height: 52,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 15,
    marginBottom: 18,
  },
  bioInput: { height: 80, textAlignVertical: "top", paddingTop: 14 },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 18,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  memberAvatarWrap: { position: "relative", width: 50, height: 50 },
  memberAvatar: { width: 50, height: 50, borderRadius: 25 },
  checkOverlay: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: "transparent",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  checkOverlaySelected: {
    borderColor: Colors.primary,
  },
  memberInfo: { flex: 1 },
  memberName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  memberStatus: { color: Colors.textSecondary, fontSize: 12, lineHeight: 16 },
  memberRight: { alignItems: "flex-end", gap: 6 },
  memberTime: { color: Colors.textMuted, fontSize: 12 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.modalHeader,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  createBtnText: { color: Colors.black, fontSize: 17, fontWeight: "700" },
});
