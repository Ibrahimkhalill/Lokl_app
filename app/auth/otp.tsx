import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { OtpVerificationForm } from "../../components/auth";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function OTP() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(otp: string) {
    if (!user_id) {
      showToast({ type: "error", title: "Error", message: "Missing user ID. Please start over." });
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await authService.verifyResetCode({
        user_id: Number(user_id),
        verification_code: otp,
      });
      const secretKey: string = res.data.data.secret_key;
      router.push({
        pathname: "/auth/reset-password",
        params: { user_id, secret_key: secretKey },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <OtpVerificationForm
      title="Phone Verification"
      subtitle="Enter your OTP code here"
      onBack={() => router.back()}
      onVerify={handleVerify}
      loading={loading}
      error={error}
    />
  );
}
