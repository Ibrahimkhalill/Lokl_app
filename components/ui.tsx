import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import GoogleIcon from "../assets/icons/google.svg";
import AppleIcon from "../assets/icons/apple.svg";
import LogoIcon from "../assets/icons/logo.svg";

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
  text: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -1,
  },
});

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends TextInputProps {
  label?: string;
  /** Ionicons name (used when `leftSlot` is not provided) */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Custom left icon (e.g. SVG); takes precedence over `leftIcon` */
  leftSlot?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({
  label,
  leftIcon,
  leftSlot,
  isPassword,
  style,
  ...props
}: InputProps) {
  const [secure, setSecure] = useState(isPassword ?? false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={inputStyles.wrapper}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      <View
        style={[
          inputStyles.inputContainer,
          focused && inputStyles.inputContainerFocused,
        ]}
      >
        {leftSlot ? (
          <View style={inputStyles.leftIcon}>{leftSlot}</View>
        ) : (
          leftIcon && (
            <Ionicons
              name={leftIcon}
              size={18}
              color={Colors.textSecondary}
              style={inputStyles.leftIcon}
            />
          )
        )}
        <TextInput
          style={[inputStyles.input, style]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setSecure(!secure)}
            style={inputStyles.eyeBtn}
          >
            <Ionicons
              name={secure ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    height: 52,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
  },
  leftIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  eyeBtn: { padding: 4 },
});

// ─── Primary Button ──────────────────────────────────────────────────────────
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
  style?: object;
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = "primary",
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        btnStyles.btn,
        variant === "outline" && btnStyles.outline,
        disabled && btnStyles.disabled,
        style,
      ]}
    >
      <Text
        style={[btnStyles.text, variant === "outline" && btnStyles.outlineText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const btnStyles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  disabled: { opacity: 0.5 },
  text: {
    color: Colors.black,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  outlineText: {
    color: Colors.text,
    fontWeight: "600",
  },
});

// ─── Divider ─────────────────────────────────────────────────────────────────
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

// ─── Social Buttons ──────────────────────────────────────────────────────────
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
  googleG: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
  },
  socialText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: "600",
  },
});

// ─── Back Button ─────────────────────────────────────────────────────────────
interface BackBtnProps {
  onPress: () => void;
}

export function BackButton({ onPress }: BackBtnProps) {
  return (
    <TouchableOpacity
      style={backStyles.btn}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={22} color={Colors.text} />
    </TouchableOpacity>
  );
}

const backStyles = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
});

// ─── Screen Wrapper ──────────────────────────────────────────────────────────
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: object;
}

export function Screen({ children, scrollable = false, style }: ScreenProps) {
  const content = <View style={[screenStyles.inner, style]}>{children}</View>;

  if (scrollable) {
    return (
      <SafeAreaView style={screenStyles.safe}>
        <ScrollView
          contentContainerStyle={screenStyles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={screenStyles.safe}>{content}</SafeAreaView>;
}

const screenStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 0,
  },
  scroll: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 40,
  },
});
