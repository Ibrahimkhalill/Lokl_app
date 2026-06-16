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
import { getErrorMessage } from "../../../lib/api";
import { CoachOffering } from "./types";

interface Props {
  offerings: CoachOffering[];
  isOwner: boolean;
  businessProfileId: number;
  onUpdate: () => void;
}

export default function OfferingsSection({
  offerings,
  isOwner,
  businessProfileId,
  onUpdate,
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [offeringName, setOfferingName] = useState("");
  const [offeringDescription, setOfferingDescription] = useState("");
  const [offeringPrice, setOfferingPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingOfferingId, setDeletingOfferingId] = useState<number | null>(null);

  const visible = isOwner || offerings.length > 0;
  if (!visible) return null;

  function openAddModal() {
    setOfferingName("");
    setOfferingDescription("");
    setOfferingPrice("");
    sheetRef.current?.present();
  }

  async function handleSaveOffering() {
    if (!offeringName.trim()) {
      Alert.alert("Validation", "Service name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload: { name: string; description?: string; price?: number } = {
        name: offeringName.trim(),
      };
      if (offeringDescription.trim()) payload.description = offeringDescription.trim();
      if (offeringPrice.trim()) {
        const parsed = parseFloat(offeringPrice.trim());
        if (!isNaN(parsed)) payload.price = parsed;
      }
      await businessService.addOffering(businessProfileId, payload);
      sheetRef.current?.dismiss();
      setOfferingName("");
      setOfferingDescription("");
      setOfferingPrice("");
      onUpdate();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOffering(offeringId: number) {
    Alert.alert("Remove Offering", "Delete this offering?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingOfferingId(offeringId);
          try {
            await businessService.deleteOffering(businessProfileId, offeringId);
            onUpdate();
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err));
          } finally {
            setDeletingOfferingId(null);
          }
        },
      },
    ]);
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
    <View>
      <View style={sharedStyles.sectionHeaderRow}>
        <Text style={sharedStyles.sectionHeader}>Offerings</Text>
        {isOwner && (
          <TouchableOpacity style={sharedStyles.sectionAddBtn} onPress={openAddModal}>
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={sharedStyles.sectionAddBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {offerings.length === 0 && isOwner && (
        <View style={sharedStyles.addPlaceholder}>
          <View style={sharedStyles.addPlaceholderIcon}>
            <Ionicons name="pricetag-outline" size={26} color={Colors.primary} />
          </View>
          <Text style={sharedStyles.addPlaceholderTitle}>Add Offerings</Text>
          <Text style={sharedStyles.addPlaceholderText}>List your services & pricing</Text>
        </View>
      )}

      {offerings.map((offering) => (
        <View key={offering.id} style={styles.offeringCard}>
          <View style={styles.offeringTopRow}>
            <Text style={styles.offeringName} numberOfLines={2}>{offering.name}</Text>
            {offering.price != null && (
              <Text style={styles.offeringPrice}>${offering.price}</Text>
            )}
            {isOwner && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteOffering(offering.id)}
                disabled={deletingOfferingId === offering.id}
              >
                {deletingOfferingId === offering.id ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                )}
              </TouchableOpacity>
            )}
          </View>
          {!!offering.description && (
            <Text style={styles.offeringDesc}>{offering.description}</Text>
          )}
        </View>
      ))}

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["62%", "88%"]}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheetContent}>
          <View style={sharedStyles.modalHeader}>
            <Text style={sharedStyles.modalTitle}>Add Offering</Text>
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={sharedStyles.modalLabel}>Service Name*</Text>
          <TextInput
            style={sharedStyles.modalInput}
            placeholder="e.g. Personal Training Session"
            placeholderTextColor={Colors.textMuted}
            value={offeringName}
            onChangeText={setOfferingName}
          />

          <Text style={sharedStyles.modalLabel}>Description (optional)</Text>
          <TextInput
            style={[sharedStyles.modalInput, styles.descriptionInput]}
            placeholder="Describe what's included..."
            placeholderTextColor={Colors.textMuted}
            value={offeringDescription}
            onChangeText={setOfferingDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={sharedStyles.modalLabel}>Price (optional)</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceLabelWrap}>
              <Text style={styles.priceCurrency}>$</Text>
            </View>
            <TextInput
              style={[sharedStyles.modalInput, styles.priceInput]}
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              value={offeringPrice}
              onChangeText={setOfferingPrice}
              keyboardType="decimal-pad"
            />
          </View>

          <TouchableOpacity
            style={[sharedStyles.saveBtn, saving && sharedStyles.saveBtnDisabled]}
            onPress={handleSaveOffering}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={sharedStyles.saveBtnText}>Add Offering</Text>
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: Colors.card },
  handle: { backgroundColor: Colors.textMuted },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 40 },
  offeringCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  offeringTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  offeringName: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: "700" },
  offeringPrice: { color: Colors.primary, fontSize: 15, fontWeight: "700" },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  offeringDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  descriptionInput: { height: 80, paddingTop: 12 },
  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  priceLabelWrap: {
    width: 40,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  priceCurrency: { color: Colors.textSecondary, fontSize: 16, fontWeight: "700" },
  priceInput: { flex: 1, marginBottom: 0 },
});
