import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

type AvatarProps = {
  uri?: string | null;
  size?: number;
  borderWidth?: number;
};

export function Avatar({ uri, size = 48, borderWidth = 2.5 }: AvatarProps) {
  const radius = size / 2;
  const outerRadius = (size + borderWidth * 2) / 2;

  return (
    <View
      style={[
        styles.container,
        {
          width: size + borderWidth * 2,
          height: size + borderWidth * 2,
          borderRadius: outerRadius,
        },
      ]}
    >
      <LinearGradient
        colors={["#0077FF", "#F635DD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            width: size + borderWidth * 2,
            height: size + borderWidth * 2,
            borderRadius: outerRadius,
          },
        ]}
      />
      <View
        style={[
          styles.inner,
          {
            width: size,
            height: size,
            borderRadius: radius,
            position: "absolute",
            top: borderWidth,
            left: borderWidth,
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: radius }}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size, borderRadius: radius },
            ]}
          >
            <Ionicons name="person" size={size * 0.45} color={Colors.textSecondary} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  inner: {
    overflow: "hidden",
    backgroundColor: Colors.card, // or any background color you prefer
  },
  placeholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
});