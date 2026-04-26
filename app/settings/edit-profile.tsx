import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={s.closeBtn}
            onPress={() => router.replace("/(tabs)/profile")}
          >
            <Ionicons name="close" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Upload */}
          <Text style={s.fieldLabel}>Edit Photo</Text>
          <TouchableOpacity style={s.photoBox}>
            <Ionicons
              name="image-outline"
              size={40}
              color={Colors.textSecondary}
            />
            <Text style={s.photoTitle}>New Photos</Text>
            <Text style={s.photoSub}>photo</Text>
          </TouchableOpacity>

        {/* Name */}
        <Text style={s.fieldLabel}>Name</Text>
        <TextInput
          style={s.input}
          placeholder="Name"
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        {/* Bio */}
        <Text style={s.fieldLabel}>Bio</Text>
        <TextInput
          style={[s.input, s.bioInput]}
          placeholder="Name"
          placeholderTextColor={Colors.textMuted}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={s.divider} />

        {/* Current Password */}
        <Text style={s.fieldLabel}>Current Passwords</Text>
        <TextInput
          style={s.input}
          value={currentPass}
          onChangeText={setCurrentPass}
          secureTextEntry
          placeholder="••••••••••••••"
          placeholderTextColor={Colors.textMuted}
        />

        <View style={s.divider} />

        {/* Change password */}
        <Text style={s.changePwdTitle}>Change your password</Text>

        <Text style={s.fieldLabel}>New Password</Text>
        <TextInput
          style={s.input}
          value={newPass}
          onChangeText={setNewPass}
          secureTextEntry
          placeholder="000000000"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={s.fieldLabel}>Confirm Password</Text>
        <TextInput
          style={s.input}
          value={confirmPass}
          onChangeText={setConfirmPass}
          secureTextEntry
          placeholder="000000000"
          placeholderTextColor={Colors.textMuted}
        />

          {/* Save */}
          <TouchableOpacity style={s.saveBtn} onPress={() => router.back()}>
            <Text style={s.saveBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
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
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  fieldLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
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
    marginBottom: 20,
  },
  photoTitle: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  photoSub: { color: Colors.textSecondary, fontSize: 13 },
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
  bioInput: { height: 110, paddingTop: 14 },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginBottom: 20 },
  changePwdTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: Colors.black, fontSize: 17, fontWeight: "700" },
});
