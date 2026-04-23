import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function BusinessEventDetailScreen() {
  const router = useRouter();
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Carousel */}
        <View style={s.hero}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' }}
            style={s.heroImage}
            resizeMode="cover"
          />
          {/* Back button */}
          <TouchableOpacity style={s.heroBack} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          {/* Prev / Next */}
          <TouchableOpacity style={[s.slideBtn, { left: 14 }]}>
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.slideBtn, { right: 14 }]}>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </TouchableOpacity>
          {/* Dots */}
          <View style={s.heroDots}>
            {[0,1,2].map((i) => (
              <View key={i} style={[s.heroDot, i === imgIdx && s.heroDotActive]} />
            ))}
          </View>
        </View>

        <View style={s.content}>
          {/* Title + meta */}
          <Text style={s.title}>ZEN YOGA STUDIO</Text>
          <View style={s.metaRow}>
            <View style={s.tagChip}><Text style={s.tagText}>Yoga</Text></View>
            <View style={s.scoreChip}><Text style={s.scoreText}>9.2</Text></View>
            <Text style={s.metaText}>$$</Text>
            <View style={s.metaDot} />
            <Text style={s.metaText}>1.2 mi</Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="logo-usd" size={14} color={Colors.text} />
            <Text style={s.priceText}>$2500</Text>
          </View>

          {/* Description */}
          <Text style={s.description}>
            Experience the tranquility of Zen Yoga Studio, where ancient practices meet modern wellness. Our expert instructors guide you through transformative sessions in our serene, state-of-the-art facilities.
          </Text>

          {/* Info Cards */}
          {[
            { icon: 'location-outline', label: 'Venue', value: 'Central Park' },
            { icon: 'navigate-circle-outline', label: 'Location', value: 'New York' },
            { icon: 'time-outline', label: 'Time & Date', value: 'Mon-Fri: 6AM-10PM, Sat-Sun: 8AM-AM' },
            { icon: 'people-outline', label: 'Max Participants', value: '120' },
            { icon: 'globe-outline', label: 'Website', value: 'Zenyogastudio.com', link: true },
          ].map((info, i) => (
            <View key={i} style={s.infoCard}>
              <Ionicons name={info.icon as any} size={20} color={Colors.primary} />
              <View style={s.infoText}>
                <Text style={s.infoLabel}>{info.label}</Text>
                <Text style={[s.infoValue, (info as any).link && s.infoLink]}>
                  {info.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroBack: {
    position: 'absolute', top: 52, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(20,22,26,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  slideBtn: {
    position: 'absolute', top: '50%', marginTop: -16,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(20,22,26,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroDots: {
    position: 'absolute', bottom: 14,
    alignSelf: 'center', flexDirection: 'row', gap: 6,
  },
  heroDot: {
    width: 8, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  heroDotActive: { width: 22, backgroundColor: Colors.primary },
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 40 },
  title: {
    color: Colors.text, fontSize: 24,
    fontWeight: '800', letterSpacing: 0.3, marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 16, flexWrap: 'wrap',
  },
  tagChip: {
    borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12,
  },
  tagText: { color: Colors.text, fontSize: 13 },
  scoreChip: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingVertical: 3, paddingHorizontal: 10,
  },
  scoreText: { color: Colors.black, fontSize: 13, fontWeight: '800' },
  metaText: { color: Colors.textSecondary, fontSize: 13 },
  metaDot: {
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: Colors.textSecondary,
  },
  priceText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  description: {
    color: Colors.textSecondary, fontSize: 14,
    lineHeight: 22, marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: Colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 15, marginBottom: 10,
  },
  infoText: { flex: 1 },
  infoLabel: { color: Colors.textMuted, fontSize: 12, marginBottom: 3 },
  infoValue: { color: Colors.text, fontSize: 14 },
  infoLink: { color: Colors.primary },
});
