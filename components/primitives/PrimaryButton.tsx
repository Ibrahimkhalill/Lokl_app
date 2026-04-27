import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export interface AppPrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
  style?: object;
}

/** Primary / outline CTA — same visuals as legacy PrimaryButton */
export function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = "primary",
  style,
}: AppPrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.btn,
        variant === "outline" && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[styles.text, variant === "outline" && styles.outlineText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/** Alias for new code — identical to PrimaryButton */
export const AppPrimaryButton = PrimaryButton;

export function AppOutlineButton({
  title,
  onPress,
  disabled,
  style,
}: Omit<AppPrimaryButtonProps, "variant">) {
  return (
    <PrimaryButton
      title={title}
      onPress={onPress}
      disabled={disabled}
      variant="outline"
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
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
