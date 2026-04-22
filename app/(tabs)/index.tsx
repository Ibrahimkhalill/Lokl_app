import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

const { width, height } = Dimensions.get("window");

const MAP_PINS = [
  {
    id: "1",
    score: "2.3/10",
    icon: "golf-outline",
    lat: 40.7158,
    lng: -74.012,
    venue: {
      name: "GOLF PARK CLUB",
      score: "2.3",
      ratings: "420",
      type: "Golf",
      price: "$$$",
      distance: "1.0 ml",
      image:
        "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&q=80",
      friends: 0,
    },
  },
  {
    id: "2",
    score: "7.6/10",
    icon: "body-outline",
    lat: 40.7148,
    lng: -74.008,
    venue: {
      name: "FLEX BODY STUDIO",
      score: "7.6",
      ratings: "980",
      type: "Fitness",
      price: "$$",
      distance: "0.8 ml",
      image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
      friends: 1,
    },
  },
  {
    id: "3",
    score: "8/10",
    icon: "fitness-outline",
    lat: 40.7138,
    lng: -74.003,
    venue: {
      name: "POWER FITNESS GYM",
      score: "8.0",
      ratings: "1,100",
      type: "Gym",
      price: "$",
      distance: "0.6 ml",
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
      friends: 0,
    },
  },
  {
    id: "4",
    score: "9.2/10",
    icon: "body-outline",
    lat: 40.7128,
    lng: -74.006,
    featured: true,
    venue: {
      name: "ZEN YOGA STUDIO",
      score: "9.2",
      ratings: "3,558",
      type: "Yoga",
      price: "$$",
      distance: "0.2 ml",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
      friends: 2,
    },
  },
  {
    id: "5",
    score: "8.4/10",
    icon: "basketball-outline",
    lat: 40.7118,
    lng: -74.011,
    venue: {
      name: "COURT KINGS ARENA",
      score: "8.4",
      ratings: "892",
      type: "Basketball",
      price: "$",
      distance: "0.5 ml",
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
      friends: 1,
    },
  },
  {
    id: "6",
    score: "6.8/10",
    icon: "basketball-outline",
    lat: 40.7108,
    lng: -74.001,
    venue: {
      name: "DOWNTOWN COURTS",
      score: "6.8",
      ratings: "540",
      type: "Basketball",
      price: "$",
      distance: "0.9 ml",
      image:
        "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80",
      friends: 0,
    },
  },
  {
    id: "7",
    score: "9.8/10",
    icon: "barbell-outline",
    lat: 40.7098,
    lng: -74.007,
    venue: {
      name: "IRON BARBELL CLUB",
      score: "9.8",
      ratings: "2,200",
      type: "Weightlifting",
      price: "$$",
      distance: "1.1 ml",
      image:
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80",
      friends: 3,
    },
  },
];

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

export default function HomeScreen() {
  const router = useRouter();
  const [selectedPin, setSelectedPin] = useState("4");

  const selectedPinData = MAP_PINS.find((p) => p.id === selectedPin)!;
  const venue = selectedPinData.venue;

  return (
    <View style={styles.container}>
      {/* Real Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={{
          latitude: 40.7128,
          longitude: -74.006,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsBuildings={false}
        showsTraffic={false}
      >
        {MAP_PINS.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            onPress={() => setSelectedPin(pin.id)}
            tracksViewChanges={false}
          >
            <View
              style={[
                styles.pin,
                pin.featured && styles.pinFeatured,
                selectedPin === pin.id && styles.pinSelected,
              ]}
            >
              <Ionicons
                name={pin.icon as any}
                size={13}
                color={
                  selectedPin === pin.id ? Colors.primary : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.pinText,
                  selectedPin === pin.id && styles.pinTextActive,
                ]}
              >
                {pin.score}
              </Text>
            </View>
          </Marker>
        ))}
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
              color={Colors.textSecondary}
            />
            <Text style={styles.searchPlaceholder}>Search venues</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/home/filters")}
          >
            <Ionicons name="options-outline" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Single Venue Card - changes on pin tap */}
      <View style={styles.venueSheet}>
        <View style={styles.venueCard}>
          <TouchableOpacity activeOpacity={0.95}>
            <View style={styles.venueImageWrap}>
              <Image
                source={{ uri: venue.image }}
                style={styles.venueImage}
                resizeMode="cover"
              />
              <View style={styles.distanceBadge}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={Colors.text}
                />
                <Text style={styles.distanceText}>{venue.distance}</Text>
              </View>
            </View>

            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <View style={styles.venueMeta}>
                <View style={styles.scoreChip}>
                  <Text style={styles.scoreText}>{venue.score}</Text>
                </View>
                <Text style={styles.venueMetaText}>
                  ({venue.ratings} ratings)
                </Text>
                <View style={styles.dot} />
                <Text style={styles.venueMetaText}>{venue.type}</Text>
                <View style={styles.dot} />
                <Text style={styles.venueMetaText}>{venue.price}</Text>
              </View>
              {venue.friends > 0 && (
                <View style={styles.friendsRow}>
                  <View style={styles.friendAvatars}>
                    <View
                      style={[
                        styles.friendAvatar,
                        { backgroundColor: "#7B61FF" },
                      ]}
                    />
                    {venue.friends > 1 && (
                      <View
                        style={[
                          styles.friendAvatar,
                          { backgroundColor: "#FF6B6B", marginLeft: -8 },
                        ]}
                      />
                    )}
                    {venue.friends > 2 && (
                      <View
                        style={[
                          styles.friendAvatar,
                          { backgroundColor: "#00C9A7", marginLeft: -8 },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={styles.friendsText}>
                    {venue.friends} Friends here
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.venueActions}>
            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => router.push("/home/details")}
              activeOpacity={0.85}
            >
              <Text style={styles.detailsBtnText}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => router.push("/post")}
              activeOpacity={0.85}
            >
              <Text style={styles.reviewBtnText}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  map: {
    width: width,
    height: height,
  },

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
    backgroundColor: "rgba(20,22,26,0.92)",
    borderRadius: 50,
    height: 48,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchPlaceholder: { color: Colors.textSecondary, fontSize: 15 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(20,22,26,0.92)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  pin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(20,22,26,0.88)",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pinFeatured: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(20,22,26,0.95)",
  },
  pinSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(20,22,26,0.95)",
  },
  pinText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600" },
  pinTextActive: { color: Colors.primary },

  venueSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 450,
    // backgroundColor: Colors.background,
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
  venueImageWrap: {
    position: "relative",
    height: 160,
    overflow: "hidden",
  },
  venueImage: { width: "100%", height: "100%" },
  distanceBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(20,22,26,0.85)",
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  distanceText: { color: Colors.text, fontSize: 12, fontWeight: "600" },
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
  friendsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  friendAvatars: { flexDirection: "row" },
  friendAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  friendsText: { color: Colors.textSecondary, fontSize: 13 },
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
