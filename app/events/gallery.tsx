import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { eventService } from "../../services/eventService";
import { getErrorMessage } from "../../lib/api";
import { EmptyState } from "../../components/primitives";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 4) / 3;

type GalleryItem = {
  id: number;
  image_url: string;
  uploaded_by?: { id: number; name: string };
  created_at?: string;
};

export default function GalleryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);

  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  const fetchGallery = useCallback(async () => {
    if (!eventId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await eventService.getGallery(eventId);
      const payload = res.data?.data ?? res.data;
      const results: GalleryItem[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : [];
      setImages(results);
    } catch (e) {
      console.log("[Gallery] error:", getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const toggle = (idx: number) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {selected.length > 0 ? `${selected.length} Selected` : "Gallery"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={s.sectionLabel}>Gallery</Text>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : images.length === 0 ? (
        <EmptyState icon="images-outline" title="No photos yet" subtitle="No one has added photos to this event" />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          contentContainerStyle={s.grid}
          renderItem={({ item, index }) => {
            const isSelected = selected.includes(index);
            const selIdx = selected.indexOf(index);
            return (
              <TouchableOpacity
                style={[s.cell, isSelected && s.cellSelected]}
                onPress={() => toggle(index)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={s.cellImage}
                  resizeMode="cover"
                />
                {isSelected && (
                  <View style={s.selBadge}>
                    <Text style={s.selBadgeText}>{selIdx + 1}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={s.footer}>
        <TouchableOpacity style={s.doneBtn} onPress={() => router.back()}>
          <Text style={s.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: "700" },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
  grid: { gap: 2 },
  cell: { width: ITEM_SIZE, height: ITEM_SIZE, position: "relative" },
  cellSelected: { opacity: 0.85 },
  cellImage: { width: "100%", height: "100%" },
  selBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  selBadgeText: { color: Colors.black, fontSize: 11, fontWeight: "800" },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  doneBtnText: { color: Colors.black, fontSize: 16, fontWeight: "700" },
});
