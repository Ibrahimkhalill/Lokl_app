import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const SHARE_OPTIONS = [
  { icon: 'chatbubble-outline', label: 'Messages', color: '#34C759' },
  { icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366' },
  { icon: 'mail-outline', label: 'Email', color: '#5AC8FA' },
  { icon: 'link-outline', label: 'More', color: Colors.textSecondary },
];

export default function ShareEventScreen() {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Event Card */}
        <View style={styles.eventCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80' }}
            style={styles.eventImage}
          />
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>PICKUP BASKETBALL</Text>
            <View style={styles.eventMeta}>
              <Text style={styles.eventMetaText}>Tomorrow</Text>
              <View style={styles.metaDot} />
              <Text style={styles.eventMetaText}>Downtown Courts</Text>
            </View>
          </View>
        </View>

        {/* Event Link */}
        <Text style={styles.label}>Event Link</Text>
        <View style={styles.linkRow}>
          <Text style={styles.linkText} numberOfLines={1}>https://lokl.app/event/2</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={16} color={Colors.black} />
            <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy'}</Text>
          </TouchableOpacity>
        </View>

        {/* Share Options */}
        <Text style={styles.label}>Share</Text>
        <View style={styles.shareGrid}>
          {SHARE_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.label} style={styles.shareOption} activeOpacity={0.8}>
              <View style={styles.shareIconWrap}>
                <Ionicons name={opt.icon as any} size={24} color={opt.color} />
              </View>
              <Text style={styles.shareLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1,
    borderColor: Colors.cardBorder, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  eventCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 14, marginBottom: 24,
  },
  eventImage: { width: 52, height: 52, borderRadius: 10 },
  eventInfo: { flex: 1 },
  eventName: { color: Colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventMetaText: { color: Colors.textSecondary, fontSize: 13 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textSecondary },
  label: { color: Colors.text, fontSize: 15, fontWeight: '600', marginBottom: 12 },
  linkRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.cardBorder,
    height: 52, paddingLeft: 14, marginBottom: 24, overflow: 'hidden',
  },
  linkText: { flex: 1, color: Colors.textSecondary, fontSize: 14 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: 16,
    height: '100%', borderRadius: 12,
  },
  copyText: { color: Colors.black, fontSize: 14, fontWeight: '700' },
  shareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  shareOption: {
    width: '47%', backgroundColor: Colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 20, alignItems: 'center', gap: 10,
  },
  shareIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.iconBg, justifyContent: 'center', alignItems: 'center',
  },
  shareLabel: { color: Colors.text, fontSize: 14, fontWeight: '500' },
});
