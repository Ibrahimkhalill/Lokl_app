import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../../../constants/colors";
import { sharedStyles } from "./sharedStyles";
import { businessService } from "../../../services/businessService";
import { getErrorMessage } from "../../../lib/api";
import { CoachScheduleSlot } from "./types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatTimeForApi(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatTimeDisplay(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

function slotTimeDisplay(t: string): string {
  const parts = t.split(":");
  if (parts.length < 2) return t;
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

interface Props {
  slots: CoachScheduleSlot[];
  isOwner: boolean;
  businessProfileId: number;
  onUpdate: () => void;
}

export default function ScheduleSection({ slots, isOwner, businessProfileId, onUpdate }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [slotDay, setSlotDay] = useState("Monday");
  const [slotTime, setSlotTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [slotDescription, setSlotDescription] = useState("");
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const visible = isOwner || slots.length > 0;
  if (!visible) return null;

  function openAddModal() {
    setEditingSlotId(null);
    setSlotDay("Monday");
    setSlotTime(new Date());
    setSlotDescription("");
    setShowTimePicker(false);
    sheetRef.current?.present();
  }

  function openEditModal(slot: CoachScheduleSlot) {
    setEditingSlotId(slot.id);
    setSlotDay(slot.day_of_week);
    const parts = slot.time.split(":");
    const d = new Date();
    d.setHours(parseInt(parts[0], 10));
    d.setMinutes(parseInt(parts[1], 10));
    d.setSeconds(0);
    setSlotTime(d);
    setSlotDescription(slot.description ?? "");
    setShowTimePicker(false);
    sheetRef.current?.present();
  }

  async function handleSaveSlot() {
    setSaving(true);
    try {
      const payload = {
        day_of_week: slotDay,
        time: formatTimeForApi(slotTime),
        description: slotDescription,
      };
      if (editingSlotId !== null) {
        await businessService.updateScheduleSlot(businessProfileId, editingSlotId, payload);
      } else {
        await businessService.addScheduleSlot(businessProfileId, payload);
      }
      sheetRef.current?.dismiss();
      onUpdate();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSlot(slotId: number) {
    Alert.alert("Remove Slot", "Delete this schedule slot?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingSlotId(slotId);
          try {
            await businessService.deleteScheduleSlot(businessProfileId, slotId);
            onUpdate();
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err));
          } finally {
            setDeletingSlotId(null);
          }
        },
      },
    ]);
  }

  return (
    <View>
      <View style={sharedStyles.sectionHeaderRow}>
        <Text style={sharedStyles.sectionHeader}>Schedule</Text>
        {isOwner && (
          <TouchableOpacity style={sharedStyles.sectionAddBtn} onPress={openAddModal}>
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={sharedStyles.sectionAddBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {slots.length === 0 && isOwner && (
        <View style={sharedStyles.addPlaceholder}>
          <View style={sharedStyles.addPlaceholderIcon}>
            <Ionicons name="calendar-outline" size={26} color={Colors.primary} />
          </View>
          <Text style={sharedStyles.addPlaceholderTitle}>Add Your Schedule</Text>
          <Text style={sharedStyles.addPlaceholderText}>Let clients know when you train</Text>
        </View>
      )}

      {slots.map((slot) => (
        <View key={slot.id} style={styles.slotCard}>
          <View style={styles.slotAccent} />
          <View style={styles.slotBody}>
            <View style={styles.slotTopRow}>
              <View style={styles.slotMeta}>
                <Text style={styles.slotDay}>{slot.day_of_week.toUpperCase()}</Text>
                <Text style={styles.slotTime}>{slotTimeDisplay(slot.time)}</Text>
              </View>
              {isOwner && (
                <View style={styles.slotActions}>
                  <TouchableOpacity style={styles.slotActionBtn} onPress={() => openEditModal(slot)}>
                    <Ionicons name="pencil-outline" size={15} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.slotActionBtn} onPress={() => handleDeleteSlot(slot.id)}>
                    {deletingSlotId === slot.id ? (
                      <ActivityIndicator size="small" color={Colors.error} />
                    ) : (
                      <Ionicons name="trash-outline" size={15} color={Colors.error} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {!!slot.description && <Text style={styles.slotDesc}>{slot.description}</Text>}
            {!!slot.venue_name && <Text style={styles.slotVenue}>{slot.venue_name}</Text>}
          </View>
        </View>
      ))}

      {/* Add / Edit Slot — bottom sheet */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["55%", "80%"]}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent}>
          <View style={sharedStyles.modalHeader}>
            <Text style={sharedStyles.modalTitle}>
              {editingSlotId !== null ? "Edit Slot" : "Add Slot"}
            </Text>
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={sharedStyles.modalLabel}>Day</Text>
          <TouchableOpacity
            style={sharedStyles.modalPickerBtn}
            onPress={() => setDayPickerVisible(true)}
          >
            <Text style={sharedStyles.modalPickerBtnText}>{slotDay}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text style={sharedStyles.modalLabel}>Time</Text>
          <TouchableOpacity
            style={sharedStyles.modalPickerBtn}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={sharedStyles.modalPickerBtnText}>{formatTimeDisplay(slotTime)}</Text>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={slotTime}
              mode="time"
              is24Hour={false}
              themeVariant="dark"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onValueChange={(_: any, selectedDate: Date) => {
                if (Platform.OS === "android") setShowTimePicker(false);
                setSlotTime(selectedDate);
              }}
              onDismiss={Platform.OS === "android" ? () => setShowTimePicker(false) : undefined}
            />
          )}

          <Text style={sharedStyles.modalLabel}>Description (optional)</Text>
          <TextInput
            style={sharedStyles.modalInput}
            placeholder="e.g. Boxing class at Gotham Gym"
            placeholderTextColor={Colors.textMuted}
            value={slotDescription}
            onChangeText={setSlotDescription}
          />

          {Platform.OS === "ios" && showTimePicker ? (
            <TouchableOpacity style={sharedStyles.saveBtn} onPress={() => setShowTimePicker(false)}>
              <Text style={sharedStyles.saveBtnText}>Confirm Time</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[sharedStyles.saveBtn, saving && sharedStyles.saveBtnDisabled]}
              onPress={handleSaveSlot}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={sharedStyles.saveBtnText}>
                  {editingSlotId !== null ? "Save Changes" : "Add Slot"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* Day picker — plain Modal (no text inputs, no KAV needed) */}
      <Modal
        visible={dayPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDayPickerVisible(false)}
      >
        <Pressable style={sharedStyles.pickerBackdrop} onPress={() => setDayPickerVisible(false)} />
        <View style={sharedStyles.pickerSheet}>
          <View style={sharedStyles.pickerBar}>
            <Text style={[sharedStyles.modalTitle, { marginBottom: 0 }]}>Select Day</Text>
            <TouchableOpacity onPress={() => setDayPickerVisible(false)}>
              <Text style={sharedStyles.pickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {DAYS.map((day) => {
              const active = day === slotDay;
              return (
                <TouchableOpacity
                  key={day}
                  style={[sharedStyles.pickerRow, active && sharedStyles.pickerRowActive]}
                  onPress={() => {
                    setSlotDay(day);
                    setDayPickerVisible(false);
                  }}
                >
                  <Text style={[sharedStyles.pickerRowText, active && sharedStyles.pickerRowTextActive]}>
                    {day}
                  </Text>
                  {active && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: Colors.card },
  handle: { backgroundColor: Colors.textMuted },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 40 },
  slotCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: "row",
    overflow: "hidden",
  },
  slotAccent: { width: 4, backgroundColor: Colors.primary },
  slotBody: { flex: 1, padding: 14 },
  slotTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  slotMeta: { flex: 1, gap: 2 },
  slotDay: { color: Colors.textSecondary, fontSize: 11, fontWeight: "600", letterSpacing: 0.8 },
  slotTime: { color: Colors.text, fontSize: 20, fontWeight: "700" },
  slotDesc: { color: Colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18 },
  slotVenue: { color: Colors.primary, fontSize: 13, fontWeight: "600", marginTop: 6 },
  slotActions: { flexDirection: "row", gap: 6 },
  slotActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
});
