import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, BackButton, Input, PrimaryButton } from "../../components/ui";
import { AuthHeaderBlock } from "../../components/auth";
import { Colors } from "../../constants/colors";

export default function ResetPassword() {
  const router = useRouter();
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <Screen>
      <BackButton onPress={() => router.back()} />

      <AuthHeaderBlock
        title="Reset Password"
        subtitle="Enter you new password here"
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
      />

      <View style={styles.form}>
        <Input
          label="New Password"
          placeholder="Enter New password"
          isPassword
          value={newPass}
          onChangeText={setNewPass}
        />
        <Input
          label="Confirm Password"
          placeholder="Enter password"
          isPassword
          value={confirm}
          onChangeText={setConfirm}
        />
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title="Next"
          onPress={() => router.push("/auth/sign-in")}
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
