import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Load the icon font up front so a map pin is never drawn (and frozen) before its icon is ready
MaterialCommunityIcons.loadFont().catch(() => {});
Ionicons.loadFont().catch(() => {});

type Entry = { lib: "ion" | "mci"; name: string };

/** One icon per category, used on the map pins, the Search categories row and the Filters screen. */
const CATEGORY_ICONS: Record<string, Entry> = {
  "boxing & combat":     { lib: "mci", name: "boxing-glove" },
  "yoga & pilates":      { lib: "mci", name: "meditation" },
  "strength & crossfit": { lib: "ion", name: "barbell-outline" },
  "court sports":        { lib: "ion", name: "basketball-outline" },
  "cycling & cardio":    { lib: "mci", name: "heart-pulse" },
  "outdoor & adventure": { lib: "ion", name: "golf-outline" },
  "classes & studios":   { lib: "ion", name: "body-outline" },
  "wellness & recovery": { lib: "ion", name: "heart-outline" },
};

export function CategoryIcon({
  type,
  size = 18,
  color,
  fallback = "location-outline",
}: {
  type?: string | null;
  size?: number;
  color: string;
  fallback?: string;
}) {
  const entry = CATEGORY_ICONS[(type ?? "").trim().toLowerCase()];
  if (entry?.lib === "mci") {
    return <MaterialCommunityIcons name={entry.name as any} size={size} color={color} />;
  }
  return <Ionicons name={(entry?.name ?? fallback) as any} size={size} color={color} />;
}
