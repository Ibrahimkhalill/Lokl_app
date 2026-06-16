import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/colors";
import { sharedStyles } from "./sharedStyles";
import { businessService } from "../../../services/businessService";
import { getErrorMessage } from "../../../lib/api";
import { FeaturedReview } from "./types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  venue_name?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <View style={styles.ratingPill}>
      <Ionicons name="star" size={10} color="#000" />
      <Text style={styles.ratingPillText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export function FeaturedReviews({
  reviews,
  isOwner,
  businessProfileId,
  onUpdate,
}: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [available, setAvailable] = useState<AvailableReview[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [unfeaturingId, setUnfeaturingId] = useState<number | null>(null);
  const [pinningId, setPinningId] = useState<number | null>(null);

  if (!isOwner && reviews.length === 0) return null;

  const openPicker = async () => {
    setPickerVisible(true);
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

  const handleUnfeature = async (fid: number) => {
    Alert.alert(
      "Unpin Review",
      "Remove this review from your featured section?",
      [
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
      ]
    );
  };

  const handlePin = async (reviewId: number) => {
    setPinningId(reviewId);
    try {
      await businessService.addFeaturedReview(businessProfileId, reviewId);
      setPickerVisible(false);
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
        </TouchableOpacity>
      )}

      {/* Pinned review cards */}
      {reviews.map((review) => (
        <View key={review.id} style={styles.pinnedCard}>
          {/* Quote mark */}
          <Text style={styles.quoteChar}>"</Text>

          {/* Comment */}
          {!!review.review_comment && (
            <Text style={styles.pinnedComment}>{review.review_comment}</Text>
          )}

          {/* Bottom row: avatar + name + rating + delete */}
          <View style={styles.pinnedFooter}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {getInitials(review.reviewer_name || "U")}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pinnedName}>{review.reviewer_name || "User"}</Text>
              {!!(review as any).venue_name && (
                <View style={styles.venueRow}>
                  <Ionicons name="location-outline" size={10} color={Colors.textMuted} />
                  <Text style={styles.pinnedVenue}>{(review as any).venue_name}</Text>
                </View>
              )}
            </View>
            {review.review_rating != null && (
              <RatingBadge rating={review.review_rating} />
            )}
            {isOwner && (
              <TouchableOpacity
                onPress={() => handleUnfeature(review.id)}
                disabled={unfeaturingId === review.id}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 10 }}
              >
                {unfeaturingId === review.id ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {/* Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable style={sharedStyles.modalOverlay} onPress={() => setPickerVisible(false)} />
        <View style={[sharedStyles.modalSheet, { maxHeight: SCREEN_HEIGHT * 0.82 }]}>
          <View style={sharedStyles.modalHandle} />
          <View style={sharedStyles.modalHeader}>
            <Text style={sharedStyles.modalTitle}>Pin a Review</Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loadingAvailable ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : available.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="star-outline" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No reviews available to pin</Text>
              <Text style={styles.emptySubtitle}>
                When people attend and review your events, you can pin those reviews here
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.pickerList}
            >
              {available.map((r) => (
                <View key={r.id} style={styles.pickerCard}>
                  {/* Top row: avatar + name + rating */}
                  <View style={styles.pickerTopRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitials}>
                        {getInitials(r.user_name || "U")}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickerName}>{r.user_name || "User"}</Text>
                      {!!r.venue_name && (
                        <View style={styles.venueRow}>
                          <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                          <Text style={styles.pickerVenue}>{r.venue_name}</Text>
                        </View>
                      )}
                    </View>
                    {r.rating != null && <RatingBadge rating={r.rating} />}
                  </View>

                  {/* Comment */}
                  {!!r.comment && (
                    <Text style={styles.pickerComment} numberOfLines={3}>
                      "{r.comment}"
                    </Text>
                  )}

                  {/* Pin button */}
                  <TouchableOpacity
                    style={styles.pinBtn}
                    onPress={() => handlePin(r.id)}
                    disabled={pinningId === r.id}
                    activeOpacity={0.8}
                  >
                    {pinningId === r.id ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <>
                        <Ionicons name="pin-outline" size={14} color="#000" />
                        <Text style={styles.pinBtnText}>Pin to Profile</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  /* ── Pinned review cards ── */
  pinnedCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  quoteChar: {
    fontSize: 42,
    lineHeight: 36,
    color: Colors.primary,
    fontWeight: "800",
    marginBottom: 4,
  },
  pinnedComment: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  pinnedFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.cardBorder,
    paddingTop: 12,
  },
  pinnedName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  pinnedVenue: {
    color: Colors.textMuted,
    fontSize: 11,
    marginLeft: 3,
  },

  /* ── Avatar ── */
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "22",
    borderWidth: 1.5,
    borderColor: Colors.primary + "55",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  /* ── Rating pill ── */
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingPillText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },

  /* ── Venue row ── */
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  /* ── Picker modal ── */
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 12,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  pickerList: {
    padding: 16,
    gap: 12,
  },
  pickerCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  pickerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  pickerName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  pickerVenue: {
    color: Colors.textMuted,
    fontSize: 11,
    marginLeft: 3,
  },
  pickerComment: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
    marginBottom: 14,
    paddingLeft: 2,
  },
  pinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
  },
  pinBtnText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
});
