// app/profile/edit-profile.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
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
import { getErrorMessage } from "../../lib/api";
import { settingService } from "@/services/settingServices";

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");


  // Solution 1: Use useFocusEffect instead of useEffect
  useFocusEffect(
    useCallback(() => {
      console.log("🔵 EditProfileScreen focused, fetching profile...");
      fetchUserProfile();
      
      // Cleanup function (optional)
      return () => {
        console.log("🟠 EditProfileScreen unfocused");
      };
    }, [])
  );

  // Solution 2: Keep useEffect as backup
  useEffect(() => {
    console.log("🔵 useEffect running on mount");
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    console.log("🟡 fetchUserProfile called");
    setLoading(true);
    try {
      console.log("🟣 Calling settingService.getOwnProfile()...");
      const response = await settingService.getOwnProfile();
      console.log("✅ API Response received:", response);
      
      const data = response.data?.data || response.data;
      console.log("📦 Parsed data:", data);
      
      setName(data.name || "");
      setBio(data.bio || "");
      setPhone(data.phone || "");
      setDateOfBirth(data.date_of_birth || "");
      setOriginalAvatarUrl(data.avatar || data.avatar_url || null);
      setAvatarUri(data.avatar || data.avatar_url || null);
      
      console.log("✅ Profile loaded successfully");
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateProfile = async () => {
    console.log("🟡 handleUpdateProfile called");
    
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setSaving(true);
    try {
      console.log("🟣 Preparing form data...");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("phone", phone);
      formData.append("date_of_birth", dateOfBirth);

      if (avatarUri && avatarUri !== originalAvatarUrl) {
        console.log("🟠 Avatar changed, preparing upload...");
        const ext = avatarUri.split(".").pop() ?? "jpg";
        formData.append("avatar", {
          uri: avatarUri,
          name: `avatar_${Date.now()}.${ext}`,
          type: "image/jpeg",
        } as any);
        console.log("✅ Avatar file added to formData");
      }

      console.log("🟣 Calling settingService.updateProfile()...");
      const response = await settingService.updateProfile(formData);
      console.log("✅ Update response:", response);
      
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("❌ Update error:", error);
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  // Add a timeout to force re-render if needed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("⚠️ Loading timeout - forcing re-render");
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={s.loadingText}>Loading profile...</Text>
          {/* <TouchableOpacity 
            onPress={() => {
              console.log("🔄 Manual retry pressed");
              fetchUserProfile();
            }}
            style={s.retryBtn}
          >
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity> */}
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={s.fieldLabel}>Profile Photo</Text>
          <MediaPickerCard
            height={150}
            previewUri={avatarUri}
            previewKind="image"
            onPress={async () => {
              console.log("🟠 Media picker pressed");
              const picked = await pickAvatarImage();
              if (picked) {
                console.log("✅ Image picked:", picked.uri);
                setAvatarUri(picked.uri);
              } else {
                console.log("⚠️ No image picked");
              }
            }}
            icon={
              <Ionicons
                name="image-outline"
                size={40}
                color={Colors.textSecondary}
              />
            }
            title="Change Photo"
            subtitle="tap to update"
          />

          <FormField label="Name" labelStyle={s.fieldLabel}>
            <AppTextInput
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </FormField>

          <FormField label="Phone" labelStyle={s.fieldLabel}>
            <AppTextInput
              placeholder="Enter phone number"
              value={phone}
              readOnly
              keyboardType="phone-pad"
            />
          </FormField>

          <FormField label="Bio" labelStyle={s.fieldLabel}>
            <AppTextInput
              style={s.bioInput}
              placeholder="Tell something about yourself"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </FormField>

          {/* <FormField label="Date of Birth" labelStyle={s.fieldLabel}>
            <AppTextInput
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </FormField> */}

          <TouchableOpacity
            style={[s.saveBtn, saving && s.disabledBtn]}
            onPress={handleUpdateProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={s.saveBtnText}>Save Profile</Text>
            )}
          </TouchableOpacity>

       

          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    color: Colors.textSecondary, 
    marginTop: 12, 
    fontSize: 14 
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "600",
  },
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
    marginTop: 24,
  },
  saveBtnText: { color: Colors.black, fontSize: 17, fontWeight: "700" },
  disabledBtn: { opacity: 0.6 },
});