import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { BackButton, PrimaryButton, Screen } from "../ui";
import { Colors } from "../../constants/colors";

export interface OtpVerificationFormProps {
  title: string;
  subtitle: string;
  length?: number;
  ctaTitle?: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  onResend?: () => void | Promise<unknown>;
  resendLinkText?: string;
  loading?: boolean;
  error?: string | null;
}

export function OtpVerificationForm({
  title,
  subtitle,
  length = 6,
  ctaTitle = "Verify",
  onVerify,
  onBack,
  onResend,
  resendLinkText = "Resend",
  loading = false,
  error = null,
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(TextInput | null)[]>([]);

  const [cooldown, setCooldown] = useState(30);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, "");
    // iOS SMS autofill / paste delivers the whole code at once: spread it over the boxes.
    if (digits.length > 1) {
      const filled = digits.slice(0, length).split("");
      setOtp(Array.from({ length }, (_, i) => filled[i] ?? ""));
      inputs.current[Math.min(filled.length, length - 1)]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = digits;
    setOtp(newOtp);
    if (digits && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!onResend || resending || cooldown > 0) return;
    setResending(true);
    try {
      await onResend();
      setOtp(Array(length).fill(""));
      inputs.current[0]?.focus();
      setCooldown(30);
    } finally {
      setResending(false);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d.length === 1);

  return (
    <Screen>
      <BackButton onPress={onBack} />
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={index === 0 ? length : 1}
              textAlign="center"
              selectionColor={Colors.primary}
              editable={!loading}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>
            Didn&apos;t get a code?{" "}
          </Text>
          <TouchableOpacity onPress={handleResend} disabled={loading || resending || cooldown > 0}>
            <Text style={[styles.resendLink, cooldown > 0 || resending ? { opacity: 0.5 } : null]}>
              {resending ? "Sending..." : cooldown > 0 ? `${resendLinkText} (${cooldown}s)` : resendLinkText}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title={loading ? "Verifying..." : ctaTitle}
            onPress={() => onVerify(otp.join(""))}
            disabled={!isComplete || loading}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 24,
  },
  top: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.inputBg,
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
    maxWidth: 52,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(209,255,0,0.08)",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  resendText: { color: Colors.textSecondary, fontSize: 14 },
  resendLink: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: "#FF4D4F",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
  bottom: {
    marginTop: 32,
  },
});
