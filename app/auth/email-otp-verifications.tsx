import React from "react";
import { useRouter } from "expo-router";
import { OtpVerificationForm } from "../../components/auth";

export default function EmailOTPVerifications() {
  const router = useRouter();

  return (
    <OtpVerificationForm
      title="Phone Verification"
      subtitle="Enter your OTP code here"
      onBack={() => router.back()}
      onVerify={() => router.push("/(tabs)")}
    />
  );
}
