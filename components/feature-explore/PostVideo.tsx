import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { Colors } from "../../constants/colors";

/**
 * One reliable video player for every post: no disk caching (it made some uploads stall on iPhone), standard
 * controls, and when a video cannot load it says so with a retry button instead of showing a blank box.
 */
export function PostVideo({
  uri,
  active,
  width,
  height = 240,
}: {
  uri: string;
  active: boolean;
  width?: number | string;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    const sub = player.addListener("statusChange", ({ status }) => {
      setLoading(status === "loading");
      if (status === "error") setFailed(true);
      if (status === "readyToPlay") setFailed(false);
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    if (failed) return;
    if (active) player.play();
    else player.pause();
  }, [active, failed, player]);

  const retry = async () => {
    setFailed(false);
    setLoading(true);
    try {
      await player.replaceAsync({ uri });
      player.play();
    } catch {
      setFailed(true);
    }
  };

  return (
    <View style={[styles.box, { width: width as any, height }]}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls />
      {loading && !failed ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : null}
      {failed ? (
        <TouchableOpacity style={styles.overlay} onPress={retry} activeOpacity={0.8}>
          <Ionicons name="refresh" size={26} color={Colors.text} />
          <Text style={styles.text}>Couldn't play this video. Tap to try again.</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#000", overflow: "hidden" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  text: { color: Colors.text, fontSize: 13, textAlign: "center", paddingHorizontal: 24 },
});
