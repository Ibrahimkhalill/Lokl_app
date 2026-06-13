import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "../../components/ui";
import { AuthHeaderBlock } from "../../components/auth";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../services/authService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const OPTIONS = [
  "Classes & Training",
  "Courts and Fields",
  "Trainer",
  "Community & Events",
  "Studios and Gyms",
];

export default function WhatLookingFor() {
  const router = useRouter();
  const { showToast } = useToast();
  const { sports } = useLocalSearchParams<{ sports: string }>();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  async function handleContinue() {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const sportsInterests: string[] = sports ? JSON.parse(sports) : [];
      await authService.savePreferences({
        sports_interests: sportsInterests,
        looking_for: selected,
      });
      router.replace("/auth/location");
    } catch (err) {
      showToast({ type: "error", title: "Error", message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <AuthHeaderBlock
          title="WHAT ARE YOU LOOKING FOR?"
          subtitle="Help us personalize your experience"
          containerStyle={styles.top}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
        />

        <View style={styles.options}>
          {OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.optionBtn, isSelected && styles.optionSelected]}
                onPress={() => toggle(opt)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title={
              loading
                ? "Saving..."
                : `Continue (${selected.length} Selected)`
            }
            onPress={handleContinue}
            disabled={selected.length === 0 || loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  top: { marginBottom: 32 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  options: { gap: 12 },
  optionBtn: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "rgba(31, 42, 68, 0.4)",
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(209,255,0,0.05)",
  },
  optionText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  optionTextSelected: {
    fontWeight: "600",
  },
  bottom: { marginTop: "auto" },
});
