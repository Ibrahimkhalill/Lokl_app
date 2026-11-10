/**
 * Legacy barrel — re-exports primitives + auth-specific widgets.
 * Prefer importing from `components/primitives` in new code.
 */
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from "react-native";
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
const GOOGLE_IOS_CLIENT_ID = "59478352282-39un0a44hoehovgogqpmilq2vlfm1iup.apps.googleusercontent.com";

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

  async function signInWithGoogle() {
    if (busy) return;
    try {
      // Loaded on tap: older app builds without the native module get a clear message instead of a crash.
      const { GoogleSignin } = await import("@react-native-google-signin/google-signin");
      GoogleSignin.configure({ iosClientId: GOOGLE_IOS_CLIENT_ID });
      await GoogleSignin.hasPlayServices();
      const result: any = await GoogleSignin.signIn();
      if (result?.type === "cancelled") return; // the person closed the Google sheet
      const idToken = result?.data?.idToken;
      if (!idToken) throw new Error("No identity token");
      setBusy(true);
      const res = await authService.socialLogin({ provider: "google", id_token: idToken, name: result?.data?.user?.name || undefined });
      const { accessToken, refreshToken, user } = res.data.data;
      await login(accessToken, refreshToken, user);
      router.replace("/(tabs)");
    } catch (e: any) {
      if (e?.code === "SIGN_IN_CANCELLED" || e?.code === "-5") return;
      const missing = /RNGoogleSignin|TurboModule|NativeModule|Cannot find module/i.test(String(e?.message));
      showToast({
        type: "error",
        title: "Sign in failed",
        message: missing ? "Please update the app to use Google sign-in." : getErrorMessage(e),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={socialStyles.container}>
      <Modal visible={busy} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ color: Colors.text, marginTop: 12, fontSize: 14 }}>Signing you in...</Text>
        </View>
      </Modal>
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
