import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Screen,
  LogoText,
  Input,
  PrimaryButton,
  OrDivider,
  SocialButtons,
} from "../../components/ui";
import { Colors } from "../../constants/colors";

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <Screen scrollable>
      <LogoText />

      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>join the LOKL community today</Text>

      <Input
        label="Username"
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Input
        label="Full Name"
        placeholder="Enter full name"
        value={fullName}
        onChangeText={setFullName}
      />
      <Input
        label="Date of Birthday"
        placeholder="Enter Birthday date"
        value={dob}
        onChangeText={setDob}
        keyboardType="numeric"
      />
      <Input
        label="Phone Number"
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Input
        label="Password"
        placeholder="Create a password"
        isPassword
        value={password}
        onChangeText={setPassword}
      />

      {/* Remember Me */}
      <TouchableOpacity
        style={styles.rememberRow}
        onPress={() => setRememberMe(!rememberMe)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
          {rememberMe && (
            <Ionicons name="checkmark" size={12} color={Colors.black} />
          )}
        </View>
        <Text style={styles.rememberText}>Remember Me</Text>
      </TouchableOpacity>

      <PrimaryButton
        title="Sign Up"
        onPress={() => router.push("/auth/email-otp-verifications")}
      />

      <OrDivider />
      <SocialButtons />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/auth/sign-in")}>
          <Text style={styles.footerLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
    marginTop: -4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.inputBg,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
