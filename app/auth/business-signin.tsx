import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, LogoText, Input, PrimaryButton } from "../../components/ui";
import { AuthHeaderBlock, AuthFooterLinkRow } from "../../components/auth";
import { Colors } from "../../constants/colors";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function BusinessSignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!identifier.trim() || !password.trim()) {
      showToast({ type: "error", title: "Error", message: "Please enter your email or phone number and password." });
      return;
    }
    setLoading(true);
    try {
      const isEmail = identifier.includes("@");
      const payload = isEmail
        ? { email: identifier.trim(), password }
        : { phone: identifier.trim(), password };
      const res = await authService.login(payload);
      const { accessToken, refreshToken, user } = res.data.data;
      await login(accessToken, refreshToken, user);
      router.replace("/(tabs)");
    } catch (err) {
      showToast({ type: "error", title: "Sign In Failed", message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scrollable>
      <LogoText />

      <AuthHeaderBlock title="Business Sign In" subtitle="Welcome back to your business account" />

      <View>
        <Input
          label=" Phone number"
          placeholder="+1 (XXX) XXX-XXXX"
          keyboardType="phone-pad"
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <Input
          label="Password"
          placeholder="Enter password"
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() => router.push("/auth/forgot-password")}
        >
          <Text style={styles.forgotText}>Forget Password?</Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton
        title={loading ? "Signing in..." : "Sign In"}
        onPress={handleSignIn}
        disabled={loading}
      />

      <AuthFooterLinkRow
        prefixText="Don't have an account? "
        linkText="Sign Up"
        onPress={() => router.push("/auth/business-signup")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  forgotBtn: { alignSelf: "flex-end", marginTop: 4, marginBottom: 8 },
  forgotText: {
    color: Colors.text,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
