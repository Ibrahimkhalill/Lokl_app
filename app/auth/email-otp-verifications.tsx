import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { OtpVerificationForm } from "../../components/auth";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/api";

export default function EmailOTPVerifications() {
  const router = useRouter();
  const { login } = useAuth();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(otp: string) {
    if (!user_id) {
      Alert.alert("Error", "Missing user ID. Please sign up again.");
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
      
      if (user.role ==="business") {
         router.replace("/(tabs)");
      }
      else{
        router.replace("/auth/what-are-you-into");
      }

    
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    // Re-use the register flow is not ideal; typically there's a resend endpoint.
    // For now just show a message.
    Alert.alert("Resend OTP", "Please go back and try registering again if you didn't receive your code.");
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
