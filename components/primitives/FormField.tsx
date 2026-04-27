import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Colors } from "../../constants/colors";

export interface FormFieldProps {
  label?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

/** Label + field wrapper — spacing matches legacy Input label */
export function FormField({ label, children, style, labelStyle }: FormFieldProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
});
