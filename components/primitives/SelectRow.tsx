import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Colors } from "../../constants/colors";

export interface SelectRowProps {
  leftSlot?: React.ReactNode;
  value?: string;
  placeholder?: string;
  rightSlot?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

/** Tappable row matching business-signup dropdown row */
export function SelectRow({
  leftSlot,
  value,
  placeholder,
  rightSlot,
  onPress,
  style,
}: SelectRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, styles.rowHeight, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {leftSlot ? <View style={styles.left}>{leftSlot}</View> : null}
      <Text
        style={[styles.text, !value && styles.placeholder]}
        numberOfLines={1}
      >
        {value || placeholder || ""}
      </Text>
      {rightSlot}
    </TouchableOpacity>
  );
}

export interface InputRowProps extends Omit<TextInputProps, "style"> {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps["style"];
}

/** Row with icon + inline TextInput (social link rows) */
export function InputRow({
  leftSlot,
  rightSlot,
  containerStyle,
  inputStyle,
  ...inputProps
}: InputRowProps) {
  return (
    <View style={[styles.row, styles.rowHeight, containerStyle]}>
      {leftSlot ? <View style={styles.left}>{leftSlot}</View> : null}
      <TextInput
        style={[styles.inlineInput, inputStyle]}
        placeholderTextColor={Colors.textMuted}
        {...inputProps}
      />
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 16,
    gap: 8,
  },
  rowHeight: { minHeight: 52 },
  left: { marginRight: 2 },
  text: { flex: 1, color: Colors.text, fontSize: 15 },
  placeholder: { color: Colors.textMuted },
  inlineInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    paddingVertical: 12,
  },
});
