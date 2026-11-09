import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CategoryIcon } from "../../components/primitives/CategoryIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/colors";
import { NEIGHBORHOODS } from "../../constants/neighborhoods";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchIcon from "../../assets/icons/search.svg";
import LocationIcon from "../../assets/icons/locations.svg";
import { api } from "../../lib/api";
import { EmptyState } from "../../components/primitives";

// ─── Types ────────────────────────────────────────────────────────────────────

type VenueResult = {
  id: number;
  name: string;
  type: string;
  address?: string;
  distance?: string;
  score?: number | string;
  score_display?: string;
  cover?: string | null;
};

// ─── Recent storage ───────────────────────────────────────────────────────────

const RECENT_KEY = "lokl_recent_venues";
const MAX_RECENT = 10;

async function loadRecent(): Promise<VenueResult[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveRecent(venue: VenueResult) {
  try {
    const prev = await loadRecent();
    const filtered = prev.filter((v) => v.id !== venue.id);
    const updated = [venue, ...filtered].slice(0, MAX_RECENT);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

// ─── Categories ───────────────────────────────────────────────────────────────

const MANHATTAN = { lat: 40.7831, lng: -73.9712 };

type CategoryEntry = {
  id: string;
  label: string;
  type: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const CATEGORIES: CategoryEntry[] = [
  { id: "1", label: "Boxing &\nCombat",        type: "Boxing & Combat",      icon: "fitness-outline" },
  { id: "2", label: "Yoga &\nPilates",         type: "Yoga & Pilates",       icon: "leaf-outline" },
  { id: "3", label: "Strength &\nCrossFit",    type: "Strength & CrossFit",  icon: "barbell-outline" },
  { id: "4", label: "Court\nSports",           type: "Court Sports",         icon: "basketball-outline" },
  { id: "5", label: "Cycling &\nCardio",       type: "Cycling & Cardio",     icon: "bicycle-outline" },
  { id: "6", label: "Outdoor &\nAdventure",    type: "Outdoor & Adventure",  icon: "compass-outline" },
  { id: "7", label: "Classes &\nStudios",      type: "Classes & Studios",    icon: "school-outline" },
  { id: "8", label: "Wellness &\nRecovery",    type: "Wellness & Recovery",  icon: "heart-outline" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");               // text typed in the Location box
  const [hoods, setHoods] = useState<string[]>([]);              // neighborhoods picked from the dropdown
  const [hoodOpen, setHoodOpen] = useState(false);
  const [keyboardUp, setKeyboardUp] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [results, setResults] = useState<VenueResult[]>([]);
  const [recentVenues, setRecentVenues] = useState<VenueResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recently visited on mount
  useEffect(() => {
    loadRecent().then(setRecentVenues);
  }, []);

  // Swiping the keyboard down shows the recently visited venues.
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardUp(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardUp(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const searchVenues = useCallback(async (q: string, types: string[], neighborhoods: string[]) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        lat: MANHATTAN.lat,
        lng: MANHATTAN.lng,
        radius_km: 4000,
      };
      if (q.trim()) params.search = q.trim();
      if (types.length) params.type = types.join(",");
      if (neighborhoods.length) params.neighborhood = neighborhoods.join(",");

      const res = await api.get("/venues/", { params });
      const raw = res.data?.data ?? res.data;
      const list: VenueResult[] = Array.isArray(raw?.venues)
        ? raw.venues
        : Array.isArray(raw?.results)
        ? raw.results
        : Array.isArray(raw)
        ? raw
        : [];
      setResults(list);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchVenues(query, categories, hoods);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, categories, hoods, searchVenues]);

  const handleCategoryPress = (type: string) => {
    setCategories((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const hoodMatches = NEIGHBORHOODS.filter(
    (n) => !hoods.includes(n) && n.toLowerCase().includes(location.trim().toLowerCase())
  );
  const pickHood = (n: string) => {
    setHoods((prev) => (prev.includes(n) ? prev : [...prev, n]));
    setLocation("");
    setHoodOpen(false);
  };

  const handleVenuePress = (item: VenueResult) => {
    saveRecent(item);
    setRecentVenues((prev) => {
      const filtered = prev.filter((v) => v.id !== item.id);
      return [item, ...filtered].slice(0, MAX_RECENT);
    });
    router.push(`/home/details?id=${item.id}`);
  };

  const isSearching = !!(query || categories.length || hoods.length);
  // Keyboard down (or nothing searched yet): show where the user has been recently.
  const showRecent = recentVenues.length > 0 && (!isSearching || (!keyboardUp && results.length === 0));

  const renderResult = ({ item }: { item: VenueResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      activeOpacity={0.85}
      onPress={() => handleVenuePress(item)}
    >
      <View style={styles.resultLeft}>
        {item.cover ? (
          <Image source={{ uri: item.cover }} style={styles.resultThumb} resizeMode="cover" />
        ) : (
          <View style={[styles.resultThumb, styles.resultThumbPlaceholder]}>
            <LocationIcon width={18} height={18} color={Colors.textSecondary} />
          </View>
        )}
        {!!item.distance && (
          <Text style={styles.resultDistance}>{item.distance}</Text>
        )}
      </View>

      <View style={styles.resultMid}>
        <View style={styles.resultTitleRow}>
          <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
          {!!(item.score_display ?? item.score) && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>
                {item.score_display ?? Number(item.score).toFixed(1)}/10
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.resultLocation} numberOfLines={1}>
          {item.type}{item.address ? ` · ${item.address}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <SearchIcon width={18} height={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search venues..."
            placeholderTextColor={Colors.textSecondary}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Location Bar: type a neighborhood, then pick it from the dropdown (several allowed) */}
        <View style={styles.locationBar}>
          <LocationIcon width={16} height={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={location}
            onChangeText={(t) => { setLocation(t); setHoodOpen(true); }}
            onFocus={() => setHoodOpen(true)}
            placeholder={hoods.length ? "Add another neighborhood..." : "Neighborhood..."}
            placeholderTextColor={Colors.textSecondary}
            returnKeyType="done"
            onSubmitEditing={() => { if (hoodMatches[0]) pickHood(hoodMatches[0]); }}
          />
          <TouchableOpacity onPress={() => setHoodOpen((o) => !o)} hitSlop={8}>
            <Ionicons name={hoodOpen ? "chevron-up" : "chevron-down"} size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {hoods.length > 0 && (
          <View style={styles.hoodChips}>
            {hoods.map((n) => (
              <TouchableOpacity key={n} style={styles.hoodChip} onPress={() => setHoods((p) => p.filter((x) => x !== n))}>
                <Text style={styles.hoodChipText}>{n}</Text>
                <Ionicons name="close" size={14} color={Colors.black} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {hoodOpen && (
          <View style={styles.hoodDropdown}>
            <FlatList keyboardDismissMode="on-drag"
              data={hoodMatches}
              keyExtractor={(n) => n}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 220 }}
              ListEmptyComponent={<Text style={styles.hoodEmpty}>No neighborhood matches</Text>}
              renderItem={({ item: n }) => (
                <TouchableOpacity style={styles.hoodRow} onPress={() => pickHood(n)}>
                  <Text style={styles.hoodRowText}>{n}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Categories */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Choose Categories</Text>
          <FlatList keyboardDismissMode="on-drag"
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item: cat }) => {
              const isActive = categories.includes(cat.type);
              const iconColor = isActive ? Colors.primary : Colors.textSecondary;
              return (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(cat.type)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconWrap, isActive && styles.categoryIconActive]}>
                    <CategoryIcon type={cat.type} size={22} color={iconColor} />
                  </View>
                  <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Recently visited (keyboard down) or the search results; scrolls either way */}
        {loading && !showRecent ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : (
          <FlatList keyboardDismissMode="on-drag"
            data={showRecent ? recentVenues : results}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderResult}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultList}
            ListHeaderComponent={
              showRecent ? (
                <View style={styles.recentHeader}>
                  <Text style={styles.sectionTitle}>Recently Visited</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      await AsyncStorage.removeItem(RECENT_KEY);
                      setRecentVenues([]);
                    }}
                    hitSlop={8}
                  >
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.sectionTitle}>{isSearching ? "Results" : "Nearby Venues"}</Text>
              )
            }
            ListEmptyComponent={
              isSearching ? (
                <EmptyState icon="search-outline" title="No venues found" subtitle="Try a different search term" />
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hoodChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  hoodChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.primary, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6,
  },
  hoodChipText: { color: Colors.black, fontSize: 13, fontWeight: "600" },
  hoodDropdown: {
    backgroundColor: "#2E3A3F", borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder,
    marginBottom: 12, overflow: "hidden",
  },
  hoodRow: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.cardBorder },
  hoodRowText: { color: Colors.text, fontSize: 14 },
  hoodEmpty: { color: Colors.textSecondary, fontSize: 13, padding: 16, textAlign: "center" },
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20 },

  headerRow: {
    paddingTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },

  searchBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#2E3A3F",
    borderRadius: 24, height: 48,
    paddingHorizontal: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.cardBorder,
    marginBottom: 20,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14 },
  locationBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#2E3A3F",
    borderRadius: 24, height: 48,
    paddingHorizontal: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.cardBorder,
    marginBottom: 20,
  },

  categorySection: { marginBottom: 20 },
  categoryTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: "500", marginBottom: 14 },
  categoryList: { gap: 12, paddingRight: 8 },
  categoryItem: { alignItems: "center", gap: 4, width: 68 },
  categoryIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },
  categoryIconActive: { borderColor: Colors.primary },
  categoryLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: "500", textAlign: "center", lineHeight: 14 },
  categoryLabelActive: { color: Colors.primary },

  recentSection: { marginBottom: 8 },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  clearText: { color: Colors.textSecondary, fontSize: 13 },

  sectionTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: "500", marginBottom: 14 },
  resultList: { paddingBottom: 100 },

  resultItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: 16,
    paddingVertical: 10, paddingLeft: 10, paddingRight: 12,
    gap: 12, marginBottom: 10,
  },
  resultLeft: { alignItems: "center", gap: 4 },
  resultThumb: { width: 48, height: 48, borderRadius: 10 },
  resultThumbPlaceholder: {
    backgroundColor: Colors.background,
    justifyContent: "center", alignItems: "center",
  },
  resultDistance: { color: Colors.textSecondary, fontSize: 10 },
  resultMid: { flex: 1, minWidth: 0 },
  resultTitleRow: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 4, flexWrap: "wrap",
  },
  resultName: { color: Colors.text, fontSize: 15, fontWeight: "700", flexShrink: 1 },
  resultLocation: { color: Colors.textSecondary, fontSize: 13 },
  ratingBadge: {
    borderWidth: 1, borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
  },
  ratingBadgeText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600" },
  navigateBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },
});
