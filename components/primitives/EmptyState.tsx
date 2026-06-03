import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

type EmptyStateProps = {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon = "file-tray-outline", title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon as any} size={32} color={Colors.primary} />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {!!action && (
        <TouchableOpacity style={styles.btn} onPress={action.onPress} activeOpacity={0.8}>
          <Text style={styles.btnText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 12,
  },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(209,255,0,0.07)",
    borderWidth: 1,
    borderColor: "rgba(209,255,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  btnText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "700",
  },
});
