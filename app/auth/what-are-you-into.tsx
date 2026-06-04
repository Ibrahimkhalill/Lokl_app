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
import { AuthHeaderBlock } from "../../components/auth";
import { Colors } from "../../constants/colors";
import FindIcon from "../../assets/icons/find.svg";
import SearchIcon from "../../assets/icons/search.svg";

const ALL_TAGS = [
  "Basketball",
  "Tennis / pickleball",
  "Soccer",
  "Baseball / softball",
  "Golf",
  "Driving range",
  "Skating rink",
  "Skate park",
  "Yoga",
  "Pilates",
  "Dance",
  "Barre",
  "Stretch lab",
  "Cycling",
  "Boxing",
  "Martial arts studio",
  "Climbing gym",
  "Personal trainer",
  "Strength coach",
  "Golf instructor",
  "Tennis Coach",
  "Boxing trainer",
  "Running coach",
  "Yoga instructor",
  "Chiropractor",
  "Physical therapy",
  "Acupuncture",
  "Massage therapy",
  "IV therapy",
  "Sauna / cold plunge",
  "Cryotherapy",
  "Sports recovery center",
  "Salon",
  "Barbershop",
  "Tanning Salon",
  "Waxing studio",
  "Makeup Studio",
  "Strength & conditioning coach",
  "Weightlifting / powerlifting coach",
  "Bodybuilding coach",
  "Cross-training / HIIT coach",
  "Functional fitness",
  "Basketball trainer",
  "Tennis / pickleball coach",
  "Soccer trainer",
  "Baseball / softball coach",
  "Golf instructors",
  "Cycling coach",
  "Swimming coach",
  "Boxing coach",
  "MMA / martial arts instructor",
  "Wrestling coach",
  "Pilates instructor",
  "Barre instructor",
  "Dance instructor",
  "Spin / cycling instructor",
  "Zumba / cardio dance instructor",
  "Mobility / flexibility coach",
  "Stretch therapist",
  "Breathwork instructor",
  "Physical therapist",
  "Massage therapist",
  "Sports massage specialist",
  "Acupuncturist",
  "Cupping therapy practitioner",
  "IV therapy provider",
];

export default function WhatAreYouInto() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filtered = ALL_TAGS.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <AuthHeaderBlock
          title="WHAT ARE YOU INTO?"
          subtitle="Select all that apply"
          containerStyle={styles.top}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
        />

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
          keyboardShouldPersistTaps="handled"
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
                    style={[styles.tagText, isSelected && styles.tagTextSelected]}
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
            onPress={() =>
              router.push({
                pathname: "/auth/what-looking-for",
                params: { sports: JSON.stringify(selected) },
              })
            }
            disabled={selected.length === 0}
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
    // paddingBottom: 32,
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
  bottom: { paddingTop: 0 },
  hint: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 32,
  },
});
