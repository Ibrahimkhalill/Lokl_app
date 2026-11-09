/**
 * Legacy barrel — re-exports primitives + auth-specific widgets.
 * Prefer importing from `components/primitives` in new code.
 */
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import { getErrorMessage } from "../lib/api";
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
  PhoneInput,
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
      <Text style={divStyles.text}>Or continue with</Text>
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
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function signInWithApple() {
    if (busy) return;
    try {
      const AppleAuthentication = await import("expo-apple-authentication");
      if (!(await AppleAuthentication.isAvailableAsync())) {
        showToast({ type: "info", title: "Not available", message: "Sign in with Apple is not available on this device." });
        return;
      }
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!cred.identityToken) throw new Error("No identity token");
      setBusy(true);
      // Apple only sends the name the first time, so pass it along now
      const name = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(" ");
      const res = await authService.socialLogin({ provider: "apple", id_token: cred.identityToken, name: name || undefined });
      const { accessToken, refreshToken, user } = res.data.data;
      await login(accessToken, refreshToken, user);
      router.replace("/(tabs)");
    } catch (e: any) {
      if (e?.code === "ERR_REQUEST_CANCELED") return; // the person closed the Apple sheet
      showToast({ type: "error", title: "Sign in failed", message: getErrorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  function signInWithGoogle() {
    showToast({ type: "info", title: "Coming soon", message: "Sign in with Google will be available in the next update." });
  }

  return (
    <View style={socialStyles.container}>
      <TouchableOpacity style={socialStyles.btn} activeOpacity={0.8} onPress={signInWithGoogle}>
        <View style={socialStyles.iconBox}>
          <GoogleIcon width={20} height={20} />
        </View>
        <Text style={socialStyles.socialText}>Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={socialStyles.btn} activeOpacity={0.8} onPress={signInWithApple} disabled={busy}>
        <View style={socialStyles.iconBox}>
          <AppleIcon width={18} height={20} color="#000000" />
        </View>
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
  iconBox: { width: 22, height: 22, alignItems: "center", justifyContent: "center" },
  socialText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: "600",
  },
});
