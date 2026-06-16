import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Colors } from "../../../constants/colors";
import { sharedStyles } from "./sharedStyles";
import { businessService } from "../../../services/businessService";

interface Props {
  bio: string;
  isOwner: boolean;
  onUpdate: () => void;
}

export function BioSection({ bio, isOwner, onUpdate }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [bioInput, setBioInput] = useState("");
  const [saving, setSaving] = useState(false);

  function openModal() {
    setBioInput(bio ?? "");
    sheetRef.current?.present();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const form = new FormData();
      form.append("bio", bioInput.trim());
      await businessService.updateProfileMedia(form);
      sheetRef.current?.dismiss();
      onUpdate();
    } catch {
      Alert.alert("Save Failed", "Could not save bio. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <>
      <View style={styles.aboutCard}>
        <View style={styles.aboutHeader}>
          <Text style={styles.aboutTitle}>Bio</Text>
          {isOwner && (
            <TouchableOpacity onPress={openModal} hitSlop={8}>
              <Ionicons name="create-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {bio ? (
          <Text style={styles.aboutBody}>{bio}</Text>
        ) : isOwner ? (
          <TouchableOpacity onPress={openModal}>
            <Text style={styles.bioPlaceholder}>Tap to add a bio...</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["50%", "80%"]}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent}>
          <View style={sharedStyles.modalHeader}>
            <Text style={sharedStyles.modalTitle}>Edit Bio</Text>
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.bioTextInput}
            value={bioInput}
            onChangeText={setBioInput}
            multiline
            placeholder="Tell people about your business..."
            placeholderTextColor={Colors.textMuted}
            selectionColor={Colors.primary}
            maxLength={400}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bioInput.length}/400</Text>

          <TouchableOpacity
            style={[sharedStyles.saveBtn, saving && sharedStyles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={sharedStyles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  aboutCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 14,
  },
  aboutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  aboutTitle: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  aboutBody: { color: Colors.text, fontSize: 13, lineHeight: 20 },
  bioPlaceholder: { color: Colors.textMuted, fontSize: 13, fontStyle: "italic" },
  sheetBg: { backgroundColor: Colors.card },
  handle: { backgroundColor: Colors.textMuted },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 40 },
  bioTextInput: {
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 22,
    padding: 14,
    minHeight: 120,
    maxHeight: 200,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "right",
    marginTop: 6,
    marginBottom: 16,
  },
});
