import React, { useRef, useState } from "react";
import {
  View,
  Image,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { Colors } from "../../constants/colors";

export type PostMediaItem = { type: "image" | "video"; url: string };

const SCREEN = Dimensions.get("window");
const DEFAULT_WIDTH = SCREEN.width - 32;

function InlineVideo({ uri, active, width }: { uri: string; active: boolean; width: number }) {
  const player = useVideoPlayer({ uri, useCaching: true }, (p) => {
    p.loop = true;
  });
  React.useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);
  return <VideoView player={player} style={[styles.media, { width }]} contentFit="cover" nativeControls />;
}

/**
 * All pictures and videos of a post: swipe sideways through them; tap a picture to open it large
 * and keep swiping through the whole set.
 */
export function PostMediaGallery({ media, autoplay }: { media: PostMediaItem[]; autoplay?: boolean }) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [viewerAt, setViewerAt] = useState<number | null>(null);
  const viewerRef = useRef<FlatList<PostMediaItem & { i: number }>>(null);

  if (!media.length) return null;
  const images = media.map((m, i) => ({ ...m, i })).filter((m) => m.type === "image");

  return (
    <View onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width) || DEFAULT_WIDTH)}>
      <FlatList keyboardDismissMode="on-drag"
        data={media}
        keyExtractor={(m, i) => `${i}-${m.url}`}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index: i }) =>
          item.type === "video" ? (
            <View style={{ width }}>
              <InlineVideo uri={item.url} active={!!autoplay && i === index} width={width} />
            </View>
          ) : (
            <Pressable style={{ width }} onPress={() => setViewerAt(i)}>
              <Image source={{ uri: item.url }} style={[styles.media, { width }]} resizeMode="cover" />
            </Pressable>
          )
        }
      />
      {media.length > 1 && (
        <View style={styles.dots} pointerEvents="none">
          {media.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}

      {/* Large view of the pictures: swipe through all of them */}
      <Modal visible={viewerAt !== null} transparent animationType="fade" onRequestClose={() => setViewerAt(null)}>
        <StatusBar hidden />
        <View style={styles.viewer}>
          <FlatList keyboardDismissMode="on-drag"
            ref={viewerRef}
            data={images}
            keyExtractor={(m) => String(m.i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.max(0, images.findIndex((m) => m.i === viewerAt))}
            getItemLayout={(_, i) => ({ length: SCREEN.width, offset: SCREEN.width * i, index: i })}
            renderItem={({ item }) => (
              <View style={styles.viewerPage}>
                <Image source={{ uri: item.url }} style={styles.viewerImage} resizeMode="contain" />
              </View>
            )}
          />
          <TouchableOpacity style={styles.close} onPress={() => setViewerAt(null)} hitSlop={12}>
            <Ionicons name="close" size={26} color={Colors.white} />
          </TouchableOpacity>
          {images.length > 1 && <Text style={styles.count}>{images.length} photos · swipe</Text>}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  media: { height: 240 },
  dots: { position: "absolute", bottom: 10, alignSelf: "center", flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)" },
  dotActive: { width: 16, backgroundColor: Colors.primary },
  viewer: { flex: 1, backgroundColor: "rgba(0,0,0,0.96)", justifyContent: "center" },
  viewerPage: { width: SCREEN.width, height: SCREEN.height, justifyContent: "center", alignItems: "center" },
  viewerImage: { width: SCREEN.width, height: SCREEN.height * 0.85 },
  close: {
    position: "absolute", top: 54, right: 20, width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center",
  },
  count: { position: "absolute", bottom: 40, alignSelf: "center", color: Colors.textSecondary, fontSize: 12 },
});
