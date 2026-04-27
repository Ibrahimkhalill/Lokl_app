import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MediaPickerCard,
  FormField,
  AppTextInput,
  AppHeader,
  AppHeaderIconButton,
} from "../../components/primitives";
import { pickAvatarImage } from "../../lib/mediaPicker";

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={s.header}>
          <AppHeader
            title="Edit Profile"
            titleStyle={s.headerTitle}
            leftSlot={
              <AppHeaderIconButton onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={22} color={Colors.text} />
              </AppHeaderIconButton>
            }
            rightSlot={
              <AppHeaderIconButton
                onPress={() => router.replace("/(tabs)/profile")}
              >
                <Ionicons name="close" size={20} color={Colors.text} />
              </AppHeaderIconButton>
            }
          />
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.fieldLabel}>Edit Photo</Text>
          <MediaPickerCard
            height={150}
            previewUri={avatarUri}
            previewKind="image"
            onPress={async () => {
              const picked = await pickAvatarImage();
              if (picked) setAvatarUri(picked.uri);
            }}
            icon={
              <Ionicons
                name="image-outline"
                size={40}
                color={Colors.textSecondary}
              />
            }
            title="New Photos"
            subtitle="photo"
          />

          <FormField label="Name" labelStyle={s.fieldLabel}>
            <AppTextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
          </FormField>

          <FormField label="Bio" labelStyle={s.fieldLabel}>
            <AppTextInput
              style={s.bioInput}
              placeholder="Name"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </FormField>

          <View style={s.divider} />

          <FormField label="Current Passwords" labelStyle={s.fieldLabel}>
            <AppTextInput
              value={currentPass}
              onChangeText={setCurrentPass}
              secureTextEntry
              placeholder="••••••••••••••"
            />
          </FormField>

          <View style={s.divider} />

          <Text style={s.changePwdTitle}>Change your password</Text>

          <FormField label="New Password" labelStyle={s.fieldLabel}>
            <AppTextInput
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
              placeholder="000000000"
            />
          </FormField>

          <FormField label="Confirm Password" labelStyle={s.fieldLabel}>
            <AppTextInput
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry
              placeholder="000000000"
            />
          </FormField>

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
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  fieldLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
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
