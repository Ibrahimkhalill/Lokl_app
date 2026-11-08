import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, BackButton, Input, PhoneInput, PrimaryButton } from "../../components/ui";
import { AuthHeaderBlock } from "../../components/auth";
import { Colors } from "../../constants/colors";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function ForgotPassword() {
  const router = useRouter();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [email, setEmail] = useState("");

  async function handleNext() {
    const byEmail = mode === "email";
    if (byEmail ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) : !formattedPhone) {
      showToast({
        type: "error",
        title: "Error",
        message: byEmail ? "Please enter a valid email address." : "Please enter your phone number.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(byEmail ? { email: email.trim() } : { phone: formattedPhone });
      const userId: number | undefined = res.data?.data?.user_id;
      if (!userId) {
        // Backend doesn't reveal whether the number is registered; there's nothing to verify.
        showToast({
          type: "info",
          title: byEmail ? "Check your email" : "Check your phone",
          message: res.data?.message ?? "If an account exists, a code has been sent.",
        });
        return;
      }
      router.push({
        pathname: "/auth/otp",
        params: { user_id: String(userId), ...(byEmail ? { via: "email" } : {}) },
      });
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
        title="Forgot Password"
        subtitle={
          mode === "email"
            ? "Enter your email address to receive a verification code and regain\naccess to your account."
            : "Enter your phone number to receive a verification code and regain\naccess to your account."
        }
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
      />

      <View style={styles.form}>
        {mode === "phone" ? (
          <PhoneInput
            value={phone}
            onChangeText={setPhone}
            onChangeFormattedText={setFormattedPhone}
          />
        ) : (
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
        <TouchableOpacity onPress={() => setMode((m) => (m === "phone" ? "email" : "phone"))} style={{ marginTop: 14 }}>
          <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "600" }}>
            {mode === "phone" ? "Use my email instead" : "Use my phone number instead"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title={loading ? "Sending..." : "Next"}
          onPress={handleNext}
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
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  form: { flex: 1 },
  bottom: {
    paddingBottom: 8,
  },
});
