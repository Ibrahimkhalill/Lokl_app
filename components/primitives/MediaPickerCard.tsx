import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

export interface MediaPickerCardProps {
  onPress?: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  height?: number;
  style?: ViewStyle;
  /** Local `file://` or content URI from image picker — shows preview when set. */
  previewUri?: string | null;
  /** Use `video` when `previewUri` points at a video (no image thumbnail). */
  previewKind?: "image" | "video";
}

export function MediaPickerCard({
  onPress,
  icon,
  title,
  subtitle,
  height = 140,
  style,
  previewUri,
  previewKind = "image",
}: MediaPickerCardProps) {
  const hasPreview = Boolean(previewUri);
  const showVideoPreview = hasPreview && previewKind === "video";

  const inner = hasPreview ? (
    <View style={v.previewColumn}>
      {showVideoPreview ? (
        <View style={[StyleSheet.absoluteFillObject, v.videoPreview]}>
          <Ionicons name="play-circle" size={48} color={Colors.primary} />
          <Text style={t.videoPreviewText}>Video selected</Text>
        </View>
      ) : (
        <Image
          source={{ uri: previewUri! }}
          style={[StyleSheet.absoluteFillObject, i.previewImage]}
          resizeMode="cover"
        />
      )}
      <View style={v.previewSpacer} />
      <View style={v.previewFooter}>
        <Text style={t.previewFooterText}>Tap to change</Text>
      </View>
    </View>
  ) : (
    <>
      {icon}
      <Text style={t.title}>{title}</Text>
      {subtitle ? <Text style={t.subtitle}>{subtitle}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[v.box, { height }, style, hasPreview && v.boxPreview]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[v.box, { height }, style, hasPreview && v.boxPreview]}>
      {inner}
    </View>
  );
}

const v = StyleSheet.create({
  box: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  boxPreview: {
    alignItems: "stretch",
    padding: 0,
    gap: 0,
  },
  previewColumn: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
  },
  previewSpacer: { flex: 1 },
  videoPreview: {
    backgroundColor: Colors.secondaryCard,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  previewFooter: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 8,
    alignItems: "center",
  },
});

const t = StyleSheet.create({
  videoPreviewText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  previewFooterText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  title: { color: Colors.textSecondary, fontSize: 14 },
  subtitle: { color: Colors.textMuted, fontSize: 13 },
});

const i = StyleSheet.create({
  previewImage: {
    borderRadius: 15,
  },
});
