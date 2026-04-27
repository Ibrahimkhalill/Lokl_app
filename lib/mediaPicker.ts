import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import { Alert } from "react-native";

export type PickedMedia = {
  uri: string;
  width: number;
  height: number;
  type: "image" | "video";
  duration?: number | null;
};

function normalizeAssetType(raw: ImagePickerAsset["type"]): "image" | "video" {
  return raw === "video" ? "video" : "image";
}

async function ensureLibraryAccess(): Promise<boolean> {
  const { status, canAskAgain } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === "granted") return true;
  Alert.alert(
    "Photos access",
    canAskAgain === false
      ? "Photo library access is turned off. Enable it in Settings to pick images."
      : "Allow photo library access to choose images and videos."
  );
  return false;
}

/** Event / group cover — crop-friendly landscape ratio. */
export async function pickCoverImage(): Promise<PickedMedia | null> {
  if (!(await ensureLibraryAccess())) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  const a = result.assets[0];
  return {
    uri: a.uri,
    width: a.width,
    height: a.height,
    type: normalizeAssetType(a.type),
    duration: a.duration,
  };
}

/** Profile-style square crop. */
export async function pickAvatarImage(): Promise<PickedMedia | null> {
  if (!(await ensureLibraryAccess())) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
  });
  if (result.canceled || !result.assets[0]) return null;
  const a = result.assets[0];
  return {
    uri: a.uri,
    width: a.width,
    height: a.height,
    type: normalizeAssetType(a.type),
  };
}

/** Post composer — images or videos from library (no crop). */
export async function pickPostMedia(): Promise<PickedMedia | null> {
  if (!(await ensureLibraryAccess())) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    allowsEditing: false,
    quality: 0.85,
    videoMaxDuration: 120,
  });
  if (result.canceled || !result.assets[0]) return null;
  const a = result.assets[0];
  return {
    uri: a.uri,
    width: a.width,
    height: a.height,
    type: normalizeAssetType(a.type),
    duration: a.duration,
  };
}
