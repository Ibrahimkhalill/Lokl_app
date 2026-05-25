// app/events/create-post.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { pickPostMedia } from "../../lib/mediaPicker";
import { getErrorMessage } from "../../lib/api";
import { postService } from "@/services/postService";

export default function CreatePostScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [text, setText] = useState("");
  const [media, setMedia] = useState<{ uri: string; kind: "image" | "video" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickMedia = async () => {
    const picked = await pickPostMedia();
    if (picked) {
      setMedia({ uri: picked.uri, kind: picked.type === "video" ? "video" : "image" });
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !media) {
      Alert.alert("Error", "Please add some content");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("body", text);
      formData.append("group_id", groupId);
      
      if (media) {
        const ext = media.uri.split(".").pop() ?? "jpg";
        formData.append("media", {
          uri: media.uri,
          name: `post_${Date.now()}.${ext}`,
          type: media.kind === "image" ? "image/jpeg" : "video/mp4",
        } as any);
        formData.append("type", media.kind);
      } else {
        formData.append("type", "text");
      }

      await postService.createPost(formData);
      Alert.alert("Success", "Post created successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.submitBtn, loading && styles.disabledBtn]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.black} />
          ) : (
            <Text style={styles.submitText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
        />

        {media && (
          <View style={styles.mediaPreview}>
            {media.kind === "image" ? (
              <Image source={{ uri: media.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.previewVideo}>
                <Ionicons name="videocam" size={40} color={Colors.text} />
                <Text style={styles.previewText}>Video selected</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => setMedia(null)} style={styles.removeBtn}>
              <Ionicons name="close-circle" size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.addMediaBtn} onPress={handlePickMedia}>
          <Ionicons name="image-outline" size={24} color={Colors.primary} />
          <Text style={styles.addMediaText}>Add Photo or Video</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  closeBtn: { padding: 8 },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitText: { color: Colors.black, fontSize: 14, fontWeight: "600" },
  disabledBtn: { opacity: 0.6 },
  content: { flex: 1, padding: 16 },
  input: {
    color: Colors.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  mediaPreview: {
    marginTop: 16,
    position: "relative",
    alignSelf: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  previewVideo: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  previewText: {
    color: Colors.textSecondary,
    marginTop: 8,
  },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  addMediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    justifyContent: "center",
  },
  addMediaText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});