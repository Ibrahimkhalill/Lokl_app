import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

/** Required "I agree to the Terms & Privacy Policy" checkbox for sign-up (App Store guideline 1.2). */
export function LegalAgreement({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const router = useRouter();
  return (
    <View style={s.row}>
      <TouchableOpacity
        onPress={() => onChange(!value)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value }}
        accessibilityLabel="Agree to the Terms and Conditions and Privacy Policy"
      >
        <Ionicons
          name={value ? "checkbox" : "square-outline"}
          size={22}
          color={value ? Colors.primary : Colors.textSecondary}
        />
      </TouchableOpacity>
      <Text style={s.text}>
        I agree to the{" "}
        <Text style={s.link} onPress={() => router.push("/auth/terms?doc=terms")}>Terms &amp; Conditions</Text>
        {" "}and{" "}
        <Text style={s.link} onPress={() => router.push("/auth/terms?doc=privacy")}>Privacy Policy</Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginVertical: 12 },
  text: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  link: { color: Colors.primary, fontWeight: "600" },
});
