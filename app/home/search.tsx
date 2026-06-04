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
} from "react-native";
import type { SvgProps } from "react-native-svg";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchIcon from "../../assets/icons/search.svg";
import LocationIcon from "../../assets/icons/locations.svg";
import NavigateIcon from "../../assets/icons/navigate.svg";
import IconYoga from "../../assets/icons/hugeicons_yoga-02.svg";
import IconClimbing from "../../assets/icons/guidance_climbing-wall.svg";
import IconPilates from "../../assets/icons/guidance_pilates.svg";
import IconMedicalPhysio from "../../assets/icons/medical-icon_i-physical-therapy.svg";
import IconSurfing from "../../assets/icons/material-symbols-light_surfing-rounded.svg";
import IconCricket from "../../assets/icons/cricket.svg";
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

type CategoryIcon = React.FC<SvgProps>;
type CategoryEntry =
  | { id: string; label: string; type: string; kind: "svg"; Icon: CategoryIcon }
  | { id: string; label: string; type: string; kind: "ionicon"; name: React.ComponentProps<typeof Ionicons>["name"] };

const CATEGORIES: CategoryEntry[] = [
  { id: "1", label: "Yoga",       type: "Yoga",       kind: "svg", Icon: IconYoga },
  { id: "2", label: "Boxing",     type: "Boxing",     kind: "svg", Icon: IconMedicalPhysio },
  { id: "3", label: "Basketball", type: "Basketball", kind: "svg", Icon: IconSurfing },
  { id: "4", label: "Gym",        type: "Gym",        kind: "svg", Icon: IconClimbing },
  { id: "5", label: "Golf",       type: "Golf",       kind: "svg", Icon: IconPilates },
  { id: "6", label: "Cricket",    type: "Cricket",    kind: "svg", Icon: IconCricket },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<VenueResult[]>([]);
  const [recentVenues, setRecentVenues] = useState<VenueResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recently visited on mount
  useEffect(() => {
    loadRecent().then(setRecentVenues);
  }, []);

  const searchVenues = useCallback(async (q: string, type: string | null, loc: string) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        lat: MANHATTAN.lat,
        lng: MANHATTAN.lng,
        radius_km: 4000,
      };
      if (q.trim()) params.search = q.trim();
      if (type) params.type = type;
      if (loc.trim()) params.location = loc.trim();

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
      searchVenues(query, activeCategory, location);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, activeCategory, location, searchVenues]);

  const handleCategoryPress = (type: string) => {
    setActiveCategory((prev) => (prev === type ? null : type));
  };

  const handleVenuePress = (item: VenueResult) => {
    saveRecent(item);
    setRecentVenues((prev) => {
      const filtered = prev.filter((v) => v.id !== item.id);
      return [item, ...filtered].slice(0, MAX_RECENT);
    });
    router.push(`/home/details?id=${item.id}`);
  };

  const isSearching = !!(query || activeCategory || location);

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

      <TouchableOpacity
        style={styles.navigateBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => handleVenuePress(item)}
      >
        <NavigateIcon width={18} height={18} color={Colors.text} />
      </TouchableOpacity>
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

        {/* Location Bar */}
        <View style={styles.locationBar}>
          <LocationIcon width={16} height={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Location..."
            placeholderTextColor={Colors.textSecondary}
            returnKeyType="search"
          />
          {location.length > 0 && (
            <TouchableOpacity onPress={() => setLocation("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Choose Categories</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item: cat }) => {
              const isActive = activeCategory === cat.type;
              const iconColor = isActive ? Colors.primary : Colors.textSecondary;
              return (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(cat.type)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconWrap, isActive && styles.categoryIconActive]}>
                    {cat.kind === "svg" ? (
                      <cat.Icon width={22} height={22} color={iconColor} />
                    ) : (
                      <Ionicons name={cat.name} size={22} color={iconColor} />
                    )}
                  </View>
                  <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Recently Visited — shown only when not searching */}
        {!isSearching && recentVenues.length > 0 && (
          <View style={styles.recentSection}>
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
            {recentVenues.map((item) => (
              <React.Fragment key={item.id}>
                {renderResult({ item })}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Search Results / Nearby Venues — hidden when recently visited is showing */}
        {(!isSearching && recentVenues.length > 0) ? null : loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderResult}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultList}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>
                {isSearching ? "Results" : "Nearby Venues"}
              </Text>
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
  categoryList: { gap: 16, paddingRight: 8 },
  categoryItem: { alignItems: "center", gap: 4, width: 56 },
  categoryIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },
  categoryIconActive: { borderColor: Colors.primary },
  categoryLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: "500", textAlign: "center" },
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
