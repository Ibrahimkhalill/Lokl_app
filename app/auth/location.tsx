import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { PrimaryButton, Screen } from "../../components/ui";
import { Colors } from "../../constants/colors";
import LocationIcon from "../../assets/icons/locations.svg";
import { useToast } from "../../context/ToastContext";

export default function LocationScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleEnableLocation() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showToast({ type: "info", title: "Permission Denied", message: "Location permission is needed to show venues near you. You can enable it later in Settings." });
        router.replace("/(tabs)");
        return;
      }
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.center}>
          <LocationIcon width={70} height={70} color={Colors.text} />

          <Text style={styles.title}>FIND VENUES{"\n"}NEAR YOU</Text>
          <Text style={styles.subtitle}>
            we&apos;ll show you the best spots based on your location
          </Text>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title={loading ? "Requesting..." : "Enable Location"}
            onPress={handleEnableLocation}
            disabled={loading}
          />
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  iconWrap: {
    borderWidth: 2,
    borderColor: Colors.text,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 260,
  },
  bottom: { gap: 12 },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    color: Colors.text,
    fontSize: 15,
    textDecorationLine: "underline",
  },
});
