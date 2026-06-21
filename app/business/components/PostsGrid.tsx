import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as VideoThumbnails from "expo-video-thumbnails";
import { VideoView, useVideoPlayer } from "expo-video";
import { Colors } from "../../../constants/colors";
import { sharedStyles } from "./sharedStyles";
import { businessService } from "../../../services/businessService";
import { ClassClip } from "./types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GRID_GAP = 0;
const GRID_COLS = 3;
const GRID_PAD = 14;
const CELL_SIZE = (SCREEN_WIDTH - GRID_PAD * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

interface Props {
  clips: ClassClip[];
  isOwner: boolean;
  onCreatePost: () => void;
  businessProfileId?: number;
  onUpdate?: () => void;
}

function VideoClipPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.65 }}
      contentFit="contain"
      allowsFullscreen
    />
  );
}

export function PostsGrid({ clips, isOwner, onCreatePost, businessProfileId, onUpdate }: Props) {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const generating = useRef<Set<number>>(new Set());
  const [selectedClip, setSelectedClip] = useState<ClassClip | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    clips.forEach((clip) => {
      if (clip.video_url && !clip.image_url && !generating.current.has(clip.id)) {
        generating.current.add(clip.id);
        VideoThumbnails.getThumbnailAsync(clip.video_url, { time: 0 })
          .then(({ uri }) => setThumbnails((prev) => ({ ...prev, [clip.id]: uri })))
          .catch(() => {});
      }
    });
  }, [clips]);

  function handleDeleteClip(clip: ClassClip) {
    if (!businessProfileId) return;
    Alert.alert("Delete Clip", "Remove this clip from your profile?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          setSelectedClip(null);
          try {
            await businessService.deleteClip(businessProfileId, clip.id);
            onUpdate?.();
          } catch {
            Alert.alert("Error", "Could not delete clip.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  if (!isOwner && clips.length === 0) return null;

  return (
    <>
      <View style={sharedStyles.sectionHeaderRow}>
        <Text style={sharedStyles.sectionHeader}>Posts & Class Clips</Text>
        {isOwner && (
          <TouchableOpacity style={sharedStyles.sectionAddBtn} onPress={onCreatePost}>
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={sharedStyles.sectionAddBtnText}>Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {clips.length === 0 ? (
        <TouchableOpacity style={sharedStyles.addPlaceholder} onPress={onCreatePost}>
          <View style={sharedStyles.addPlaceholderIcon}>
            <Ionicons name="images-outline" size={26} color={Colors.primary} />
          </View>
          <Text style={sharedStyles.addPlaceholderTitle}>Share Class Clips</Text>
          <Text style={sharedStyles.addPlaceholderText}>
            Post photos or videos of your sessions
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.grid}>
          {clips.slice(0, 12).map((clip) => {
            const thumbUri = clip.image_url ?? thumbnails[clip.id] ?? null;
            const isVideo = !!clip.video_url;

            return (
              <TouchableOpacity
                key={clip.id}
                style={styles.cell}
                activeOpacity={0.85}
                onPress={() => setSelectedClip(clip)}
                onLongPress={() => isOwner && handleDeleteClip(clip)}
                delayLongPress={500}
              >
                {thumbUri ? (
                  <Image source={{ uri: thumbUri }} style={styles.img} resizeMode="cover" />
                ) : (
                  <View style={[styles.img, styles.placeholder]}>
                    <Ionicons
                      name={isVideo ? "videocam-outline" : "image-outline"}
                      size={24}
                      color={Colors.textMuted}
                    />
                  </View>
                )}
                {isVideo && (
                  <View style={styles.playBadge}>
                    <Ionicons name="play" size={9} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Full-screen clip viewer */}
      <Modal
        visible={!!selectedClip}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setSelectedClip(null)}
      >
        <View style={styles.viewerBg}>
          {/* Top bar */}
          <View style={styles.viewerTopBar}>
            <TouchableOpacity
              style={styles.viewerBtn}
              onPress={() => setSelectedClip(null)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {isOwner && businessProfileId && selectedClip && (
              <TouchableOpacity
                style={styles.viewerBtn}
                onPress={() => handleDeleteClip(selectedClip)}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#ff4444" />
                ) : (
                  <Ionicons name="trash-outline" size={22} color="#ff4444" />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Media */}
          <View style={styles.viewerMedia}>
            {selectedClip?.video_url ? (
              <VideoClipPlayer uri={selectedClip.video_url} />
            ) : selectedClip?.image_url ? (
              <Image
                source={{ uri: selectedClip.image_url }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : null}
          </View>

          {/* Owner hint */}
          {isOwner && (
            <Text style={styles.hintText}>Long press on grid to delete</Text>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    marginBottom: 14,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  img: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.secondaryCard,
  },
  playBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerBg: {
    flex: 1,
    backgroundColor: "#000",
  },
  viewerTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  viewerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerMedia: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  hintText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    textAlign: "center",
    paddingBottom: 32,
  },
});
