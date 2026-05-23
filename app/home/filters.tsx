import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDER_WIDTH = SCREEN_WIDTH - 40; // paddingHorizontal: 20 each side

const CATEGORIES = [
  "Gym", "Yoga", "Boxing", "Basketball", "Tennis",
  "CrossFit", "Pilates", "Martial Arts", "Swimming",
  "Climbing", "Cycling", "Golf", "Cricket", "Sports",
];

const RATINGS: { label: string; value: string }[] = [
  { label: "Any",  value: "" },
  { label: "6+",   value: "6" },
  { label: "7+",   value: "7" },
  { label: "8+",   value: "8" },
  { label: "9+",   value: "9" },
];

const PRICES: { label: string; value: string }[] = [
  { label: "$",    value: "$" },
  { label: "$$",   value: "$$" },
  { label: "$$$",  value: "$$$" },
  { label: "$$$$", value: "$$$$" },
];

const AMENITIES = [
  { icon: "car-outline",        label: "Parking", value: "parking" },
  { icon: "water-outline",      label: "Shower",  value: "shower"  },
  { icon: "lock-closed-outline",label: "Locker",  value: "locker"  },
  { icon: "wifi-outline",       label: "WiFi",    value: "wifi"    },
];

export default function FiltersScreen() {
  const router = useRouter();

  // Read any existing params from home screen (so filters persist)
  const existing = useLocalSearchParams<{
    type?: string;
    min_rating?: string;
    price_level?: string;
    amenities?: string;
    plan_tier?: string;
    radius_km?: string;
  }>();

  const [distance,         setDistance]         = useState(Number(existing.radius_km) || 10);
  const [planTier,         setPlanTier]          = useState(existing.plan_tier ?? "");
  const [activeCategory,   setActiveCategory]    = useState(existing.type ?? "");
  const [activeRating,     setActiveRating]      = useState(existing.min_rating ?? "");
  const [activePrice,      setActivePrice]       = useState(existing.price_level ?? "");
  const [activeAmenities,  setActiveAmenities]   = useState<string[]>(
    existing.amenities ? existing.amenities.split(",") : []
  );

  const toggleAmenity = (val: string) =>
    setActiveAmenities((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );

  function reset() {
    setDistance(10);
    setPlanTier("");
    setActiveCategory("");
    setActiveRating("");
    setActivePrice("");
    setActiveAmenities([]);
  }

  function apply() {
    const params: Record<string, string> = {};
    if (activeCategory)          params.type        = activeCategory;
    if (activeRating)            params.min_rating  = activeRating;
    if (activePrice)             params.price_level = activePrice;
    if (activeAmenities.length)  params.amenities   = activeAmenities.join(",");
    if (planTier)                params.plan_tier   = planTier;
    params.radius_km = String(distance);

    // Navigate to home tab with filter params — home screen reads them via useLocalSearchParams
    router.push({ pathname: "/(tabs)/", params });
  }

  // ── Simple drag slider ───────────────────────────────────────────────────
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => {
      const ratio = Math.max(0, Math.min(1, gs.moveX / SLIDER_WIDTH));
      setDistance(Math.round(ratio * 10) || 1);
    },
  });

  const thumbLeft = ((distance / 10) * (SLIDER_WIDTH - 20));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={reset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Distance ─────────────────────────────────────────────── */}
        <Text style={styles.label}>
          Distance:{" "}
          <Text style={styles.highlight}>{distance} km</Text>
          <Text style={styles.labelSub}> / 10 km</Text>
        </Text>
        <View style={styles.sliderTrack} {...panResponder.panHandlers}>
          <View style={[styles.sliderFill, { width: `${distance * 10}%` }]} />
          <View style={[styles.sliderThumb, { left: thumbLeft }]} />
        </View>

        {/* ── Plan Tiers ───────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Plan tiers</Text>
        {[
          { label: "Free",  value: "free" },
          { label: "Paid",  value: "paid" },
        ].map((tier) => (
          <TouchableOpacity
            key={tier.value}
            style={styles.radioRow}
            onPress={() =>
              setPlanTier((prev) => (prev === tier.value ? "" : tier.value))
            }
          >
            <View
              style={[
                styles.radio,
                planTier === tier.value && styles.radioActive,
              ]}
            >
              {planTier === tier.value && (
                <Ionicons name="checkmark" size={14} color={Colors.black} />
              )}
            </View>
            <Text style={styles.radioLabel}>{tier.label}</Text>
          </TouchableOpacity>
        ))}

        {/* ── Sport Categories ─────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Sport Categories</Text>
        <View style={styles.chipGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                activeCategory === cat && styles.chipActive,
              ]}
              onPress={() =>
                setActiveCategory((prev) => (prev === cat ? "" : cat))
              }
            >
              <Text
                style={[
                  styles.chipText,
                  activeCategory === cat && styles.chipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Minimum Rating ───────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>
          Minimum Rating:{" "}
          <Text style={styles.highlight}>
            {activeRating ? `${activeRating}+` : "Any"}
          </Text>
        </Text>
        <View style={styles.chipRow}>
          {RATINGS.map((r) => (
            <TouchableOpacity
              key={r.label}
              style={[
                styles.chip,
                activeRating === r.value && styles.chipActive,
              ]}
              onPress={() => setActiveRating(r.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeRating === r.value && styles.chipTextActive,
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Price Range ──────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Price Range</Text>
        <View style={styles.chipRow}>
          {PRICES.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.chip,
                activePrice === p.value && styles.chipActive,
              ]}
              onPress={() =>
                setActivePrice((prev) => (prev === p.value ? "" : p.value))
              }
            >
              <Text
                style={[
                  styles.chipText,
                  activePrice === p.value && styles.chipTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Amenities ────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Amenities</Text>
        <View style={styles.chipGrid}>
          {AMENITIES.map((a) => {
            const active = activeAmenities.includes(a.value);
            return (
              <TouchableOpacity
                key={a.value}
                style={[styles.amenityChip, active && styles.chipActive]}
                onPress={() => toggleAmenity(a.value)}
              >
                <Ionicons
                  name={a.icon as any}
                  size={16}
                  color={active ? Colors.black : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.chipText,
                    active && styles.chipTextActive,
                  ]}
                >
                  {a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Apply Button ─────────────────────────────────────────── */}
      <View style={styles.applyWrap}>
        <TouchableOpacity style={styles.applyBtn} onPress={apply} activeOpacity={0.85}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  resetText:   { color: Colors.primary, fontSize: 14, fontWeight: "600" },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  label: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 14,
  },
  labelSub:  { color: Colors.textSecondary, fontWeight: "400" },
  highlight: { color: Colors.primary },

  sliderTrack: {
    height: 6,
    backgroundColor: Colors.cardBorder,
    borderRadius: 3,
    marginBottom: 28,
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.background,
  },

  sectionLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 4,
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radioLabel: { color: Colors.text, fontSize: 15 },

  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText:       { color: Colors.text, fontSize: 14, fontWeight: "500" },
  chipTextActive: { color: Colors.black, fontWeight: "700" },

  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },

  applyWrap: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.background,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  applyText: { color: Colors.black, fontSize: 17, fontWeight: "700" },
});
