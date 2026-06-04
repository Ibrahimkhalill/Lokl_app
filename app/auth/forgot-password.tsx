import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, BackButton, PhoneInput, PrimaryButton } from "../../components/ui";
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

  async function handleNext() {
    if (!formattedPhone) {
      showToast({ type: "error", title: "Error", message: "Please enter your phone number." });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ phone: formattedPhone });
      const userId: number = res.data.data?.user_id;
      router.push({
        pathname: "/auth/otp",
        params: { user_id: String(userId) },
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
        title="Forget Password"
        subtitle={
          "Enter your address to receive a reset link and regain\naccess to your account."
        }
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
      />

      <View style={styles.form}>
        <PhoneInput
          value={phone}
          onChangeText={setPhone}
          onChangeFormattedText={setFormattedPhone}
        />
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
