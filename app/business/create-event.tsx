import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const EVENT_TYPES = ["Yoga", "Basketball", "Boxing", "Running", "Gym", "Other"];
const AMENITIES_LIST = [
  { id: "shower", icon: "water-outline", label: "Shower" },
  { id: "locker", icon: "lock-closed-outline", label: "Locker" },
  { id: "wifi", icon: "wifi-outline", label: "WiFi" },
];

export default function CreateEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [eventType, setEventType] = useState("Yoga");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [price, setPrice] = useState("0");
  const [website, setWebsite] = useState("0");
  const [amenities, setAmenities] = useState<string[]>([]);

  const toggleAmenity = (id: string) =>
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Create event</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Media Upload */}
        <TouchableOpacity
          style={s.mediaBox}
          onPress={() => router.push("/events/gallery")}
          activeOpacity={0.85}
        >
          <Ionicons
            name="image-outline"
            size={36}
            color={Colors.textSecondary}
          />
          <Text style={s.mediaText}>Share a photo or video</Text>
        </TouchableOpacity>

        {/* Event Title */}
        <Text style={s.label}>Event Title*</Text>
        <TextInput
          style={s.input}
          placeholder="e.g.. Morning Yoga Session"
          placeholderTextColor={Colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <Text style={s.label}>Description</Text>
        <TextInput
          style={[s.input, s.textArea]}
          placeholder="Tell people what to expect..."
          placeholderTextColor={Colors.textMuted}
          value={desc}
          onChangeText={setDesc}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* Event Type */}
        <Text style={s.label}>Event Type*</Text>
        <View style={s.typeGrid}>
          {EVENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[s.typeChip, eventType === type && s.typeChipActive]}
              onPress={() => setEventType(type)}
            >
              <Text
                style={[
                  s.typeChipText,
                  eventType === type && s.typeChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Venue */}
        <Text style={s.label}>Venue*</Text>
        <TextInput
          style={s.input}
          placeholder="e.g.. Central Park"
          placeholderTextColor={Colors.textMuted}
          value={venue}
          onChangeText={setVenue}
        />

        {/* Location */}
        <Text style={s.label}>Location*</Text>
        <TextInput
          style={s.input}
          placeholder="e.g.. Central Park"
          placeholderTextColor={Colors.textMuted}
          value={location}
          onChangeText={setLocation}
        />

        {/* Date + Time (side by side) */}
        <View style={s.rowFields}>
          <View style={s.halfField}>
            <Text style={s.label}>Date*</Text>
            <TextInput
              style={s.input}
              placeholder="MM/YY"
              placeholderTextColor={Colors.textMuted}
              value={date}
              onChangeText={setDate}
            />
          </View>
          <View style={s.halfField}>
            <Text style={s.label}>Time*</Text>
            <TextInput
              style={s.input}
              placeholder="MM/YY"
              placeholderTextColor={Colors.textMuted}
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        {/* Max Participants */}
        <Text style={s.label}>Max Participants*</Text>
        <TextInput
          style={s.input}
          placeholder="10"
          placeholderTextColor={Colors.textMuted}
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          keyboardType="numeric"
        />

        {/* Price per Person */}
        <Text style={s.label}>Price per Person ($)</Text>
        <TextInput
          style={s.input}
          placeholder="0"
          placeholderTextColor={Colors.textMuted}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        {/* Website */}
        <Text style={s.label}>Website (optional)</Text>
        <TextInput
          style={s.input}
          placeholder="0"
          placeholderTextColor={Colors.textMuted}
          value={website}
          onChangeText={setWebsite}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* Amenities */}
        <Text style={s.amenitiesTitle}>AMENITIES</Text>
        <View style={s.amenitiesGrid}>
          {AMENITIES_LIST.map((a) => {
            const active = amenities.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                style={[s.amenityChip, active && s.amenityChipActive]}
                onPress={() => toggleAmenity(a.id)}
              >
                <Ionicons
                  name={a.icon as any}
                  size={16}
                  color={active ? Colors.black : Colors.primary}
                />
                <Text style={[s.amenityText, active && s.amenityTextActive]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Confirm */}
        <TouchableOpacity
          style={s.confirmBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={s.confirmText}>Confirm Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  mediaBox: {
    height: 130,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },
  mediaText: { color: Colors.textSecondary, fontSize: 14 },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    height: 52,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 15,
    marginBottom: 18,
  },
  textArea: { height: 110, paddingTop: 14 },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  typeChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  typeChipTextActive: { color: Colors.black, fontWeight: "700" },
  rowFields: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  amenitiesTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 26,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
  },
  amenityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  amenityText: { color: Colors.text, fontSize: 14 },
  amenityTextActive: { color: Colors.black, fontWeight: "600" },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: { color: Colors.black, fontSize: 17, fontWeight: "700" },
});
