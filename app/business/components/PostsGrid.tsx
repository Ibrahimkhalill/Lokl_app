import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Colors } from "../../../constants/colors";
import { sharedStyles } from "./sharedStyles";
import { ClassClip } from "./types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_GAP = 0;
const GRID_COLS = 3;
const GRID_PAD = 14;
// subtract horizontal padding (both sides) and gaps between cells
const CELL_SIZE = (SCREEN_WIDTH - GRID_PAD * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

interface Props {
  clips: ClassClip[];
  isOwner: boolean;
  onCreatePost: () => void;
}

export function PostsGrid({ clips, isOwner, onCreatePost }: Props) {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const generating = useRef<Set<number>>(new Set());

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
              <TouchableOpacity key={clip.id} style={styles.cell} activeOpacity={0.85}>
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
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    marginBottom: 14,
    // paddingHorizontal: 18,
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
});
