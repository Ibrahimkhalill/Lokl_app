import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen, BackButton, Input, PrimaryButton } from "../../components/ui";
import { AuthHeaderBlock } from "../../components/auth";
import { Colors } from "../../constants/colors";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function ResetPassword() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user_id, secret_key } = useLocalSearchParams<{
    user_id: string;
    secret_key: string;
  }>();
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!newPass.trim() || !confirm.trim()) {
      showToast({ type: "error", title: "Error", message: "Please fill in both fields." });
      return;
    }
    if (newPass !== confirm) {
      showToast({ type: "error", title: "Error", message: "Passwords do not match." });
      return;
    }
    if (!user_id || !secret_key) {
      showToast({ type: "error", title: "Error", message: "Invalid reset session. Please start over." });
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({
        user_id: Number(user_id),
        secret_key,
        new_password: newPass,
        confirm_password: confirm,
      });
      showToast({ type: "success", title: "Success", message: "Password reset successfully." });
      router.replace("/auth/sign-in");
    } catch (err) {
      showToast({ type: "error", title: "Error", message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BackButton onPress={() => router.back()} />

      <AuthHeaderBlock
        title="Reset Password"
        subtitle="Enter your new password here"
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
      />

      <View style={styles.form}>
        <Input
          label="New Password"
          placeholder="Enter new password"
          isPassword
          value={newPass}
          onChangeText={setNewPass}
        />
        <Input
          label="Confirm Password"
          placeholder="Re-enter password"
          isPassword
          value={confirm}
          onChangeText={setConfirm}
        />
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title={loading ? "Resetting..." : "Reset Password"}
          onPress={handleReset}
          disabled={loading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  form: { flex: 1 },
  bottom: { paddingBottom: 8 },
});
