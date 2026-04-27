import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Colors } from "../../constants/colors";

export interface AppHeaderProps {
  title: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

/** Simple header row: optional left / centered title / optional right */
export function AppHeader({
  title,
  leftSlot,
  rightSlot,
  style,
  titleStyle,
}: AppHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.side}>{leftSlot}</View>
      <Text style={[styles.title, titleStyle]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  );
}

export function AppHeaderIconButton({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      style={[styles.iconBtn, style]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    minHeight: 52,
  },
  side: {
    width: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
});
