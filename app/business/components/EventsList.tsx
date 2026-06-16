import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/colors";
import { businessService } from "../../../services/businessService";
import { getErrorMessage } from "../../../lib/api";
import { EventItem } from "./types";
import { EmptyState } from "../../../components/primitives";
import StudentsIcon from "../../../assets/icons/students.svg";
import DollarIcon from "../../../assets/icons/dollar.svg";
import StarIcon from "../../../assets/icons/star.svg";

interface Props {
  events: EventItem[];
  isOwner: boolean;
  onEventDeleted: (id: number) => void;
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i + 0.5 < rating || i + 1 <= rating;
    return (
      <StarIcon
        key={i}
        width={13}
        height={13}
        color={filled ? "#D1FF00" : "#2A2A2A"}
      />
    );
  });
}

export function EventsList({ events, isOwner, onEventDeleted }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (events.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="No events yet"
        subtitle="Create your first event to get started"
      />
    );
  }

  const handleDeleteEvent = (event: EventItem) => {
    Alert.alert(
      "Delete Event",
      `Delete "${event.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(event.id);
            try {
              await businessService.deleteEvent(event.id);
              onEventDeleted(event.id);
            } catch (err) {
              Alert.alert("Error", getErrorMessage(err));
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.listContainer}>
      {events.map((event) => {
        const rating = event.average_rating ?? 0;
        const reviewCount = event.review_count ?? 0;
        const price =
          typeof event.price === "number"
            ? event.price === 0
              ? "Free"
              : `$${event.price.toFixed(2)}`
            : event.price === "0" || event.price === "0.00"
            ? "Free"
            : `$${event.price}`;

        return (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push(`/business/event-detail?id=${event.id}` as any)
            }
          >
            {/* Cover image area */}
            <View style={styles.coverArea}>
              {event.cover_image_url ? (
                <Image
                  source={{ uri: event.cover_image_url }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.coverPlaceholder} />
              )}

              {/* Dark overlay */}
              <View style={styles.coverOverlay} />

              {/* Status badge — top left */}
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {event.status?.toUpperCase() ?? "ACTIVE"}
                </Text>
              </View>

              {/* Event title — bottom left */}
              <Text style={styles.coverTitle} numberOfLines={2}>
                {event.title}
              </Text>
            </View>

            {/* Card body */}
            <View style={styles.cardBody}>
              {/* Description */}
              {!!event.description && (
                <Text
                  style={styles.description}
                  numberOfLines={3}
                >
                  {event.description}
                </Text>
              )}

              {/* Stars + review count */}
              {reviewCount > 0 && (
                <View style={styles.metaRow}>
                  <View style={styles.starsRow}>
                    {renderStars(rating)}
                  </View>
                  <Text style={styles.metaText}>
                    {rating.toFixed(1)} ({reviewCount})
                  </Text>
                </View>
              )}

              {/* Enrolled count */}
              <View style={styles.metaRow}>
                <StudentsIcon width={15} height={15} color={Colors.textSecondary} />
                <Text style={styles.metaText}>
                  {event.registered ?? 0} enrolled
                </Text>
              </View>

              {/* Price + delete button */}
              <View style={styles.priceRow}>
                <View style={styles.metaRow}>
                  <DollarIcon width={15} height={15} color={Colors.primary} />
                  <Text style={styles.priceText}>{price}</Text>
                </View>

                {isOwner && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteEvent(event)}
                    disabled={deletingId === event.id}
                    activeOpacity={0.8}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    {deletingId === event.id ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Ionicons name="trash-outline" size={16} color={Colors.white} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 24,
  },

  // Event card
  eventCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.secondaryCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden",
  },

  // Cover image area
  coverArea: {
    height: 170,
    position: "relative",
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.card,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: Colors.black,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  coverTitle: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },

  // Card body
  cardBody: {
    padding: 14,
    gap: 8,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  priceText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  // Delete button
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
});
