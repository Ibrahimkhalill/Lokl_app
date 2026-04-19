import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const CATEGORIES = [
  { id: '1', label: 'Yoga', icon: 'body-outline', active: true },
  { id: '2', label: 'Boxing', icon: 'fitness-outline', active: false },
  { id: '3', label: 'Basketball', icon: 'basketball-outline', active: false },
  { id: '4', label: 'Gym', icon: 'barbell-outline', active: false },
  { id: '5', label: 'Golf', icon: 'golf-outline', active: false },
  { id: '6', label: 'Cricket', icon: 'baseball-outline', active: false },
];

const RECENTLY_VIEWED = [
  {
    id: '1',
    name: 'Zen Garden Yoga',
    location: 'Kyoto, North Asian',
    distance: '1.2 k',
    price: '$45',
  },
  {
    id: '2',
    name: 'Gobi Yoga Camp',
    location: 'Gobi Desert, North Asian',
    distance: '1.3 k',
    price: '$30/hr',
  },
  {
    id: '3',
    name: 'Yoga Mountain',
    location: 'Gobi Desert, Asian',
    distance: '1.4 k',
    price: '$45',
  },
  {
    id: '4',
    name: 'Hanok Yoga',
    location: 'Seoul, Asian',
    distance: '1.5 k',
    price: '$50/hr',
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [activeCategory, setActiveCategory] = useState('1');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Search Bars */}
          <View style={styles.searchSection}>
            {/* Keyword search */}
            <View style={styles.searchBar}>
              <View style={styles.searchBarInner}>
                <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
                <View style={styles.divider} />
              </View>
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
                placeholderTextColor={Colors.textSecondary}
                autoFocus
              />
            </View>

            {/* Location search */}
            <View style={styles.searchBar}>
              <View style={styles.searchBarInner}>
                <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
                <View style={styles.regionChip}>
                  <Text style={styles.regionText}>North Asian</Text>
                </View>
              </View>
              <TextInput
                style={styles.searchInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Location..."
                placeholderTextColor={Colors.textSecondary}
              />
              <TouchableOpacity style={styles.closeChip} onPress={() => setLocation('')}>
                <Ionicons name="close" size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Chose Categories</Text>
             
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryItem}
                    onPress={() => setActiveCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.categoryIconWrap, isActive && styles.categoryIconActive]}>
                      <Ionicons
                        name={cat.icon as any}
                        size={22}
                        color={isActive ? Colors.primary : Colors.textSecondary}
                      />
                    </View>
                    <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Recently Viewed */}
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recently Viewed</Text>

            <View style={styles.recentList}>
              {RECENTLY_VIEWED.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentItem}
                  activeOpacity={0.8}
                  onPress={() => router.push('/home/details')}
                >
                  {/* Left: location icon + distance */}
                  <View style={styles.recentLeft}>
                    <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
                    <Text style={styles.recentDistance}>{item.distance}</Text>
                  </View>

                  {/* Middle: name + location */}
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName}>{item.name}</Text>
                    <Text style={styles.recentLocation}>{item.location}</Text>
                  </View>

                  {/* Right: price chip + action buttons */}
                  <View style={styles.recentRight}>
                    <View style={styles.priceChip}>
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                  </View>

                  <View style={styles.actionBtns}>
                    
                    <View style={styles.actionBtnGreen}>
                      <Ionicons name="navigate-outline" size={18} color={Colors.text} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20 },
  scroll: { paddingBottom: 120 },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  searchIconBtn: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: 'center', alignItems: 'center',
  },

  // Search
  searchSection: { gap: 12, marginBottom: 24 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2e3a3d',
    borderRadius: 24, height: 48,
    paddingHorizontal: 16, gap: 8,
    borderWidth: 1, borderColor: '#2e3a3d',
  },
  searchBarInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider: {
    width: 2, height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginLeft: 4,
  },
  searchInput: {
    flex: 1, color: Colors.text,
    fontSize: 14,
  },
  regionChip: {
    backgroundColor: Colors.text,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  regionText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  closeChip: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: 'center', alignItems: 'center',
  },

  // Categories
  categorySection: { marginBottom: 24 },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  seeAll: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryList: { gap: 16, paddingRight: 8 },
  categoryItem: {
    alignItems: 'center',
    gap: 4,
    width: 56,
  },
  categoryIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.cardBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  categoryIconActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(209,255,0,0.08)',
  },
  categoryLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: Colors.primary,
  },

  // Recently Viewed
  recentSection: {},
  recentTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  recentList: { gap: 12 },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e3a3d',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  recentLeft: {
    alignItems: 'center',
    gap: 4,
    width: 28,
  },
  recentDistance: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  recentInfo: { flex: 1 },
  recentName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  recentLocation: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  recentRight: { alignItems: 'flex-end' },
  priceChip: {
    borderWidth: 1,
    borderColor: '#2e3a3d',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  priceText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 0,
  },
  actionBtnDark: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#303030',
    justifyContent: 'center', alignItems: 'center',
  },
  actionBtnGreen: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(11,33,32,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
});