import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchIcon from "../../assets/icons/search.svg";
import LocationIcon from "../../assets/icons/locations.svg";
import ShareIcon from "../../assets/icons/share.svg";

const CATEGORIES = [
  { id: "1", label: "Yoga", icon: "body-outline", active: true },
  { id: "2", label: "Boxing", icon: "fitness-outline", active: false },
  { id: "3", label: "Basketball", icon: "basketball-outline", active: false },
  { id: "4", label: "Gym", icon: "barbell-outline", active: false },
  { id: "5", label: "Golf", icon: "golf-outline", active: false },
  { id: "6", label: "Cricket", icon: "baseball-outline", active: false },
];

const RECENTLY_VIEWED = [
  {
    id: "1",
    name: "Zen Garden Yoga",
    location: "Kyoto, North Asian",
    distance: "1.2 k",
    rating: "9/10",
  },
  {
    id: "2",
    name: "Gobi Yoga Camp",
    location: "Gobi Desert, North Asian",
    distance: "1.3 k",
    rating: "8/10",
  },
  {
    id: "3",
    name: "Yoga Mountain",
    location: "Gobi Desert, Asian",
    distance: "1.4 k",
    rating: "8.5/10",
  },
  {
    id: "4",
    name: "Hanok Yoga",
    location: "Seoul, Asian",
    distance: "1.5 k",
    rating: "9.2/10",
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState("1");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Search Bars */}
          <View style={styles.searchSection}>
            {/* Keyword search */}
            <View style={styles.searchBar}>
              <View style={styles.searchBarInner}>
                <SearchIcon
                  width={18}
                  height={18}
                  color={Colors.textSecondary}
                />
              </View>
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
                placeholderTextColor={Colors.textSecondary}
                autoFocus
              />
            </View>

            {/* Location search */}
            <View style={styles.searchBar}>
              <View style={styles.searchBarInner}>
                <LocationIcon
                  width={18}
                  height={18}
                  color={Colors.textSecondary}
                />
              </View>
              <TextInput
                style={styles.searchInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Location..."
                placeholderTextColor={Colors.textSecondary}
              />
              <TouchableOpacity
                style={styles.closeChip}
                onPress={() => setLocation("")}
              >
                <Ionicons name="close" size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Chose Categories</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryItem}
                    onPress={() => setActiveCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.categoryIconWrap,
                        isActive && styles.categoryIconActive,
                      ]}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={22}
                        color={isActive ? Colors.primary : Colors.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        isActive && styles.categoryLabelActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Recently Viewed */}
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recently Viewed</Text>

            <View style={styles.recentList}>
              {RECENTLY_VIEWED.map((item) => (
                <View key={item.id} style={styles.recentItem}>
                  <TouchableOpacity
                    style={styles.recentMainTap}
                    activeOpacity={0.85}
                    onPress={() => router.push("/home/details")}
                  >
                    <View style={styles.recentLeft}>
                      <LocationIcon
                        width={22}
                        height={22}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.recentDistance}>{item.distance}</Text>
                    </View>

                    <View style={styles.recentMid}>
                      <View style={styles.recentTitleRow}>
                        <Text style={styles.recentName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View style={styles.ratingBadge}>
                          <Text style={styles.ratingBadgeText}>
                            {item.rating}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.recentLocation} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.recentCircleBtn}
                    onPress={() => {}}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.75}
                  >
                    <ShareIcon width={18} height={18} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20 },
  scroll: { paddingBottom: 120 },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },

  // Search
  searchSection: { gap: 12, marginBottom: 24 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2e3a3d",
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#2e3a3d",
  },
  searchBarInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  divider: {
    width: 2,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginLeft: 4,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  regionChip: {
    backgroundColor: Colors.text,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  regionText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "600",
  },
  closeChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },

  // Categories
  categorySection: { marginBottom: 24 },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  seeAll: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  categoryList: { gap: 16, paddingRight: 8 },
  categoryItem: {
    alignItems: "center",
    gap: 4,
    width: 56,
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIconActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(209,255,0,0.08)",
  },
  categoryLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  categoryLabelActive: {
    color: Colors.primary,
  },

  // Recently Viewed
  recentSection: {},
  recentTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
  },
  recentList: { gap: 12 },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondaryCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 10,
    gap: 4,
  },
  recentMainTap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minWidth: 0,
    paddingVertical: 2,
  },
  recentLeft: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: 40,
  },
  recentDistance: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  recentMid: {
    flex: 1,
    minWidth: 0,
  },
  recentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  recentName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  ratingBadge: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  ratingBadgeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  recentLocation: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  recentCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
});
