import React from "react";
import { View, Text, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Colors } from "../../constants/colors";

export interface AuthHeaderBlockProps {
  title: string;
  subtitle?: string;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

export function AuthHeaderBlock({
  title,
  subtitle,
  titleStyle,
  subtitleStyle,
  containerStyle,
}: AuthHeaderBlockProps) {
  return (
    <View style={[styles.top, containerStyle]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
