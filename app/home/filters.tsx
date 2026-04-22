import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = ["Yoga", "Boxing", "Basketball", "Gym", "Golf", "Other"];
const RATINGS = ["Any", "6+", "7+", "8+", "9+"];
const PRICES = ["$9", "$99", "$999", "$9999"];
const AMENITIES = [
  { icon: "car-outline", label: "Parking" },
  { icon: "water-outline", label: "Shower" },
  { icon: "lock-closed-outline", label: "Locker" },
  { icon: "wifi-outline", label: "Wifi" },
];

export default function FiltersScreen() {
  const router = useRouter();
  const [distance, setDistance] = useState(5);
  const [planTier, setPlanTier] = useState("paid");
  const [activeCategory, setActiveCategory] = useState("Boxing");
  const [activeRating, setActiveRating] = useState("8+");
  const [activePrice, setActivePrice] = useState("$999");
  const [activeAmenities, setActiveAmenities] = useState<string[]>(["Parking"]);

  const toggleAmenity = (a: string) =>
    setActiveAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <View></View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Distance */}
        <Text style={styles.label}>
          Distance: <Text style={styles.highlight}>{distance} Km</Text>
          <Text style={styles.labelSub}> /10km</Text>
        </Text>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${distance * 10}%` }]} />
          <View
            style={[
              styles.sliderThumb,
              { left: `${distance * 10 - 2.5}%` as any },
            ]}
          />
        </View>

        {/* Plan Tiers */}
        <Text style={styles.sectionLabel}>Plan tiers</Text>
        {["free", "paid"].map((tier) => (
          <TouchableOpacity
            key={tier}
            style={styles.radioRow}
            onPress={() => setPlanTier(tier)}
          >
            <View
              style={[styles.radio, planTier === tier && styles.radioActive]}
            >
              {planTier === tier && (
                <Ionicons name="checkmark" size={14} color={Colors.black} />
              )}
            </View>
            <Text style={styles.radioLabel}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Sport Categories */}
        <Text style={styles.sectionLabel}>Sport Categories</Text>
        <View style={styles.chipGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              onPress={() => setActiveCategory(cat)}
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

        {/* Minimum Rating */}
        <Text style={styles.sectionLabel}>
          Minimum Rating: <Text style={styles.highlight}>{activeRating}</Text>
        </Text>
        <View style={styles.chipRow}>
          {RATINGS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, activeRating === r && styles.chipActive]}
              onPress={() => setActiveRating(r)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeRating === r && styles.chipTextActive,
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Range */}
        <Text style={styles.sectionLabel}>Price Range</Text>
        <View style={styles.chipRow}>
          {PRICES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, activePrice === p && styles.chipActive]}
              onPress={() => setActivePrice(p)}
            >
              <Text
                style={[
                  styles.chipText,
                  activePrice === p && styles.chipTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amenities */}
        <Text style={styles.sectionLabel}>Amenities</Text>
        <View style={styles.chipGrid}>
          {AMENITIES.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[
                styles.amenityChip,
                activeAmenities.includes(a.label) && styles.chipActive,
              ]}
              onPress={() => toggleAmenity(a.label)}
            >
              <Ionicons
                name={a.icon as any}
                size={16}
                color={
                  activeAmenities.includes(a.label)
                    ? Colors.black
                    : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.chipText,
                  activeAmenities.includes(a.label) && styles.chipTextActive,
                ]}
              >
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Apply */}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
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
  resetText: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  label: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 14,
  },
  labelSub: { color: Colors.textSecondary, fontWeight: "400" },
  highlight: { color: Colors.primary },
  sliderTrack: {
    height: 6,
    backgroundColor: Colors.cardBorder,
    borderRadius: 3,
    marginBottom: 24,
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
  radioActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
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
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.text, fontSize: 14, fontWeight: "500" },
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
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  applyText: { color: Colors.black, fontSize: 17, fontWeight: "700" },
});
