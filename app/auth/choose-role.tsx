import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, PrimaryButton } from "../../components/ui";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

type Role = "personal" | "business" | "community" | null;

export default function ChooseRole() {
  const router = useRouter();
  const [selected, setSelected] = useState<Role>("personal");

  const roles = [
    {
      id: "personal" as Role,
      title: "Personal Account",
      subtitle: "Join as an athlete or sports enthusiast",
      icon: "person-outline" as const,
    },
    {
      id: "business" as Role,
      title: "Business Account",
      subtitle: "Coach, Trainer, and other role.",
      icon: "business-outline" as const,
    },
  ];

  const handleContinue = () => {
    if (selected === "business") {
      router.push("/auth/business-signup");
    } else {
      router.push("/auth/sign-up");
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.top}>
        <Text style={styles.title}>CHOOSE YOUR ROLE</Text>
        <Text style={styles.subtitle}>
          Choose your account type to get started
        </Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.cards}>
          {roles.map((role) => {
            const isSelected = selected === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(role.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconWrap,
                    isSelected && styles.iconWrapSelected,
                  ]}
                >
                  <Ionicons
                    name={role.icon}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                  />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{role.title}</Text>
                  <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  top: {
    marginBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  middle: {
    flex: 1,
    justifyContent: "center",
  },
  cards: {
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(209,255,0,0.05)",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.iconBg,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapSelected: {
    backgroundColor: "rgba(209,255,0,0.12)",
  },
  cardText: { flex: 1 },
  cardTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  bottom: {
    marginTop: "auto",
  },
});
