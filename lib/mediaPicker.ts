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

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  "3gp": "video/3gpp",
  webm: "video/webm",
};

/**
 * Builds the `{ uri, name, type }` object React Native's FormData expects, with a real MIME type.
 * Handles URIs without an extension (e.g. Android `content://`) by falling back on `kind`.
 */
export function toUploadFile(uri: string, kind: "image" | "video" = "image", baseName = "upload") {
  const lastSegment = uri.split("?")[0].split("/").pop() ?? "";
  const extMatch = /\.([a-z0-9]+)$/i.exec(lastSegment);
  const ext = extMatch?.[1].toLowerCase();
  const type = (ext && MIME_BY_EXT[ext]) ?? (kind === "video" ? "video/mp4" : "image/jpeg");
  const safeExt = ext && MIME_BY_EXT[ext] ? ext : kind === "video" ? "mp4" : "jpg";
  return { uri, name: `${baseName}_${Date.now()}.${safeExt}`, type } as any;
}

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

/** Event / group cover — free crop, no fixed ratio. */
export async function pickCoverImage(): Promise<PickedMedia | null> {
  if (!(await ensureLibraryAccess())) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
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
