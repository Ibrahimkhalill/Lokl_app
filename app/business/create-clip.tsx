import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as VideoThumbnails from "expo-video-thumbnails";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { pickPostMedia } from "../../lib/mediaPicker";
import { businessService } from "../../services/businessService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function CreateClipScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { businessId } = useLocalSearchParams<{ businessId?: string }>();

  const [media, setMedia] = useState<{ uri: string; type: "image" | "video" } | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [thumbUri, setThumbUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);

  async function handlePickMedia() {
    const picked = await pickPostMedia();
    if (!picked) return;
    setMedia({ uri: picked.uri, type: picked.type });
    setThumbUri(null);

    if (picked.type === "video") {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(picked.uri, { time: 0 });
        setPreviewUri(uri);
        setThumbUri(uri);
      } catch {
        setPreviewUri(null);
      }
    } else {
      setPreviewUri(picked.uri);
    }
  }

  async function handlePost() {
    if (!media) {
      Alert.alert("No media", "Please pick a photo or video first.");
      return;
    }
    if (!businessId) {
      Alert.alert("Error", "Business profile not found.");
      return;
    }

    setPosting(true);
    try {
      const form = new FormData();
      const filename = media.uri.split("/").pop() ?? "clip.jpg";
      const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
      const mimeType = media.type === "video"
        ? (ext === "mov" ? "video/quicktime" : "video/mp4")
        : `image/${ext === "jpg" ? "jpeg" : ext}`;

      form.append(media.type === "video" ? "video" : "image", {
        uri: media.uri,
        name: filename,
        type: mimeType,
      } as any);

      // Upload the locally generated thumbnail as `image` so the grid can show it
      if (media.type === "video" && thumbUri) {
        form.append("image", {
          uri: thumbUri,
          name: "thumb.jpg",
          type: "image/jpeg",
        } as any);
      }

      if (caption.trim()) {
        form.append("caption", caption.trim());
      }

      await businessService.addClip(Number(businessId), form);
      showToast({ type: "success", title: "Posted!", message: "Your clip is now on your profile." });
      router.back();
    } catch (err) {
      Alert.alert("Post failed", getErrorMessage(err));
    } finally {
      setPosting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Class Clip</Text>
          <TouchableOpacity
            style={[styles.postBtn, (!media || posting) && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={!media || posting}
          >
            {posting ? (
              <ActivityIndicator size="small" color={Colors.black} />
            ) : (
              <Text style={styles.postBtnText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Media picker */}
          <TouchableOpacity
            style={styles.mediaPicker}
            onPress={handlePickMedia}
            activeOpacity={0.85}
          >
            {media ? (
              <View style={styles.mediaPreview}>
                <Image
                  source={{ uri: previewUri ?? media.uri }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
                {media.type === "video" && (
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.changeMedia}
                  onPress={handlePickMedia}
                >
                  <Ionicons name="swap-horizontal" size={16} color={Colors.white} />
                  <Text style={styles.changeMediaText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <View style={styles.mediaPlaceholderIcon}>
                  <Ionicons name="add" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.mediaPlaceholderTitle}>Add Photo or Video</Text>
                <Text style={styles.mediaPlaceholderSub}>
                  Share clips from your training sessions
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Caption */}
          <View style={styles.captionCard}>
            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={(t) => setCaption(t.slice(0, 300))}
              placeholder="Add a caption (optional)..."
              placeholderTextColor={Colors.textMuted}
              selectionColor={Colors.primary}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={styles.charCount}>{caption.length}/300</Text>
          </View>

          <View style={styles.hintCard}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.hintText}>
              This clip will appear in the Posts & Class Clips grid on your profile.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  postBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: Colors.black, fontSize: 14, fontWeight: "700" },

  body: { padding: 20, gap: 16, paddingBottom: 60 },

  // Media picker
  mediaPicker: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 280,
  },
  mediaPreview: { position: "relative" },
  mediaImage: { width: "100%", height: 320 },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  changeMedia: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeMediaText: { color: Colors.white, fontSize: 13, fontWeight: "600" },

  mediaPlaceholder: {
    flex: 1,
    minHeight: 280,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 32,
  },
  mediaPlaceholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(209,255,0,0.1)",
    borderWidth: 1,
    borderColor: "rgba(209,255,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  mediaPlaceholderTitle: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  mediaPlaceholderSub: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },

  // Caption
  captionCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
  },
  captionInput: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 80,
    padding: 0,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: "right",
    marginTop: 6,
  },

  // Hint
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  hintText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
