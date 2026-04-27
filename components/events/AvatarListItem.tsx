import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

export interface AvatarListItemProps {
  avatarUri: string;
  title: string;
  /** Secondary line (e.g. location) */
  subtitle?: string;
  /** When true, show location icon before subtitle */
  subtitleLocationIcon?: boolean;
  /** Right column (e.g. time) */
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
  avatarSize?: number;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

export function AvatarListItem({
  avatarUri,
  title,
  subtitle,
  subtitleLocationIcon,
  rightSlot,
  style,
  avatarSize = 46,
  titleStyle,
  subtitleStyle,
}: AvatarListItemProps) {
  const radius = avatarSize / 2;
  return (
    <View style={[styles.row, style]}>
      <Image
        source={{ uri: avatarUri }}
        style={{ width: avatarSize, height: avatarSize, borderRadius: radius }}
      />
      <View style={styles.mid}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subtitle ? (
          <View style={styles.subRow}>
            {subtitleLocationIcon ? (
              <Ionicons
                name="location-outline"
                size={18}
                color={Colors.textSecondary}
              />
            ) : null}
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          </View>
        ) : null}
      </View>
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mid: { flex: 1 },
  title: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  subtitle: { color: Colors.textSecondary, fontSize: 13 },
});
