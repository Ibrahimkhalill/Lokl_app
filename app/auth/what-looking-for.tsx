import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { PrimaryButton } from "../../components/ui";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const OPTIONS = [
  "Classes & Training",
  "Courts & Facilities",
  "Trainer",
  "Community & Events",
  "Solo Workouts",
];

export default function WhatLookingFor() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([
    "Classes & Training",
    "Courts & Facilities",
    "Trainer",
  ]);

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>WHAT ARE YOU LOOKING FOR?</Text>
          <Text style={styles.subtitle}>
            Help us personalize your experience
          </Text>
        </View>

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
            title={`Continue (${selected.length} Selected)`}
            onPress={() => router.push("/auth/location")}
            disabled={selected.length === 0}
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
    backgroundColor: Colors.card,
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
