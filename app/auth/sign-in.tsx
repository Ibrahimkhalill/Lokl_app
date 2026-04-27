import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  LogoText,
  Input,
  PrimaryButton,
  OrDivider,
  SocialButtons,
} from "../../components/ui";
import { AuthHeaderBlock, AuthFooterLinkRow } from "../../components/auth";
import { Colors } from "../../constants/colors";

export default function SignIn() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Screen scrollable>
      <LogoText />

      <AuthHeaderBlock title="Sign In" subtitle="Hi welcome back" />

      <View>
        <Input
          label="Phone Number"
          placeholder="Enter  number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Input
          label="Password"
          placeholder="Enter password"
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() => router.push("/auth/forgot-password")}
        >
          <Text style={styles.forgotText}>Forget Password?</Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton title="Sign In" onPress={() => router.push("/(tabs)")} />

      <OrDivider />
      <SocialButtons />

      <AuthFooterLinkRow
        prefixText="Already have an account? "
        linkText="Sign Up"
        onPress={() => router.push("/auth/sign-up")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  forgotBtn: { alignSelf: "flex-end", marginTop: 4, marginBottom: 8 },
  forgotText: {
    color: Colors.text,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
