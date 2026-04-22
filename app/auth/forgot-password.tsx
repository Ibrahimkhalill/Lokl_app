import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, BackButton, Input, PrimaryButton } from "../../components/ui";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  return (
    <Screen>
      <BackButton onPress={() => router.back()} />

      <Text style={styles.title}>Forget Password</Text>
      <Text style={styles.subtitle}>
        Enter your address to receive a reset link and regain{"\n"}access to
        your account.
      </Text>

      <View style={styles.form}>
        <Input
          label="Phone Number"
          placeholder="Enter Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.bottom}>
        <PrimaryButton title="Next" onPress={() => router.push("/auth/otp")} />
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
