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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import ShowerIcon from "../../assets/icons/shower.svg";
import LockerIcon from "../../assets/icons/loack.svg";
import WifiIcon from "../../assets/icons/wifi.svg";
import {
  MediaPickerCard,
  FormField,
  AppTextInput,
  AppHeader,
  AppHeaderIconButton,
} from "../../components/primitives";
import { useToggleSet } from "../../hooks/useToggleSet";
import type { SvgProps } from "react-native-svg";
import { pickCoverImage } from "../../lib/mediaPicker";

function initialEventStart() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

function mergeDatePart(current: Date, picked: Date) {
  const next = new Date(current);
  next.setFullYear(
    picked.getFullYear(),
    picked.getMonth(),
    picked.getDate()
  );
  return next;
}

function mergeTimePart(current: Date, picked: Date) {
  const next = new Date(current);
  next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return next;
}

const EVENT_TYPES = ["Yoga", "Basketball", "Boxing", "Running", "Gym", "Other"];
type AmenityIcon = React.FC<SvgProps>;

const AMENITIES_LIST: { id: string; Icon: AmenityIcon; label: string }[] = [
  { id: "shower", Icon: ShowerIcon, label: "Shower" },
  { id: "locker", Icon: LockerIcon, label: "Locker" },
  { id: "wifi", Icon: WifiIcon, label: "WiFi" },
];

export default function CreateEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [eventType, setEventType] = useState("Yoga");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [eventStartsAt, setEventStartsAt] = useState(initialEventStart);
  const [activePicker, setActivePicker] = useState<null | "date" | "time">(
    null
  );
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [price, setPrice] = useState("0");
  const [website, setWebsite] = useState("0");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const { selected: amenities, toggle: toggleAmenity } = useToggleSet([]);

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
            placeholder="e.g.. Morning Yoga Session"
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

        <FormField label="Venue*" labelStyle={s.label}>
          <AppTextInput
            placeholder="e.g.. Central Park"
            value={venue}
            onChangeText={setVenue}
          />
        </FormField>

        <FormField label="Location*" labelStyle={s.label}>
          <AppTextInput
            placeholder="e.g.. Central Park"
            value={location}
            onChangeText={setLocation}
          />
        </FormField>

        {/* Date + Time (side by side) */}
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
            placeholder="0"
            value={website}
            onChangeText={setWebsite}
            autoCapitalize="none"
            keyboardType="url"
          />
        </FormField>

        {/* Amenities */}
        <Text style={s.amenitiesTitle}>AMENITIES</Text>
        <View style={s.amenitiesGrid}>
          {AMENITIES_LIST.map((a) => {
            const active = amenities.includes(a.id);
            const iconColor = active ? Colors.black : Colors.text;
            return (
              <TouchableOpacity
                key={a.id}
                style={[s.amenityChip, active && s.amenityChipActive]}
                onPress={() => toggleAmenity(a.id)}
              >
                <a.Icon width={20} height={20} color={iconColor} />
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
    justifyContent: "center",
    paddingVertical: 14,
  },
  pickerFieldText: { color: Colors.text, fontSize: 15 },
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
