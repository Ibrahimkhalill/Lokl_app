import React from "react";
import { useRouter } from "expo-router";
import { OtpVerificationForm } from "../../components/auth";

export default function EmailOTPVerifications() {
  const router = useRouter();

  return (
    <OtpVerificationForm
      title="Email Verification"
      subtitle="Enter your email verification code here"
      onBack={() => router.back()}
      onVerify={() => router.push("/auth/what-are-you-into")}
    />
  );
}
