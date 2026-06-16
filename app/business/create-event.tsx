import React, { useCallback, useRef, useState } from "react";
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
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
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
import { getErrorMessage, api } from "../../lib/api";
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
  const [eventType, setEventType] = useState("");
  const [venueId, setVenueId] = useState<number | null>(null);
  const [venueName, setVenueName] = useState("");
  const [venuePickerVisible, setVenuePickerVisible] = useState(false);
  const [venueQuery, setVenueQuery] = useState("");
  const [venueResults, setVenueResults] = useState<{ id: number; name: string; address?: string }[]>([]);
  const [venueSuggestions, setVenueSuggestions] = useState<{ id: number; name: string; address?: string }[]>([]);
  const [venueSearching, setVenueSearching] = useState(false);
  const [venueLoadingSuggestions, setVenueLoadingSuggestions] = useState(false);
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [eventStartsAt, setEventStartsAt] = useState(initialEventStart);
  const [activePicker, setActivePicker] = useState<null | "date" | "time">(null);
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [price, setPrice] = useState("0");
  const [website, setWebsite] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const typeSheetRef = useRef<BottomSheetModal>(null);
  const neighborhoodSheetRef = useRef<BottomSheetModal>(null);

  function parseVenues(data: any) {
    const payload = data?.data ?? data;
    return Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.venues)
      ? payload.venues
      : [];
  }

  async function openVenuePicker() {
    setVenueQuery("");
    setVenueResults([]);
    setVenuePickerVisible(true);
    setVenueLoadingSuggestions(true);
    try {
      const res = await api.get("/venues/", { params: { page_size: 15 } });
      setVenueSuggestions(parseVenues(res.data));
    } catch {
      setVenueSuggestions([]);
    } finally {
      setVenueLoadingSuggestions(false);
    }
  }

  async function handleVenueSearch(q: string) {
    setVenueQuery(q);
    if (!q.trim()) { setVenueResults([]); return; }
    setVenueSearching(true);
    try {
      const res = await api.get("/venues/", { params: { search: q, page_size: 20 } });
      setVenueResults(parseVenues(res.data));
    } catch {
      setVenueResults([]);
    } finally {
      setVenueSearching(false);
    }
  }

  function selectVenue(v: { id: number; name: string; address?: string }) {
    setVenueId(v.id);
    setVenueName(v.name);
    if (v.address && !location) setLocation(v.address);
    setVenuePickerVisible(false);
  }

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />
    ),
    []
  );

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
      if (venueId) form.append("venue", String(venueId));
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
            icon={<Ionicons name="image-outline" size={36} color={Colors.textSecondary} />}
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

          {/* Event Type — dropdown */}
          <Text style={s.label}>Event Type*</Text>
          <TouchableOpacity
            style={s.dropdownField}
            onPress={() => typeSheetRef.current?.present()}
            activeOpacity={0.8}
          >
            <Text style={[s.dropdownText, !eventType && s.dropdownPlaceholder]}>
              {eventType || "Select event type…"}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <Text style={s.label}>Venue*</Text>
          <TouchableOpacity
            style={[s.dropdownField, { marginBottom: 18 }]}
            onPress={openVenuePicker}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={16}
              color={venueName ? Colors.primary : Colors.textMuted}
            />
            <Text style={[s.dropdownText, !venueName && s.dropdownPlaceholder, { marginLeft: 8 }]}>
              {venueName || "Search and select a venue…"}
            </Text>
            {venueName ? (
              <TouchableOpacity onPress={() => { setVenueId(null); setVenueName(""); }} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
            )}
          </TouchableOpacity>

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
              style={[s.pickerFieldText, { flex: 1 }, !location && { color: Colors.textMuted }]}
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
              onValueChange={(_, selected) => {
                const mode = activePicker;
                setActivePicker(null);
                setEventStartsAt((prev) =>
                  mode === "date" ? mergeDatePart(prev, selected) : mergeTimePart(prev, selected)
                );
              }}
              onDismiss={() => setActivePicker(null)}
            />
          ) : null}

          {Platform.OS === "ios" ? (
            <Modal
              visible={activePicker !== null}
              transparent
              animationType="slide"
              onRequestClose={() => setActivePicker(null)}
            >
              <Pressable style={s.modalBackdrop} onPress={() => setActivePicker(null)} />
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
                    onValueChange={(_, selected) => {
                      if (!activePicker) return;
                      setEventStartsAt((prev) =>
                        activePicker === "date" ? mergeDatePart(prev, selected) : mergeTimePart(prev, selected)
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

          {/* Neighborhood — dropdown */}
          <Text style={s.label}>Neighborhood (optional)</Text>
          <TouchableOpacity
            style={[s.dropdownField, { marginBottom: 18 }]}
            onPress={() => neighborhoodSheetRef.current?.present()}
            activeOpacity={0.85}
          >
            <Text style={[s.dropdownText, !neighborhood && s.dropdownPlaceholder]}>
              {neighborhood || "Select NYC neighborhood…"}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

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

      {/* Event Type picker */}
      <BottomSheetModal
        ref={typeSheetRef}
        snapPoints={["55%"]}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={s.sheetBg}
        handleIndicatorStyle={s.handle}
      >
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Event Type</Text>
          <TouchableOpacity onPress={() => typeSheetRef.current?.dismiss()}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={s.sheetList}>
          {EVENT_TYPES.map((et) => {
            const active = eventType === et;
            return (
              <TouchableOpacity
                key={et}
                style={[s.sheetRow, active && s.sheetRowActive]}
                onPress={() => {
                  setEventType(et);
                  typeSheetRef.current?.dismiss();
                }}
                activeOpacity={0.75}
              >
                <Text style={[s.sheetRowText, active && s.sheetRowTextActive]}>{et}</Text>
                {active && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* Neighborhood picker */}
      <BottomSheetModal
        ref={neighborhoodSheetRef}
        snapPoints={["60%"]}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={s.sheetBg}
        handleIndicatorStyle={s.handle}
      >
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Neighborhood</Text>
          <TouchableOpacity onPress={() => neighborhoodSheetRef.current?.dismiss()}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={s.sheetList}>
          {neighborhood !== "" && (
            <TouchableOpacity
              style={s.sheetRow}
              onPress={() => { setNeighborhood(""); neighborhoodSheetRef.current?.dismiss(); }}
            >
              <Text style={[s.sheetRowText, { color: Colors.error }]}>Clear selection</Text>
              <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          )}
          {NYC_NEIGHBORHOODS.map((n) => {
            const active = neighborhood === n;
            return (
              <TouchableOpacity
                key={n}
                style={[s.sheetRow, active && s.sheetRowActive]}
                onPress={() => { setNeighborhood(n); neighborhoodSheetRef.current?.dismiss(); }}
                activeOpacity={0.75}
              >
                <Text style={[s.sheetRowText, active && s.sheetRowTextActive]}>{n}</Text>
                {active && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* Venue picker */}
      <Modal
        visible={venuePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVenuePickerVisible(false)}
        statusBarTranslucent={Platform.OS === "android"}
      >
        <Pressable style={s.venueBackdrop} onPress={() => setVenuePickerVisible(false)} />
        <View style={s.venueSheet}>
          <View style={s.venueHandle} />
          <View style={s.venueHeader}>
            <Text style={s.sheetTitle}>Select Venue</Text>
            <TouchableOpacity onPress={() => setVenuePickerVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={s.venueSearchWrap}>
            <View style={s.venueSearchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={s.venueSearchInput}
                value={venueQuery}
                onChangeText={handleVenueSearch}
                placeholder="Search venues…"
                placeholderTextColor={Colors.textMuted}
                autoCorrect={false}
                returnKeyType="search"
              />
              {venueSearching && <ActivityIndicator size="small" color={Colors.primary} />}
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.venueList}
          >
            {/* No results */}
            {!venueSearching && venueQuery.trim() !== "" && venueResults.length === 0 && (
              <View style={s.venueEmpty}>
                <Ionicons name="business-outline" size={32} color={Colors.textMuted} />
                <Text style={s.venueEmptyText}>No venues found</Text>
              </View>
            )}

            {/* Search results */}
            {venueQuery.trim() !== "" && venueResults.map((v) => (
              <TouchableOpacity key={v.id} style={s.venueRow} onPress={() => selectVenue(v)} activeOpacity={0.75}>
                <View style={s.venueRowIcon}>
                  <Ionicons name="business-outline" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.venueRowName}>{v.name}</Text>
                  {!!v.address && <Text style={s.venueRowAddr}>{v.address}</Text>}
                </View>
                <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
            ))}

            {/* Suggestions */}
            {venueQuery.trim() === "" && (
              venueLoadingSuggestions ? (
                <ActivityIndicator style={{ marginTop: 24 }} color={Colors.primary} />
              ) : (
                <>
                  {venueSuggestions.length > 0 && (
                    <Text style={s.venueSectionLabel}>Suggested Venues</Text>
                  )}
                  {venueSuggestions.map((v) => (
                    <TouchableOpacity key={v.id} style={s.venueRow} onPress={() => selectVenue(v)} activeOpacity={0.75}>
                      <View style={s.venueRowIcon}>
                        <Ionicons name="business-outline" size={18} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.venueRowName}>{v.name}</Text>
                        {!!v.address && <Text style={s.venueRowAddr}>{v.address}</Text>}
                      </View>
                      <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                  ))}
                </>
              )
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  label: { color: Colors.text, fontSize: 14, fontWeight: "600", marginBottom: 8 },
  textArea: { height: 110, paddingTop: 14 },

  // dropdown field (replaces chip grid and old plain modal trigger)
  dropdownField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  dropdownText: { color: Colors.text, fontSize: 15, flex: 1 },
  dropdownPlaceholder: { color: Colors.textMuted },

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
  modalDone: { color: Colors.primary, fontSize: 16, fontWeight: "700" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
    paddingVertical: 4,
  },
  toggleInfo: { flex: 1 },
  toggleSubtext: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmText: { color: Colors.black, fontSize: 17, fontWeight: "700" },

  // bottom sheets
  sheetBg: { backgroundColor: Colors.card },
  handle: { backgroundColor: Colors.textMuted },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sheetTitle: { color: Colors.text, fontSize: 17, fontWeight: "700" },
  sheetList: { paddingHorizontal: 20, paddingBottom: 32 },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  sheetRowActive: { backgroundColor: "rgba(209,255,0,0.06)" },
  sheetRowText: { color: Colors.text, fontSize: 15 },
  sheetRowTextActive: { color: Colors.primary, fontWeight: "700" },

  // venue picker modal
  venueBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  venueSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "62%",
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  venueHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  venueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  venueSearchWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  venueSearchBar: {
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
  venueSearchInput: { flex: 1, color: Colors.text, fontSize: 14, padding: 0 },
  venueList: { paddingHorizontal: 20, paddingBottom: 40 },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.cardBorder,
  },
  venueRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.secondaryCard,
    justifyContent: "center",
    alignItems: "center",
  },
  venueRowName: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  venueRowAddr: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  venueEmpty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  venueEmptyText: { color: Colors.textMuted, fontSize: 14 },
  venueSectionLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 4,
    marginBottom: 4,
  },
});
