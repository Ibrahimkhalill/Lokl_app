import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { PrimaryButton } from '../../components/ui';
import { Colors } from '../../constants/colors';

const OTP_LENGTH = 6;

export default function OTP() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d.length === 1);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>Phone Verification</Text>
          <Text style={styles.subtitle}>Enter your OTP code here</Text>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text.slice(-1), index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={Colors.primary}
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't you received any code? </Text>
          <TouchableOpacity>
            <Text style={styles.resendLink}>Resent</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title="Verify"
            onPress={() => router.push('/auth/reset-password')}
            disabled={!isComplete}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  top: {
    marginBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '700',
    maxWidth: 52,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(209,255,0,0.08)',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  resendText: { color: Colors.textSecondary, fontSize: 14 },
  resendLink: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  bottom: {
    marginTop: 'auto',
  },
});
