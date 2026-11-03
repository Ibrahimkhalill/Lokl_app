import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { OtpVerificationForm } from "../../components/auth";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function EmailOTPVerifications() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(otp: string) {
    if (!user_id) {
      showToast({ type: "error", title: "Error", message: "Missing user ID. Please sign up again." });
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await authService.verifyPhone({
        user_id: Number(user_id),
        otp,
      });
      const { accessToken, refreshToken, user } = res.data.data;
      await login(accessToken, refreshToken, user);

      if (user.role?.toLowerCase() === "business") {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/what-are-you-into");
      }

    
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!user_id) return;
    setError(null);
    try {
      await authService.resendCode({ user_id: Number(user_id), purpose: "signup" });
      showToast({ type: "success", title: "Code sent", message: "We sent you a new code. The old one no longer works." });
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }

  return (
    <OtpVerificationForm
      title="Phone Verification"
      subtitle="Enter your OTP code here"
      onBack={() => router.back()}
      onVerify={handleVerify}
      onResend={handleResend}
      loading={loading}
      error={error}
    />
  );
}
