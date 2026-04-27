import React, { useState, useRef } from "react";
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
  onVerify: () => void;
  onBack: () => void;
  resendLinkText?: string;
}

export function OtpVerificationForm({
  title,
  subtitle,
  length = 6,
  ctaTitle = "Verify",
  onVerify,
  onBack,
  resendLinkText = "Resent",
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
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
              onChangeText={(text) => handleChange(text.slice(-1), index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={Colors.primary}
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn&apos;t you received any code? </Text>
          <TouchableOpacity>
            <Text style={styles.resendLink}>{resendLinkText}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title={ctaTitle}
            onPress={onVerify}
            disabled={!isComplete}
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
    paddingBottom: 32,
  },
  top: {
    marginBottom: 48,
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
  bottom: {
    marginTop: "auto",
  },
});
