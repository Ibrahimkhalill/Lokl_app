import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export interface AuthFooterLinkRowProps {
  prefixText: string;
  linkText: string;
  onPress: () => void;
  marginTop?: number;
}

export function AuthFooterLinkRow({
  prefixText,
  linkText,
  onPress,
  marginTop = 20,
}: AuthFooterLinkRowProps) {
  return (
    <View style={[styles.footer, { marginTop }]}>
      <Text style={styles.footerText}>{prefixText}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.footerLink}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
