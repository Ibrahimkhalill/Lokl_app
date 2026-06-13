import React, { useState, useRef, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { reviewedVenueStore } from "../../lib/reviewedVenueStore";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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

// Rough bounding box for the contiguous USA + Alaska + Hawaii
function isInUSA(lat: number, lng: number): boolean {
  // Contiguous US
  if (lat >= 24.5 && lat <= 49.5 && lng >= -125.0 && lng <= -66.9) return true;
  // Alaska
  if (lat >= 54.0 && lat <= 71.5 && lng >= -168.0 && lng <= -141.0) return true;
  // Hawaii
  if (lat >= 18.9 && lat <= 22.2 && lng >= -160.3 && lng <= -154.8) return true;
  return false;
}

// Uber-style dark map — matched to app's #14161A charcoal palette
const DARK_MAP_STYLE = [
  // Base land — app background color
  { elementType: "geometry",            stylers: [{ color: "#14161A" }] },
  { elementType: "labels.text.stroke",  stylers: [{ color: "#14161A" }] },
  { elementType: "labels.text.fill",    stylers: [{ color: "#6B7280" }] },
  // Roads — slightly lighter than background
  { featureType: "road",                elementType: "geometry",        stylers: [{ color: "#1E2128" }] },
  { featureType: "road",                elementType: "geometry.stroke", stylers: [{ color: "#2A2D35" }] },
  { featureType: "road",                elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
  // Highways a bit brighter
  { featureType: "road.highway",        elementType: "geometry",        stylers: [{ color: "#252830" }] },
  { featureType: "road.highway",        elementType: "geometry.stroke", stylers: [{ color: "#2A2D35" }] },
  // Local roads thin
  { featureType: "road.local",          elementType: "geometry",        stylers: [{ color: "#1A1D23" }] },
  // Water — darker than land for contrast
  { featureType: "water",               elementType: "geometry",        stylers: [{ color: "#0C0E11" }] },
  { featureType: "water",               elementType: "labels.text.fill", stylers: [{ color: "#3B4550" }] },
  // Parks — very dark green
  { featureType: "poi.park",            elementType: "geometry",        stylers: [{ color: "#141A14" }] },
  { featureType: "poi.park",            elementType: "labels.text.fill", stylers: [{ color: "#3D5C3D" }] },
  // All other POI hidden — no restaurant/store clutter
  { featureType: "poi",                 elementType: "geometry",        stylers: [{ color: "#1A1D23" }] },
  { featureType: "poi",                 elementType: "labels",          stylers: [{ visibility: "off" }] },
  // Transit hidden
  { featureType: "transit",             elementType: "geometry",        stylers: [{ color: "#1A1D23" }] },
  { featureType: "transit",             elementType: "labels",          stylers: [{ visibility: "off" }] },
  // Admin borders using card border color
  { featureType: "administrative",      elementType: "geometry",        stylers: [{ color: "#2A2D35" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
  // Neighborhood labels hidden
  { featureType: "administrative.neighborhood", elementType: "labels", stylers: [{ visibility: "off" }] },
];

const TYPE_ICON: Record<string, string> = {
  // Sports & Fitness
  cricket:    "baseball-outline",
  football:   "american-football-outline",
  soccer:     "football-outline",
  basketball: "basketball-outline",
  tennis:     "tennisball-outline",
  baseball:   "baseball-outline",
  gym:        "barbell-outline",
  fitness:    "fitness-outline",
  yoga:       "body-outline",
  sports:     "trophy-outline",
  // Food & Drink
  restaurant: "restaurant-outline",
  bar:        "wine-outline",
  cafe:       "cafe-outline",
  coffee:     "cafe-outline",
  pizza:      "pizza-outline",
  food:       "fast-food-outline",
  bakery:     "storefront-outline",
  // Entertainment
  museum:     "business-outline",
  art:        "color-palette-outline",
  gallery:    "color-palette-outline",
  theater:    "film-outline",
  cinema:     "film-outline",
  music:      "musical-notes-outline",
  club:       "musical-note-outline",
  // Nature & Outdoors
  park:       "leaf-outline",
  zoo:        "paw-outline",
  beach:      "umbrella-outline",
  garden:     "flower-outline",
  // Shopping & Services
  shopping:   "bag-outline",
  market:     "storefront-outline",
  spa:        "sparkles-outline",
  hotel:      "bed-outline",
};

function getVenueIcon(type: string, fallback: string): string {
  if (!type) return fallback || "location-outline";
  const key = type.toLowerCase().replace(/[^a-z]/g, "");
  for (const [k, icon] of Object.entries(TYPE_ICON)) {
    if (key.includes(k) || k.includes(key)) return icon;
  }
  return fallback || "location-outline";
}

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

const TAB_BAR_HEIGHT = 65;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const [cardFriends, setCardFriends] = useState<{ id: number; name: string; profile_picture: string | null }[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [tracksChanges, setTracksChanges] = useState(false);
  const tracksTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const [zoomRegion, setZoomRegion] = useState<typeof MANHATTAN_REGION | null>(null);

  // Request GPS on mount — store user region or fall back to Manhattan
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setZoomRegion(MANHATTAN_REGION);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = pos.coords;
        if (!isInUSA(latitude, longitude)) {
          setZoomRegion(MANHATTAN_REGION);
          return;
        }
        userCoordsRef.current = { latitude, longitude };
        setZoomRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.03 });
      } catch {
        setZoomRegion(MANHATTAN_REGION);
      }
    })();
  }, []);

  // Zoom to location once map is ready and we have a region
  useEffect(() => {
    if (mapReady && zoomRegion) {
      mapRef.current?.animateToRegion(zoomRegion, 800);
    }
  }, [mapReady, zoomRegion]);

  const selectVenue = useCallback((id: number) => {
    if (tracksTimerRef.current) clearTimeout(tracksTimerRef.current);
    setTracksChanges(true);
    setSelectedId(id);
    tracksTimerRef.current = setTimeout(() => setTracksChanges(false), 400);
  }, []);

  // On focus: patch only the venue that was just reviewed (no full reload)
  useFocusEffect(
    useCallback(() => {
      const venueId = reviewedVenueStore.consume();
      if (!venueId) return;
      api.get(`/venues/${venueId}/`).then((res) => {
        const v = res.data?.data ?? res.data;
        if (!v) return;
        setVenues((prev) =>
          prev.map((pin) =>
            pin.id === venueId
              ? { ...pin, score: v.score, score_display: v.score_display, ratings_count: v.ratings_count }
              : pin
          )
        );
        // Force marker bitmap to re-render with new score
        if (tracksTimerRef.current) clearTimeout(tracksTimerRef.current);
        setTracksChanges(true);
        tracksTimerRef.current = setTimeout(() => setTracksChanges(false), 500);
      }).catch(() => {});
    }, [])
  );

  // Re-zoom to location every time the user visits the home tab
  useFocusEffect(
    useCallback(() => {
      if (mapReady && zoomRegion) {
        mapRef.current?.animateToRegion(zoomRegion, 600);
      }
    }, [mapReady, zoomRegion])
  );

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

  async function loadVenues(attempt = 0) {
    setLoading(true);
    try {
      const queryParams: Record<string, any> = {};
      if (params.type)        queryParams.type        = params.type;
      if (params.min_rating)  queryParams.min_rating  = params.min_rating;
      if (params.price_level) queryParams.price_level = params.price_level;
      if (params.amenities)   queryParams.amenities   = params.amenities;
      if (params.plan_tier)   queryParams.plan_tier   = params.plan_tier;

      // Use GPS coords if available, otherwise fall back to Manhattan center.
      const center = userCoordsRef.current ?? MANHATTAN_REGION;
      queryParams.lat       = center.latitude;
      queryParams.lng       = center.longitude;
      queryParams.radius_km = params.radius_km ?? "4000";

      const res = await api.get("/venues/", { params: queryParams });
      const raw = res.data;
      console.log("[HomeScreen] venues raw keys:", JSON.stringify(Object.keys(raw ?? {})));
      // Handle multiple API response shapes
      const payload = raw?.data ?? raw;
      const all: VenuePin[] = Array.isArray(payload?.venues)
        ? payload.venues
        : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload)
        ? payload
        : [];

      const hasFilters =
        !!params.type || !!params.min_rating || !!params.price_level ||
        !!params.amenities || !!params.plan_tier || !!params.radius_km;

      let data: VenuePin[];

      if (hasFilters) {
        // Filters active — show every matching venue that has valid coords
        data = all
          .filter(
            (v) =>
              v.lat != null && v.lng != null &&
              !isNaN(parseFloat(String(v.lat))) &&
              !isNaN(parseFloat(String(v.lng)))
          )
          .map((v) => ({
            ...v,
            lat: parseFloat(String(v.lat)),
            lng: parseFloat(String(v.lng)),
          }));
      } else {
        // No filters — 1 venue per type to keep Android marker count manageable
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
        data = Object.values(byType).map((v) => ({
          ...v,
          lat: parseFloat(String(v.lat)),
          lng: parseFloat(String(v.lng)),
        }));
      }

      setVenues(data);
      if (data.length > 0) {
        setTracksChanges(true);
        setSelectedId(data[0].id);
        setTimeout(() => setTracksChanges(false), 400);
      }
    } catch (err: any) {
      const isNetworkErr = err?.message === "Network Error" || err?.code === "ERR_NETWORK";
      if (isNetworkErr && attempt < 2) {
        setTimeout(() => loadVenues(attempt + 1), 1200);
        return;
      }
      console.error("[HomeScreen] loadVenues error:", err);
    } finally {
      setLoading(false);
    }
  }

  // fitMapToVenues removed — fitToCoordinates crashes on Android with custom markers.
  // Map uses fixed initialRegion (Manhattan) instead.
  const fitMapToVenues = useCallback(() => {}, []);

  const selectedVenue = venues.find((v) => v.id === selectedId);

  useEffect(() => {
    if (!selectedId) { setCardFriends([]); return; }
    api.get(`/venues/${selectedId}/friends/`).then((res) => {
      const d = res.data?.data ?? res.data;
      setCardFriends(Array.isArray(d?.friends) ? d.friends : Array.isArray(d) ? d : []);
    }).catch(() => setCardFriends([]));
  }, [selectedId]);

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
              onPress={() => selectVenue(pin.id)}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={tracksChanges}
            >
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
            onPress={() =>
              router.push({
                pathname: "/home/filters",
                params: {
                  ...(params.type        && { type:        params.type }),
                  ...(params.min_rating  && { min_rating:  params.min_rating }),
                  ...(params.price_level && { price_level: params.price_level }),
                  ...(params.amenities   && { amenities:   params.amenities }),
                  ...(params.plan_tier   && { plan_tier:   params.plan_tier }),
                  ...(params.radius_km   && { radius_km:   params.radius_km }),
                },
              })
            }
          >
            <FilterIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Venue Card */}
      <View style={[styles.venueSheet, { paddingBottom: insets.bottom + TAB_BAR_HEIGHT }]}>
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
                      ({selectedVenue.ratings_count.toLocaleString()} {selectedVenue.ratings_count === 1 ? "rating" : "ratings"})
                    </Text>
                  )}
                  <View style={styles.dot} />
                  <Text style={styles.venueMetaText}>{selectedVenue.type}</Text>
                  {/* {!!selectedVenue.price_level && (
                    <>
                      <View style={styles.dot} />
                      <Text style={styles.venueMetaText}>
                        {selectedVenue.price_level}
                      </Text>
                    </>
                  )} */}
                </View>
              </View>

            {/* Friend Avatars */}
            {cardFriends.length > 0 && (
              <View style={styles.cardFriendsRow}>
                <View style={styles.cardFriendAvatars}>
                  {cardFriends.slice(0, 3).map((f, idx) => (
                    f.profile_picture ? (
                      <Image
                        key={f.id}
                        source={{ uri: f.profile_picture }}
                        style={[styles.cardFriendAvatar, { marginLeft: idx === 0 ? 0 : -10 }]}
                      />
                    ) : (
                      <View key={f.id} style={[styles.cardFriendAvatar, styles.cardFriendAvatarPlaceholder, { marginLeft: idx === 0 ? 0 : -10 }]}>
                        <Ionicons name="person" size={12} color={Colors.textSecondary} />
                      </View>
                    )
                  ))}
                </View>
                <Text style={styles.cardFriendsText}>
                  {cardFriends.length === 1
                    ? `${cardFriends[0].name} visited`
                    : `${cardFriends[0].name} + ${cardFriends.length - 1} friend${cardFriends.length - 1 > 1 ? "s" : ""} visited`}
                </Text>
              </View>
            )}

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
                  router.push(`/home/post?venueId=${selectedVenue.id}&venueName=${encodeURIComponent(selectedVenue.name)}&venueAddress=${encodeURIComponent((selectedVenue as any).address ?? "")}`)
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
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.black,
    borderRadius: 10,          // NOT 999 — Android clips content when radius > height/2
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  // Fixed-size outer wrapper — Android measures this first; give extra room so pill never clips
  markerOuter: {
    // width: 100,
    // height: 40,
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

  cardFriendsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  cardFriendAvatars: { flexDirection: "row" },
  cardFriendAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: Colors.card,
  },
  cardFriendAvatarPlaceholder: {
    backgroundColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  cardFriendsText: { color: Colors.textSecondary, fontSize: 11, flex: 1 },
});
