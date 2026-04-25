import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton, Screen } from "../../components/ui";
import { Colors } from "../../constants/colors";
import FindIcon from "../../assets/icons/find.svg";
import SearchIcon from "../../assets/icons/search.svg";

const ALL_TAGS = [
  "Pickleball",
  "Golf",
  "Soccer",
  "Boxing",
  "Climbing",
  "Yoga",
  "Barre",
  "Cycling",
  "Training",
  "Strength",
  "Gym",
  "Trainers",
  "Tennis",
  "Basketball",
  "Running",
  "Swimming",
  "Pilates",
  "HIIT",
  "CrossFit",
  "Martial Arts",
  "Dance",
  "Rowing",
  "Volleyball",
];

export default function WhatAreYouInto() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filtered = ALL_TAGS.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>WHAT ARE YOU INTO?</Text>
          <Text style={styles.subtitle}>Select all that apply</Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <SearchIcon width={16} height={16} color={Colors.textSecondary} />
          <FindIcon width={16} height={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="find your activities tag"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tags */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.tagsScroll}
        >
          <View style={styles.tagsWrap}>
            {filtered.map((tag) => {
              const isSelected = selected.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, isSelected && styles.tagSelected]}
                  onPress={() => toggle(tag)}
                  activeOpacity={0.8}
                >
                  <FindIcon
                    width={13}
                    height={13}
                    color={isSelected ? Colors.black : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tagText,
                      isSelected && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          <PrimaryButton
            title={`Continue (${selected.length} Selected)`}
            onPress={() => router.push("/auth/what-looking-for")}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,

    paddingTop: 48,
    paddingBottom: 32,
  },
  top: { marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E3A3F",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
    gap: 6,
  },
  searchIcon: {},
  tagIcon: {},
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  tagsScroll: { flex: 1 },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 16,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: "#2E3A3F",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  tagSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  tagText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  tagTextSelected: {
    color: Colors.black,
    fontWeight: "600",
  },
  bottom: { paddingTop: 8 },
});
