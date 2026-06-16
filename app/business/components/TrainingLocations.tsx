import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/colors";
import { sharedStyles } from "./sharedStyles";
import { businessService } from "../../../services/businessService";
import { getErrorMessage, api } from "../../../lib/api";
import { TrainingLocation } from "./types";
import LocationsIcon from "../../../assets/icons/locations.svg";

interface Props {
  locations: TrainingLocation[];
  isOwner: boolean;
  businessProfileId: number;
  onUpdate: () => void;
}

interface VenueResult {
  id: number;
  name: string;
  address?: string;
}

function VenueRow({
  venue,
  addingId,
  onAdd,
}: {
  venue: VenueResult;
  addingId: number | null;
  onAdd: (id: number) => void;
}) {
  return (
    <View style={styles.venueRow}>
      <View style={sharedStyles.infoIconWrap}>
        <LocationsIcon width={18} height={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.venueName}>{venue.name}</Text>
        {!!venue.address && (
          <Text style={styles.venueAddress}>{venue.address}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => onAdd(venue.id)}
        disabled={addingId === venue.id}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {addingId === venue.id ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
        )}
      </TouchableOpacity>
    </View>
  );
}

export function TrainingLocations({
  locations,
  isOwner,
  businessProfileId,
  onUpdate,
}: Props) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VenueResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<VenueResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (!isOwner && locations.length === 0) return null;

  const addedIds = new Set(locations.map((l) => l.venue));

  function parseVenues(data: any): VenueResult[] {
    const payload = data?.data ?? data;
    return Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.venues)
      ? payload.venues
      : Array.isArray(payload?.results)
      ? payload.results
      : [];
  }

  const openSearch = async () => {
    setQuery("");
    setResults([]);
    setModalVisible(true);
    setLoadingSuggestions(true);
    try {
      const res = await api.get("/venues/", { params: { page_size: 15 } });
      setSuggestions(parseVenues(res.data).filter((v) => !addedIds.has(v.id)));
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setQuery("");
    setResults([]);
  };

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get("/venues/", {
        params: { search: q, page_size: 20 },
      });
      setResults(parseVenues(res.data));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddVenue = async (venueId: number) => {
    setAddingId(venueId);
    try {
      await businessService.addTrainingLocation(businessProfileId, venueId);
      closeModal();
      onUpdate();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setAddingId(null);
    }
  };

  const handleDeleteLocation = async (lid: number) => {
    Alert.alert(
      "Remove Location",
      "Remove this training location from your profile?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setDeletingId(lid);
            try {
              await businessService.deleteTrainingLocation(businessProfileId, lid);
              onUpdate();
            } catch (err) {
              Alert.alert("Error", getErrorMessage(err));
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <View style={sharedStyles.sectionHeaderRow}>
        <Text style={sharedStyles.sectionHeader}>Training Locations</Text>
        {isOwner && (
          <TouchableOpacity
            style={sharedStyles.sectionAddBtn}
            onPress={openSearch}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={sharedStyles.sectionAddBtnText}>Add Venue</Text>
          </TouchableOpacity>
        )}
      </View>

      {locations.length === 0 && isOwner && (
        <TouchableOpacity
          style={sharedStyles.addPlaceholder}
          onPress={openSearch}
          activeOpacity={0.8}
        >
          <View style={sharedStyles.addPlaceholderIcon}>
            <LocationsIcon width={26} height={26} color={Colors.primary} />
          </View>
          <Text style={sharedStyles.addPlaceholderTitle}>Add Training Venues</Text>
          <Text style={sharedStyles.addPlaceholderText}>
            Link the spots where you train clients
          </Text>
        </TouchableOpacity>
      )}

      {locations.map((loc) => (
        <View key={loc.id} style={sharedStyles.infoCard}>
          <View style={sharedStyles.infoIconWrap}>
            <LocationsIcon width={20} height={20} color={Colors.primary} />
          </View>

          <TouchableOpacity
            style={sharedStyles.infoContent}
            activeOpacity={loc.venue ? 0.75 : 1}
            onPress={() => {
              if (loc.venue) {
                router.push(`/home/details?id=${loc.venue}` as any);
              }
            }}
          >
            <Text style={sharedStyles.infoValue}>{loc.venue_name}</Text>
            {!!loc.venue_address && (
              <Text style={sharedStyles.infoLabel}>{loc.venue_address}</Text>
            )}
            {!!loc.note && (
              <Text style={sharedStyles.infoLabel}>{loc.note}</Text>
            )}
          </TouchableOpacity>

          {isOwner ? (
            <TouchableOpacity
              onPress={() => handleDeleteLocation(loc.id)}
              disabled={deletingId === loc.id}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {deletingId === loc.id ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              )}
            </TouchableOpacity>
          ) : loc.venue ? (
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          ) : null}
        </View>
      ))}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent={Platform.OS === "android"}
      >
        <Pressable style={styles.backdrop} onPress={closeModal} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={sharedStyles.modalTitle}>Find a Venue</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchBarWrap}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={handleSearch}
                placeholder="Search venues…"
                placeholderTextColor={Colors.textMuted}
                autoCorrect={false}
                returnKeyType="search"
              />
              {searching && <ActivityIndicator size="small" color={Colors.primary} />}
            </View>
          </View>

          {/* Results */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
          >
            {!searching && query.trim() !== "" && results.length === 0 && (
              <View style={styles.emptyResults}>
                <Ionicons name="location-outline" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyResultsText}>No venues found</Text>
              </View>
            )}

            {query.trim() !== "" &&
              results.map((venue) => (
                <VenueRow
                  key={venue.id}
                  venue={venue}
                  addingId={addingId}
                  onAdd={handleAddVenue}
                />
              ))}

            {query.trim() === "" && (
              <>
                {loadingSuggestions ? (
                  <ActivityIndicator style={{ marginTop: 24 }} color={Colors.primary} />
                ) : (
                  <>
                    {suggestions.length > 0 && (
                      <Text style={styles.sectionLabel}>Suggested Venues</Text>
                    )}
                    {suggestions.map((venue) => (
                      <VenueRow
                        key={venue.id}
                        venue={venue}
                        addingId={addingId}
                        onAdd={handleAddVenue}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "62%",
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBarWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14, padding: 0 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  venueName: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  venueAddress: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  emptyResults: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyResultsText: { color: Colors.textMuted, fontSize: 14 },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 4,
    marginBottom: 4,
  },
});
