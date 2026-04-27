import React from "react";
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Colors } from "../../constants/colors";

export interface AppTextInputProps extends TextInputProps {
  /** Card-style field (default) vs minimal */
  variant?: "card" | "plain";
  containerStyle?: StyleProp<ViewStyle>;
}

/** Standalone text field matching app card inputs (create-event / edit-profile) */
export function AppTextInput({
  variant = "card",
  style,
  containerStyle,
  ...props
}: AppTextInputProps) {
  return (
    <TextInput
      style={[
        variant === "card" ? styles.card : styles.plain,
        style,
      ]}
      placeholderTextColor={Colors.textMuted}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 15,
  },
  plain: {
    color: Colors.text,
    fontSize: 15,
  },
});
