import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Switch,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MediaPickerCard,
  FormField,
  AppTextInput,
  AppHeader,
  AppHeaderIconButton,
  LocationPickerModal,
  type LocationResult,
} from "../../components/primitives";
import { pickCoverImage } from "../../lib/mediaPicker";
import { businessService } from "../../services/businessService";
import { getErrorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

function initialEventStart() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

function mergeDatePart(current: Date, picked: Date) {
  const next = new Date(current);
  next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  return next;
}

function mergeTimePart(current: Date, picked: Date) {
  const next = new Date(current);
  next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return next;
}

function toDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeString(d: Date) {
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

const EVENT_TYPES = [
  "Boxing & Combat",
  "Yoga & Pilates",
  "Strength & CrossFit",
  "Court Sports",
  "Cycling & Cardio",
  "Outdoor & Adventure",
  "Classes & Studios",
  "Wellness & Recovery",
];

const NYC_NEIGHBORHOODS = [
  "West Village", "FiDi", "East Village", "Lower East Side",
  "Tribeca", "Midtown", "Murray Hill", "Chelsea",
  "SoHo", "NoHo", "Nolita", "Battery Park",
  "Flatiron", "Gramercy", "Hudson Square", "Hudson Yards",
  "Greenwich Village", "Upper West Side", "Upper East Side",
];

export default function CreateEventScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [eventType, setEventType] = useState("Yoga");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [eventStartsAt, setEventStartsAt] = useState(initialEventStart);
  const [activePicker, setActivePicker] = useState<null | "date" | "time">(
    null
  );
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [price, setPrice] = useState("0");
  const [website, setWebsite] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [neighborhoodPickerVisible, setNeighborhoodPickerVisible] = useState(false);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) {
      showToast({ type: "warning", title: "Validation", message: "Event title is required." });
      return;
    }
    if (!location.trim()) {
      showToast({ type: "warning", title: "Validation", message: "Location is required." });
      return;
    }
    if (!maxParticipants || Number(maxParticipants) < 1) {
      showToast({ type: "warning", title: "Validation", message: "Max participants must be at least 1." });
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", desc.trim());
      form.append("event_type", eventType);
      form.append("venue", venue.trim());
      form.append("location", location.trim());
      if (locationCoords) {
        form.append("latitude", String(locationCoords.lat));
        form.append("longitude", String(locationCoords.lng));
      }
      form.append("date", toDateString(eventStartsAt));
      form.append("time", toTimeString(eventStartsAt));
      form.append("max_participants", maxParticipants);
      form.append("price", price || "0");
      if (website.trim()) form.append("website", website.trim());
      if (neighborhood) form.append("neighborhood", neighborhood);
      form.append("is_private", isPrivate ? "true" : "false");

      if (coverUri) {
        const filename = coverUri.split("/").pop() ?? "cover.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        form.append("cover_image", { uri: coverUri, name: filename, type } as any);
      }

      await businessService.createEvent(form);
      showToast({ type: "success", title: "Success", message: "Event created successfully!" });
      router.back();
    } catch (err) {
      showToast({ type: "error", title: "Error", message: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={s.header}>
          <AppHeader
            title="Create event"
            titleStyle={s.headerTitle}
            leftSlot={
              <AppHeaderIconButton onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color={Colors.text} />
              </AppHeaderIconButton>
            }
            rightSlot={<View style={{ width: 40 }} />}
          />
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MediaPickerCard
            height={130}
            previewUri={coverUri}
            previewKind="image"
            onPress={async () => {
              const picked = await pickCoverImage();
              if (picked) setCoverUri(picked.uri);
            }}
            icon={
              <Ionicons
                name="image-outline"
                size={36}
                color={Colors.textSecondary}
              />
            }
            title="Share a photo or video"
          />

          <FormField label="Event Title*" labelStyle={s.label}>
            <AppTextInput
              placeholder="e.g. Morning Yoga Session"
              value={title}
              onChangeText={setTitle}
            />
          </FormField>

          <FormField label="Description" labelStyle={s.label}>
            <AppTextInput
              style={s.textArea}
              placeholder="Tell people what to expect..."
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </FormField>

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

          <FormField label="Venue*" labelStyle={s.label}>
            <AppTextInput
              placeholder="e.g. Central Park"
              value={venue}
              onChangeText={setVenue}
            />
          </FormField>

          <Text style={s.label}>Location*</Text>
          <TouchableOpacity
            style={[s.pickerField, s.locationField]}
            onPress={() => setLocationPickerVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="location-outline"
              size={18}
              color={location ? Colors.primary : Colors.textMuted}
            />
            <Text
              style={[
                s.pickerFieldText,
                { flex: 1 },
                !location && { color: Colors.textMuted },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {location || "Search for a location..."}
            </Text>
          </TouchableOpacity>

          <LocationPickerModal
            visible={locationPickerVisible}
            onClose={() => setLocationPickerVisible(false)}
            onSelect={(result: LocationResult) => {
              setLocation(result.address);
              if (result.latitude !== 0 && result.longitude !== 0) {
                setLocationCoords({ lat: result.latitude, lng: result.longitude });
              }
            }}
          />

          <View style={s.rowFields}>
            <View style={s.halfField}>
              <Text style={s.label}>Date*</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setActivePicker("date")}
                style={s.pickerField}
              >
                <Text style={s.pickerFieldText}>
                  {eventStartsAt.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={s.halfField}>
              <Text style={s.label}>Time*</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setActivePicker("time")}
                style={s.pickerField}
              >
                <Text style={s.pickerFieldText}>
                  {eventStartsAt.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {Platform.OS === "android" && activePicker ? (
            <DateTimePicker
              value={eventStartsAt}
              mode={activePicker}
              display="default"
              minimumDate={activePicker === "date" ? new Date() : undefined}
              onChange={(event, selected) => {
                const mode = activePicker;
                setActivePicker(null);
                if (event.type === "set" && selected && mode) {
                  setEventStartsAt((prev) =>
                    mode === "date"
                      ? mergeDatePart(prev, selected)
                      : mergeTimePart(prev, selected)
                  );
                }
              }}
            />
          ) : null}

          {Platform.OS === "ios" ? (
            <Modal
              visible={activePicker !== null}
              transparent
              animationType="slide"
              onRequestClose={() => setActivePicker(null)}
            >
              <Pressable
                style={s.modalBackdrop}
                onPress={() => setActivePicker(null)}
              />
              <View style={s.modalSheet}>
                <View style={s.modalBar}>
                  <TouchableOpacity onPress={() => setActivePicker(null)}>
                    <Text style={s.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setActivePicker(null)}>
                    <Text style={s.modalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                {activePicker ? (
                  <DateTimePicker
                    value={eventStartsAt}
                    mode={activePicker}
                    display="spinner"
                    minimumDate={activePicker === "date" ? new Date() : undefined}
                    onChange={(_, selected) => {
                      if (!selected || !activePicker) return;
                      setEventStartsAt((prev) =>
                        activePicker === "date"
                          ? mergeDatePart(prev, selected)
                          : mergeTimePart(prev, selected)
                      );
                    }}
                  />
                ) : null}
              </View>
            </Modal>
          ) : null}

          <FormField label="Max Participants*" labelStyle={s.label}>
            <AppTextInput
              placeholder="10"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="numeric"
            />
          </FormField>

          <FormField label="Price per Person ($)" labelStyle={s.label}>
            <AppTextInput
              placeholder="0"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </FormField>

          <FormField label="Website (optional)" labelStyle={s.label}>
            <AppTextInput
              placeholder="https://example.com"
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              keyboardType="url"
            />
          </FormField>

          {/* Neighborhood */}
          <Text style={s.label}>Neighborhood (optional)</Text>
          <TouchableOpacity
            style={[s.pickerField, { marginBottom: 18 }]}
            onPress={() => setNeighborhoodPickerVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={[s.pickerFieldText, !neighborhood && { color: Colors.textMuted }]}>
              {neighborhood || "Select NYC neighborhood..."}
            </Text>
          </TouchableOpacity>

          {/* Neighborhood picker modal */}
          <Modal
            visible={neighborhoodPickerVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setNeighborhoodPickerVisible(false)}
          >
            <Pressable style={s.modalBackdrop} onPress={() => setNeighborhoodPickerVisible(false)} />
            <View style={s.modalSheet}>
              <View style={s.modalBar}>
                <TouchableOpacity onPress={() => { setNeighborhood(""); setNeighborhoodPickerVisible(false); }}>
                  <Text style={s.modalCancel}>Clear</Text>
                </TouchableOpacity>
                <Text style={[s.modalDone, { color: Colors.text }]}>Neighborhood</Text>
                <TouchableOpacity onPress={() => setNeighborhoodPickerVisible(false)}>
                  <Text style={s.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 320 }}>
                {NYC_NEIGHBORHOODS.map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[s.neighborhoodRow, neighborhood === n && s.neighborhoodRowActive]}
                    onPress={() => { setNeighborhood(n); setNeighborhoodPickerVisible(false); }}
                  >
                    <Text style={[s.neighborhoodText, neighborhood === n && s.neighborhoodTextActive]}>{n}</Text>
                    {neighborhood === n && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Modal>

          {/* Private Event toggle */}
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.label}>Private Event</Text>
              <Text style={s.toggleSubtext}>Attendees must request to join</Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: Colors.cardBorder, true: Colors.primary }}
              thumbColor={Colors.black}
            />
          </View>

          <TouchableOpacity
            style={[s.confirmBtn, submitting && s.confirmBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={s.confirmText}>Confirm Event</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
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
  halfField: { flex: 1, marginBottom: 18 },
  pickerField: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 52,
    paddingHorizontal: 16,
    justifyContent: "flex-start",
    paddingVertical: 14,
  },
  pickerFieldText: { color: Colors.text, fontSize: 15 },
  locationField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 28,
  },
  modalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  modalCancel: { color: Colors.textSecondary, fontSize: 16 },
  modalDone: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
    paddingVertical: 4,
  },
  toggleInfo: { flex: 1 },
  toggleSubtext: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  neighborhoodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  neighborhoodRowActive: { backgroundColor: "rgba(209,255,0,0.08)" },
  neighborhoodText: { color: Colors.text, fontSize: 15 },
  neighborhoodTextActive: { color: Colors.primary, fontWeight: "600" },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmText: { color: Colors.black, fontSize: 17, fontWeight: "700" },
});
