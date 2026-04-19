import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 4) / 3;

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
  "https://images.unsplash.com/photo-1546519638405-a5f7678bdfae?w=300&q=80",
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&q=80",
  "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=300&q=80",
  "https://images.unsplash.com/photo-1506926953475-b3a91b58e3f7?w=300&q=80",
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=80",
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=300&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&q=80",
  "https://images.unsplash.com/photo-1600336153113-d66c79de3e91?w=300&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80",
  "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&q=80",
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&q=80",
  "https://images.unsplash.com/photo-1592659762303-90081d34b277?w=300&q=80",
];

export default function GalleryScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (idx: number) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
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

      <FlatList
        data={GALLERY_IMAGES}
        keyExtractor={(_, i) => i.toString()}
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
                source={{ uri: item }}
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
  grid: { gap: 2, paddingHorizontal: 0 },
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
