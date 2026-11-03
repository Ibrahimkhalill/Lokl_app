import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { RangeSlider } from "../../components/primitives/RangeSlider";

const KM_PER_MILE = 1.609344;
const csv = (v?: string) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

const CATEGORIES = [
  "Boxing & Combat",
  "Yoga & Pilates",
  "Strength & CrossFit",
  "Court Sports",
  "Cycling & Cardio",
  "Outdoor & Adventure",
  "Classes & Studios",
  "Wellness & Recovery",
];

const NEIGHBORHOODS = [
  "West Village",
  "FiDi",
  "East Village",
  "Lower East Side",
  "Tribeca",
  "Midtown",
  "Murray Hill",
  "Chelsea",
  "SoHo",
  "NoHo",
  "Nolita",
  "Battery Park",
  "Flatiron",
  "Gramercy",
  "Hudson Square",
  "Hudson Yards",
  "Greenwich Village",
  "Upper West Side",
  "Upper East Side",
];

const RATINGS: { label: string; value: string }[] = [
  { label: "Any", value: "" },
  { label: "6+",  value: "6" },
  { label: "7+",  value: "7" },
  { label: "8+",  value: "8" },
  { label: "9+",  value: "9" },
];

export default function FiltersScreen() {
  const router = useRouter();

  const existing = useLocalSearchParams<{
    type?: string;
    min_rating?: string;
    plan_tier?: string;
    radius_km?: string;
    neighborhood?: string;
  }>();

  // The map is told the radius in km; the screen shows miles.
  const [distance,       setDistance]       = useState(existing.radius_km ? Math.max(1, Math.round(Number(existing.radius_km) / KM_PER_MILE)) : 10);
  const [planTier,       setPlanTier]        = useState(existing.plan_tier ?? "");
  const [categories,     setCategories]      = useState<string[]>(csv(existing.type));
  const [activeRating,   setActiveRating]    = useState(existing.min_rating ?? "");
  const [neighborhoods,  setNeighborhoods]   = useState<string[]>(csv(existing.neighborhood));
  // Only send a radius if the user actually set one — otherwise Reset could never clear it.
  const [distanceSet,    setDistanceSet]     = useState(!!existing.radius_km);

  function reset() {
    setDistance(10);
    setDistanceSet(false);
    setPlanTier("");
    setCategories([]);
    setActiveRating("");
    setNeighborhoods([]);
  }

  function apply() {
    // Always send every key ("" = cleared) so filters removed here are also removed on the map.
    const params: Record<string, string> = {
      type:         categories.join(","),
      min_rating:   activeRating,
      plan_tier:    planTier,
      neighborhood: neighborhoods.join(","),
      radius_km:    distanceSet ? String(Math.round(distance * KM_PER_MILE * 10) / 10) : "",
    };
    // Go back to the existing tabs screen instead of stacking a new one on top.
    router.dismissTo({ pathname: "/(tabs)" as any, params });
  }

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
          <Text style={styles.highlight}>{distance} mi</Text>
          <Text style={styles.labelSub}> / 10 mi</Text>
        </Text>
        <RangeSlider
          value={distance}
          min={1}
          max={10}
          step={1}
          onChange={(v) => { setDistance(v); setDistanceSet(true); }}
          label={(v) => String(Math.round(v))}
        />

        {/* ── Accessibility ────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Accessibility</Text>
        {[
          { label: "Public",  value: "public" },
          { label: "Private", value: "private" },
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

        {/* ── Categories ───────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Categories</Text>
        <View style={styles.chipGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                categories.includes(cat) && styles.chipActive,
              ]}
              onPress={() => setCategories((prev) => toggle(prev, cat))}
            >
              <Text
                style={[
                  styles.chipText,
                  categories.includes(cat) && styles.chipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Neighborhood ─────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Neighborhood</Text>
        <View style={styles.chipGrid}>
          {NEIGHBORHOODS.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.chip, neighborhoods.includes(n) && styles.chipActive]}
              onPress={() => setNeighborhoods((prev) => toggle(prev, n))}
            >
              <Text
                style={[
                  styles.chipText,
                  neighborhoods.includes(n) && styles.chipTextActive,
                ]}
              >
                {n}
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
