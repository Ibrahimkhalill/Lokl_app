import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  LogoText,
  Input,
  PhoneInput,
  PrimaryButton,
  OrDivider,
  SocialButtons,
} from "../../components/ui";
import { AuthHeaderBlock, AuthFooterLinkRow } from "../../components/auth";
import { Colors } from "../../constants/colors";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/api";

export default function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!formattedPhone || !password.trim()) {
      Alert.alert("Error", "Please enter your phone number and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login({ phone: formattedPhone, password });
      const { accessToken, refreshToken, user } = res.data.data;
      await login(accessToken, refreshToken, user);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Sign In Failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scrollable>
      <LogoText />

      <AuthHeaderBlock title="Sign In" subtitle="Hi welcome back" />

      <View>
        <PhoneInput
          value={phone}
          onChangeText={setPhone}
          onChangeFormattedText={setFormattedPhone}
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

      <OrDivider />
      <SocialButtons />

      <AuthFooterLinkRow
        prefixText="Already have an account? "
        linkText="Sign Up"
        onPress={() => router.push("/auth/sign-up")}
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
