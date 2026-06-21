import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { FeaturedReview } from "./types";

interface Props {
  reviews: FeaturedReview[];
  isOwner: boolean;
  businessProfileId: number;
  onUpdate: () => void;
}

interface AvailableReview {
  id: number;
  user_name: string;
  rating?: number;
  comment?: string;
  event_name?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function FeaturedReviews({ reviews, isOwner, businessProfileId, onUpdate }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [available, setAvailable] = useState<AvailableReview[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [unfeaturingId, setUnfeaturingId] = useState<number | null>(null);
  const [pinningId, setPinningId] = useState<number | null>(null);

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

  if (!isOwner && reviews.length === 0) return null;

  const openPicker = async () => {
    sheetRef.current?.present();
    setLoadingAvailable(true);
    try {
      const res = await businessService.getAvailableReviews(businessProfileId);
      const payload = res.data?.data ?? res.data;
      setAvailable(
        Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
          ? payload.results
          : []
      );
    } catch {
      setAvailable([]);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleUnfeature = (fid: number) => {
    Alert.alert("Unpin Review", "Remove this review from your featured section?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setUnfeaturingId(fid);
          try {
            await businessService.deleteFeaturedReview(businessProfileId, fid);
            onUpdate();
          } catch (err) {
            Alert.alert("Error", getErrorMessage(err));
          } finally {
            setUnfeaturingId(null);
          }
        },
      },
    ]);
  };

  const handlePin = async (reviewId: number) => {
    setPinningId(reviewId);
    try {
      await businessService.addFeaturedReview(businessProfileId, reviewId);
      sheetRef.current?.dismiss();
      onUpdate();
    } catch (err) {
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setPinningId(null);
    }
  };

  return (
    <>
      {/* Section header */}
      <View style={sharedStyles.sectionHeaderRow}>
        <Text style={sharedStyles.sectionHeader}>Featured Reviews</Text>
        {isOwner && reviews.length < 3 && (
          <TouchableOpacity
            style={sharedStyles.sectionAddBtn}
            onPress={openPicker}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={sharedStyles.sectionAddBtnText}>Pin Review</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty state */}
      {reviews.length === 0 && isOwner && (
        <TouchableOpacity
          style={sharedStyles.addPlaceholder}
          onPress={openPicker}
          activeOpacity={0.8}
        >
          <View style={sharedStyles.addPlaceholderIcon}>
            <Ionicons name="star-outline" size={26} color={Colors.primary} />
          </View>
          <Text style={sharedStyles.addPlaceholderTitle}>Pin your best reviews</Text>
          <Text style={sharedStyles.addPlaceholderText}>
            Highlight up to 3 reviews on your profile
          </Text>
        </TouchableOpacity>
      )}

      {/* Pinned review cards — same style as infoCard/reviewCard pattern */}
      {reviews.map((review) => (
        <View key={review.id} style={sharedStyles.reviewCard}>
          {/* Author row */}
          <View style={sharedStyles.reviewHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(review.reviewer_name || "U")}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={sharedStyles.reviewerName} numberOfLines={1}>
                {review.reviewer_name || "User"}
              </Text>
              {!!(review as any).event_name && (
                <View style={styles.venueRow}>
                  <Ionicons name="calendar-outline" size={10} color={Colors.textMuted} />
                  <Text style={styles.venueText}>{(review as any).event_name}</Text>
                </View>
              )}
            </View>
            {review.review_rating != null && (
              <View style={sharedStyles.ratingBadge}>
                <Text style={sharedStyles.ratingText}>
                  ★ {review.review_rating.toFixed(1)}
                </Text>
              </View>
            )}
            {isOwner && (
              <TouchableOpacity
                onPress={() => handleUnfeature(review.id)}
                disabled={unfeaturingId === review.id}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 6 }}
              >
                {unfeaturingId === review.id ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Comment */}
          {!!review.review_comment && (
            <Text style={sharedStyles.reviewComment}>
              {'"'}{review.review_comment}{'"'}
            </Text>
          )}
        </View>
      ))}

      {/* Pin picker — BottomSheetModal like other sections */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["72%", "92%"]}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={sharedStyles.modalHeader}>
            <Text style={sharedStyles.modalTitle}>Pin a Review</Text>
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loadingAvailable ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : available.length === 0 ? (
            <View style={sharedStyles.addPlaceholder}>
              <View style={sharedStyles.addPlaceholderIcon}>
                <Ionicons name="star-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={sharedStyles.addPlaceholderTitle}>No reviews yet</Text>
              <Text style={sharedStyles.addPlaceholderText}>
                Reviews appear here once attendees rate your events
              </Text>
            </View>
          ) : (
            available.map((r) => (
              <View key={r.id} style={[sharedStyles.reviewPickerRow, styles.pickerRow]}>
                {/* Avatar */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(r.user_name || "U")}</Text>
                </View>

                {/* Name + venue + comment */}
                <View style={{ flex: 1 }}>
                  <Text style={sharedStyles.reviewerName}>{r.user_name || "User"}</Text>
                  {!!r.event_name && (
                    <View style={styles.venueRow}>
                      <Ionicons name="calendar-outline" size={10} color={Colors.textMuted} />
                      <Text style={styles.venueText}>{r.event_name}</Text>
                    </View>
                  )}
                  {!!r.comment && (
                    <Text style={[sharedStyles.reviewComment, { marginTop: 4 }]} numberOfLines={2}>
                      "{r.comment}"
                    </Text>
                  )}
                </View>

                {/* Rating */}
                {r.rating != null && (
                  <View style={sharedStyles.ratingBadge}>
                    <Text style={sharedStyles.ratingText}>★ {r.rating.toFixed(1)}</Text>
                  </View>
                )}

                {/* Pin button */}
                <TouchableOpacity
                  style={styles.pinBtn}
                  onPress={() => handlePin(r.id)}
                  disabled={pinningId === r.id}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {pinningId === r.id ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Ionicons name="add" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: Colors.card },
  handle: { backgroundColor: Colors.textMuted },
  sheetContent: { paddingBottom: 40 },
  pickerRow: { paddingHorizontal: 16 },
  loadingWrap: { paddingVertical: 48, alignItems: "center" },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(209,255,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(209,255,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  venueText: {
    color: Colors.textMuted,
    fontSize: 11,
  },

  pinBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(209,255,0,0.1)",
    borderWidth: 1,
    borderColor: "rgba(209,255,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
