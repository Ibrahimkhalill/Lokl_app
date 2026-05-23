import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { api } from "../../lib/api";
import FilterIcon from "../../assets/icons/filter.svg";

const { width, height } = Dimensions.get("window");

const MANHATTAN_REGION = {
  latitude: 40.7831,
  longitude: -73.9712,
  latitudeDelta: 0.05,
  longitudeDelta: 0.03,
};

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a1f2e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#1a1f2e" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#1a1f2e" }],
  },
];

interface VenuePin {
  id: number;
  name: string;
  score: number;
  score_display: string;
  icon: string;
  lat: number;
  lng: number;
  type: string;
  distance: string;
  cover: string | null;
  ratings_count: number;
  price_level: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type?: string;
    min_rating?: string;
    price_level?: string;
    amenities?: string;
    plan_tier?: string;
    radius_km?: string;
  }>();

  const mapRef = useRef<MapView>(null);
  const [venues, setVenues] = useState<VenuePin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Load venues whenever filter params change
  useEffect(() => {
    loadVenues();
  }, [
    params.type,
    params.min_rating,
    params.price_level,
    params.amenities,
    params.plan_tier,
    params.radius_km,
  ]);

  async function loadVenues() {
    setLoading(true);
    try {
      const queryParams: Record<string, any> = {};
      if (params.type)        queryParams.type        = params.type;
      if (params.min_rating)  queryParams.min_rating  = params.min_rating;
      if (params.price_level) queryParams.price_level = params.price_level;
      if (params.amenities)   queryParams.amenities   = params.amenities;
      if (params.plan_tier)   queryParams.plan_tier   = params.plan_tier;

      // Always filter by location — default Manhattan center, 5 km radius.
      // User can override radius via the Filters screen (radius_km param).
      queryParams.lat       = MANHATTAN_REGION.latitude;
      queryParams.lng       = MANHATTAN_REGION.longitude;
      queryParams.radius_km = params.radius_km ?? "4000";

      const res = await api.get("/venues/", { params: queryParams });
      // API returns { data: { venues: [...], pagination: {...} } }
      const all: VenuePin[] = Array.isArray(res.data?.data?.venues)
        ? res.data.data.venues
        : [];

      // 1 venue per category — safest for Android (14 categories = 14 markers max)
      const byType: Record<string, VenuePin> = {};
      for (const v of all) {
        if (
          byType[v.type] === undefined &&
          v.lat != null && v.lng != null &&
          !isNaN(parseFloat(String(v.lat))) &&
          !isNaN(parseFloat(String(v.lng)))
        ) {
          byType[v.type] = v;
        }
      }
      const data: VenuePin[] = Object.values(byType).map((v) => ({
        ...v,
        lat: parseFloat(String(v.lat)),   // ensure number — API returns strings
        lng: parseFloat(String(v.lng)),
      }));

      setVenues(data);
      if (data.length > 0) setSelectedId(data[0].id);
    } catch (err) {
      console.error("[HomeScreen] loadVenues error:", err);
    } finally {
      setLoading(false);
    }
  }

  // fitMapToVenues removed — fitToCoordinates crashes on Android with custom markers.
  // Map uses fixed initialRegion (Manhattan) instead.
  const fitMapToVenues = useCallback(() => {}, []);

  const selectedVenue = venues.find((v) => v.id === selectedId);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={MANHATTAN_REGION}
        onMapReady={() => setMapReady(true)}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsBuildings={false}
        showsTraffic={false}
      >
        {venues.map((pin) => {
          const isSelected = selectedId === pin.id;
          return (
            <Marker
              key={String(pin.id)}
              coordinate={{ latitude: Number(pin.lat), longitude: Number(pin.lng) }}
              onPress={() => setSelectedId(pin.id)}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              {/* markerOuter has fixed width so Android allocates correct space */}
              <View collapsable={false} style={styles.markerOuter}>
                <View style={[styles.mapPill, isSelected && styles.mapPillSelected]}>
                  <Ionicons
                    name={pin.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={isSelected ? Colors.black : Colors.white}
                  />
                  <Text
                    style={[
                      styles.mapPillScore,
                      isSelected && styles.mapPillScoreSelected,
                    ]}
                  >
                    {pin.score_display}
                  </Text>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Search Bar overlay */}
      <SafeAreaView style={styles.topSafe} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push("/home/search")}
            activeOpacity={0.9}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={"rgba(187, 198, 224, 1)"}
            />
            <Text style={styles.searchPlaceholder}>Search venues</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => router.push("/home/filters")}
          >
            <FilterIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Venue Card */}
      <View style={styles.venueSheet}>
        {loading ? (
          <View style={[styles.venueCard, styles.centeredCard]}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Finding venues near you…</Text>
          </View>
        ) : !selectedVenue ? (
          <View style={[styles.venueCard, styles.centeredCard]}>
            <Ionicons name="search-outline" size={32} color={Colors.textSecondary} />
            <Text style={styles.loadingText}>No venues found</Text>
          </View>
        ) : (
          <View style={styles.venueCard}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() =>
                router.push(`/home/details?id=${selectedVenue.id}&distance=${encodeURIComponent(selectedVenue.distance ?? "")}`)
              }
            >
              {/* Cover image */}
              <View style={styles.venueImageWrap}>
                {selectedVenue.cover ? (
                  <Image
                    source={{ uri: selectedVenue.cover }}
                    style={styles.venueImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.venueImage, styles.noImagePlaceholder]}>
                    <Ionicons
                      name={selectedVenue.icon as any}
                      size={48}
                      color={Colors.textSecondary}
                    />
                  </View>
                )}
                {!!selectedVenue.distance && (
                  <View style={styles.distanceBadge}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color={Colors.text}
                    />
                    <Text style={styles.distanceText}>
                      {selectedVenue.distance}
                    </Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={styles.venueInfo}>
                <Text style={styles.venueName} numberOfLines={1}>
                  {selectedVenue.name.toUpperCase()}
                </Text>
                <View style={styles.venueMeta}>
                  <View style={styles.scoreChip}>
                    <Text style={styles.scoreText}>
                      {Number(selectedVenue.score).toFixed(1)}
                    </Text>
                  </View>
                  {selectedVenue.ratings_count > 0 && (
                    <Text style={styles.venueMetaText}>
                      ({selectedVenue.ratings_count.toLocaleString()} ratings)
                    </Text>
                  )}
                  <View style={styles.dot} />
                  <Text style={styles.venueMetaText}>{selectedVenue.type}</Text>
                  {!!selectedVenue.price_level && (
                    <>
                      <View style={styles.dot} />
                      <Text style={styles.venueMetaText}>
                        {selectedVenue.price_level}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.venueActions}>
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() =>
                  router.push(`/home/details?id=${selectedVenue.id}&distance=${encodeURIComponent(selectedVenue.distance ?? "")}`)
                }
                activeOpacity={0.85}
              >
                <Text style={styles.detailsBtnText}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() =>
                  router.push(`/home/post?venueId=${selectedVenue.id}`)
                }
                activeOpacity={0.85}
              >
                <Text style={styles.reviewBtnText}>Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  map: { width, height },

  topSafe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(187, 198, 224, 0.1)",
    borderRadius: 50,
    height: 48,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(187, 198, 224, 1)",
  },
  searchPlaceholder: { color: "rgba(187, 198, 224, 1)", fontSize: 15 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(187, 198, 224, 1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(187, 198, 224, 1)",
  },

  mapPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.black,
    borderRadius: 20,          // NOT 999 — Android clips content when radius > height/2
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  // Fixed-width outer wrapper — Android measures this first, inner pill renders inside it
  markerOuter: {
    width: 80,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPillSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  mapPillScore: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  mapPillScoreSelected: { color: Colors.black },

  venueSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 450,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
  },

  venueCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  centeredCard: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },

  venueImageWrap: {
    position: "relative",
    height: 160,
    overflow: "hidden",
  },
  venueImage: { width: "100%", height: "100%" },
  noImagePlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  distanceBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  distanceText: {
    color: "rgba(187, 198, 224, 1)",
    fontSize: 12,
    fontWeight: "600",
  },

  venueInfo: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  venueName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  venueMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  scoreChip: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scoreText: { color: Colors.black, fontSize: 13, fontWeight: "800" },
  venueMetaText: { color: Colors.textSecondary, fontSize: 13 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
  },

  venueActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  detailsBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsBtnText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  reviewBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewBtnText: { color: Colors.black, fontSize: 15, fontWeight: "700" },
});
