import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { api } from "../../lib/api";
import LocationIcon from "../../assets/icons/locations.svg";
import SearchIcon from "../../assets/icons/search.svg";

const MANHATTAN = { lat: 40.7831, lng: -73.9712 };

type VenueResult = {
  id: number;
  name: string;
  address?: string;
  city?: string;
  type?: string;
  cover?: string | null;
};

export default function PostVenueSearch() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VenueResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchVenues = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/venues/", {
        params: {
          search: q.trim(),
          lat: MANHATTAN.lat,
          lng: MANHATTAN.lng,
          radius_km: 4000,
          page_size: 30,
        },
      });
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

  const onChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchVenues(text), 300);
  };

  const selectVenue = (venue: VenueResult) => {
    Keyboard.dismiss();
    router.push({
      pathname: "/home/post" as any,
      params: {
        venueId: String(venue.id),
        venueName: venue.name,
        venueAddress: venue.address ?? "",
      },
    });
  };

  const renderItem = ({ item }: { item: VenueResult }) => {
    const subtitle = item.address ?? item.type ?? "Venue";
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.8}
        onPress={() => selectVenue(item)}
      >
        <View style={styles.thumbWrap}>
          {item.cover ? (
            <Image source={{ uri: item.cover }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <LocationIcon width={20} height={20} color={Colors.textSecondary} />
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemSub} numberOfLines={1}>{subtitle}</Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search for a venue</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <SearchIcon width={18} height={18} color={Colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={onChangeText}
            placeholder="e.g. SoulCycle West Village"
            placeholderTextColor={Colors.textSecondary}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setResults([]); }}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              query.trim() ? (
                <Text style={styles.emptyText}>{'No venues found for "' + query + '"'}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  searchBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 24, height: 52,
    paddingHorizontal: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.cardBorder,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15 },

  listContent: { paddingTop: 8, paddingBottom: 120 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  thumbWrap: {},
  thumb: { width: 48, height: 48, borderRadius: 10 },
  thumbPlaceholder: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center", alignItems: "center",
  },

  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 3,
  },
  itemSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    flexShrink: 1,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});
