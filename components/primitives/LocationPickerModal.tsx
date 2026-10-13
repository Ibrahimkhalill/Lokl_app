import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import * as ExpoLocation from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { api } from "../../lib/api";

// Location search goes through our backend (Google Places API New) — no Google key in the app.
function unwrap<T>(res: { data: any }): T {
  return (res.data?.data ?? res.data) as T;
}

export interface LocationResult {
  address: string;
  latitude: number;
  longitude: number;
}

interface Prediction {
  place_id: string;
  description: string;
  isNearby?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (result: LocationResult) => void;
}

export function LocationPickerModal({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch user location + nearby places when modal opens
  useEffect(() => {
    if (!visible) return;
    setQuery("");
    setPredictions([]);
    fetchNearby();
  }, [visible]);

  const fetchNearby = async () => {
    setLoadingNearby(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      setUserCoords({ lat: latitude, lng: longitude });

      const res = await api.get("/venues/places/nearby/", { params: { lat: latitude, lng: longitude } });
      const places = unwrap<Prediction[]>(res) ?? [];
      setNearbyPlaces(places.slice(0, 8).map((p) => ({ ...p, isNearby: true })));
    } catch {
      // silently fail — user can still search manually
    } finally {
      setLoadingNearby(false);
    }
  };

  const searchPlaces = useCallback(async (text: string) => {
    if (!text.trim()) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, string | number> = { input: text };
      if (userCoords) {
        params.lat = userCoords.lat;
        params.lng = userCoords.lng;
      }
      const res = await api.get("/venues/places/autocomplete/", { params });
      setPredictions(unwrap<Prediction[]>(res) ?? []);
    } catch {
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, [userCoords]);

  function handleChangeText(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(text), 350);
  }

  async function handleSelect(prediction: Prediction) {
    setFetchingDetails(prediction.place_id);
    try {
      const res = await api.get(`/venues/places/${encodeURIComponent(prediction.place_id)}/`);
      const loc = unwrap<LocationResult>(res);
      onSelect({
        address: loc.address || prediction.description,
        latitude: loc.latitude ?? 0,
        longitude: loc.longitude ?? 0,
      });
      handleClose();
    } catch {
      onSelect({ address: prediction.description, latitude: 0, longitude: 0 });
      handleClose();
    } finally {
      setFetchingDetails(null);
    }
  }

  function handleClose() {
    setQuery("");
    setPredictions([]);
    onClose();
  }

  const displayList = query.trim() ? predictions : nearbyPlaces;
  const showNearbyLabel = !query.trim() && nearbyPlaces.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <Text style={styles.title}>Search Location</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search input */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Type an address or place name..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={handleChangeText}
            autoFocus
            autoCorrect={false}
            selectionColor={Colors.primary}
          />
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : query.length > 0 ? (
            <TouchableOpacity onPress={() => { setQuery(""); setPredictions([]); }} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Nearby label */}
        {showNearbyLabel && (
          <View style={styles.sectionLabelRow}>
            <Ionicons name="navigate-circle-outline" size={15} color={Colors.primary} />
            <Text style={styles.sectionLabel}>Nearby Places</Text>
          </View>
        )}

        {/* Loading nearby */}
        {loadingNearby && !query.trim() ? (
          <View style={styles.nearbyLoading}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.nearbyLoadingText}>Finding nearby places…</Text>
          </View>
        ) : (
          <FlatList
            data={displayList}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              query.length > 2 && !loading ? (
                <Text style={styles.emptyText}>No results found.</Text>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
                disabled={fetchingDetails !== null}
              >
                <View style={styles.pinIconWrap}>
                  <Ionicons
                    name={item.isNearby ? "location" : "location-outline"}
                    size={18}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.resultText} numberOfLines={2}>
                  {item.description}
                </Text>
                {fetchingDetails === item.place_id ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 8 }} />
                ) : null}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "75%",
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: Colors.cardBorder,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  title: { color: Colors.text, fontSize: 16, fontWeight: "600" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    height: 44,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14, height: "100%" },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sectionLabel: { color: Colors.primary, fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  nearbyLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  nearbyLoadingText: { color: Colors.textSecondary, fontSize: 14 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  pinIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(209,255,0,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  resultText: { flex: 1, color: Colors.text, fontSize: 14, lineHeight: 20 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: 32 },
});
