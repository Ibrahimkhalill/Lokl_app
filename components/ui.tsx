/**
 * Legacy barrel — re-exports primitives + auth-specific widgets.
 * Prefer importing from `components/primitives` in new code.
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";
import GoogleIcon from "../assets/icons/google.svg";
import AppleIcon from "../assets/icons/apple.svg";
import LogoIcon from "../assets/icons/logo.svg";

export {
  PrimaryButton,
  AppPrimaryButton,
  AppOutlineButton,
  BackButton,
  Screen,
  Input,
  FormField,
  AppTextInput,
  AppHeader,
  AppHeaderIconButton,
  MediaPickerCard,
  SelectRow,
  InputRow,
} from "./primitives";

export type {
  AppPrimaryButtonProps,
  BackButtonProps,
  ScreenProps,
  InputProps,
  FormFieldProps,
  AppTextInputProps,
  AppHeaderProps,
  MediaPickerCardProps,
  SelectRowProps,
  InputRowProps,
} from "./primitives";

// ─── Logo ───────────────────────────────────────────────────────────────────
export function LogoText() {
  return (
    <View style={logoStyles.container}>
      <LogoIcon />
    </View>
  );
}

const logoStyles = StyleSheet.create({
  container: { marginBottom: 32 },
});

// ─── Divider ───────────────────────────────────────────────────────────────
export function OrDivider() {
  return (
    <View style={divStyles.container}>
      <View style={divStyles.line} />
      <Text style={divStyles.text}>Or continue With</Text>
      <View style={divStyles.line} />
    </View>
  );
}

const divStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.cardBorder },
  text: { color: Colors.textSecondary, fontSize: 13 },
});

// ─── Social Buttons ─────────────────────────────────────────────────────────
export function SocialButtons() {
  return (
    <View style={socialStyles.container}>
      <TouchableOpacity style={socialStyles.btn} activeOpacity={0.8}>
        <GoogleIcon width={20} height={20} />
        <Text style={socialStyles.socialText}>Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={socialStyles.btn} activeOpacity={0.8}>
        <AppleIcon width={20} height={20} />
        <Text style={socialStyles.socialText}>Apple</Text>
      </TouchableOpacity>
    </View>
  );
}

const socialStyles = StyleSheet.create({
  container: { flexDirection: "row", gap: 12 },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  socialText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: "600",
  },
});
