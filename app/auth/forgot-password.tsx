import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, BackButton, Input, PrimaryButton } from "../../components/ui";
import { AuthHeaderBlock } from "../../components/auth";
import { Colors } from "../../constants/colors";

export default function ForgotPassword() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

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
