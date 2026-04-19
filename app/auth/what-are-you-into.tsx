import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/ui';
import { Colors } from '../../constants/colors';

const ALL_TAGS = [
  'Pickleball', 'Golf', 'Soccer', 'Boxing', 'Climbing', 'Yoga',
  'Barre', 'Cycling', 'Training', 'Strength', 'Gym', 'Trainers',
  'Tennis', 'Basketball', 'Running', 'Swimming', 'Pilates', 'HIIT',
  'CrossFit', 'Martial Arts', 'Dance', 'Rowing', 'Volleyball',
];

export default function WhatAreYouInto() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filtered = ALL_TAGS.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>WHAT ARE YOU INTO?</Text>
          <Text style={styles.subtitle}>Select all that apply</Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} style={styles.searchIcon} />
          <Ionicons name="location-outline" size={16} color={Colors.textSecondary} style={styles.tagIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="find your activities tag"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tags */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.tagsScroll}>
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
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
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
            onPress={() => router.push('/auth/what-looking-for')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  top: { marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tagSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(209,255,0,0.08)',
  },
  tagText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottom: { paddingTop: 8 },
});
