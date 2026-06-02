// app/settings/account.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountIcon from "../../assets/icons/account.svg";
import LockIcon from "../../assets/icons/loack.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
import CameraProfileIcon from "../../assets/icons/camera_profile.svg";
import { userService } from "../../services/userService";
import { getErrorMessage } from "../../lib/api";
import { settingService } from "@/services/settingServices";

export default function Account() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Password modal states
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Delete modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Refs for text inputs
  const currentPasswordRef = useRef<TextInput>(null);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const deleteConfirmRef = useRef<TextInput>(null);

  // Fetch user profile
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await settingService.getOwnProfile();
      const data = response.data?.data || response.data;
      setUserName(data.name || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!currentPassword) {
      Alert.alert("Error", "Please enter current password");
      return;
    }
    if (!newPassword) {
      Alert.alert("Error", "Please enter new password");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await settingService.changePassword({
        current: currentPassword,
        newPass: newPassword,
        confirm: confirmPassword,
      });
      Alert.alert("Success", "Password changed successfully");
      setPasswordModalVisible(false);
      resetPasswordForm();
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      Alert.alert("Error", 'Please type "DELETE" to confirm');
      return;
    }

    setDeleting(true);
    try {
      await settingService.deleteAccount();
      Alert.alert("Account Deleted", "Your account has been deleted", [
        { text: "OK", onPress: () => router.replace("/auth/sign-in") }
      ]);
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Account</Text>
        <TouchableOpacity
          style={s.closeBtn}
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Ionicons name="close" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Account Setting banner */}
      <View style={s.bannerCard}>
        <View style={s.bannerIconWrap}>
          <AccountIcon width={24} height={24} color={Colors.primary} />
        </View>
        <View>
          <Text style={s.bannerTitle}>ACCOUNT SETTING</Text>
          <Text style={s.bannerSub}>Profile, email, password</Text>
        </View>
      </View>

      {/* Profile Information section */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>PROFILE INFORMATION</Text>
        <TouchableOpacity
          style={s.row}
          onPress={() => router.push("/settings/edit-profile")}
        >
          <Text style={s.rowLabel}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={s.divider} />
        <View style={s.row}>
          <Text style={s.rowLabel}>Name</Text>
          <Text style={s.rowValue}>{userName || "Not set"}</Text>
        </View>
        <View style={s.divider} />
        <TouchableOpacity 
          style={s.row}
          onPress={() => router.push("/settings/edit-profile")}
        >
          <Text style={s.rowLabel}>Change Profile Photo</Text>
          <CameraProfileIcon width={24} height={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={s.divider} />
        <TouchableOpacity 
          style={s.row}
          onPress={() => setPasswordModalVisible(true)}
        >
          <Text style={s.rowLabel}>Change Password</Text>
          <LockIcon width={24} height={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Delete Account */}
      <View style={s.deleteSection}>
        <TouchableOpacity 
          style={s.deleteRow}
          onPress={() => setDeleteModalVisible(true)}
        >
          <Text style={s.deleteLabel}>Delete Account</Text>
          <DeleteIcon width={24} height={24} color="#FF4444" />
        </TouchableOpacity>
      </View>

      {/* Password Change Modal with Keyboard Handling */}
      <Modal
        visible={passwordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={s.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={s.modalOverlay}>
              <View style={s.modalContent}>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>Change Password</Text>
                  <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={s.modalScrollContent}
                >
                  <View style={s.modalBody}>
                    <Text style={s.inputLabel}>Current Password</Text>
                    <TextInput
                      ref={currentPasswordRef}
                      style={s.input}
                      placeholder="Enter current password"
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      returnKeyType="next"
                      onSubmitEditing={() => newPasswordRef.current?.focus()}
                      blurOnSubmit={false}
                    />

                    <Text style={s.inputLabel}>New Password</Text>
                    <TextInput
                      ref={newPasswordRef}
                      style={s.input}
                      placeholder="Enter new password"
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                      returnKeyType="next"
                      onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                      blurOnSubmit={false}
                    />

                    <Text style={s.inputLabel}>Confirm New Password</Text>
                    <TextInput
                      ref={confirmPasswordRef}
                      style={s.input}
                      placeholder="Confirm new password"
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handlePasswordChange}
                    />

                    <TouchableOpacity
                      style={[s.modalSubmitBtn, changingPassword && s.disabledBtn]}
                      onPress={handlePasswordChange}
                      disabled={changingPassword}
                    >
                      {changingPassword ? (
                        <ActivityIndicator color={Colors.black} />
                      ) : (
                        <Text style={s.modalSubmitText}>Update Password</Text>
                      )}
                    </TouchableOpacity>

                    {/* Extra space for keyboard */}
                    <View style={s.keyboardSpacer} />
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Account Modal with Keyboard Handling */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={s.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={s.modalOverlay}>
              <View style={[s.modalContent, s.deleteModalContent]}>
                <View style={s.modalHeader}>
                  <Text style={[s.modalTitle, s.deleteTitle]}>Delete Account</Text>
                  <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={s.modalScrollContent}
                >
                  <View style={s.modalBody}>
                    <View style={s.warningIcon}>
                      <Ionicons name="warning" size={48} color="#FF4444" />
                    </View>
                    <Text style={s.warningText}>
                      Are you sure you want to delete your account?
                    </Text>
                    <Text style={s.warningSubtext}>
                      This action cannot be undone. All your data will be permanently deleted.
                    </Text>
                    
                    <Text style={s.inputLabel}>
                      Type <Text style={s.deleteConfirmCode}>DELETE</Text> to confirm
                    </Text>
                    <TextInput
                      ref={deleteConfirmRef}
                      style={[s.input, s.deleteInput]}
                      placeholder="DELETE"
                      placeholderTextColor={Colors.textMuted}
                      value={deleteConfirmText}
                      onChangeText={setDeleteConfirmText}
                      autoCapitalize="characters"
                      returnKeyType="done"
                      onSubmitEditing={handleDeleteAccount}
                    />

                    <TouchableOpacity
                      style={[s.modalSubmitBtn, s.deleteBtn, deleting && s.disabledBtn]}
                      onPress={handleDeleteAccount}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={s.deleteBtnText}>Permanently Delete</Text>
                      )}
                    </TouchableOpacity>

                    {/* Extra space for keyboard */}
                    <View style={s.keyboardSpacer} />
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
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
  bannerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3D4A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  bannerSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  section: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowLabel: { color: Colors.text, fontSize: 15 },
  rowValue: { color: Colors.textSecondary, fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 16,
  },
  deleteSection: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255,68,68,0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.2)",
  },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  deleteLabel: { color: "#FF4444", fontSize: 15, fontWeight: "500" },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  deleteModalContent: {
    maxHeight: "85%",
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  deleteTitle: {
    color: "#FF4444",
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 15,
  },
  deleteInput: {
    borderColor: "#FF4444",
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  modalSubmitText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  warningIcon: {
    alignItems: "center",
    marginBottom: 16,
  },
  warningText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  warningSubtext: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  deleteConfirmCode: {
    color: "#FF4444",
    fontWeight: "700",
  },
  deleteBtn: {
    backgroundColor: "#FF4444",
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  keyboardSpacer: {
    height: Platform.OS === "ios" ? 20 : 10,
  },
});