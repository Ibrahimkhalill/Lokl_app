import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/ui';
import { Colors } from '../../constants/colors';

export default function Location() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.center}>
          <View style={styles.iconWrap}>
            <Ionicons name="location-outline" size={44} color={Colors.text} />
          </View>
          <Text style={styles.title}>FIND VENUES{'\n'}NEAR YOU</Text>
          <Text style={styles.subtitle}>
            we'll show you the best spots based on your location
          </Text>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title="Enable Location"
            onPress={() => router.push('/auth/congratulations')}
          />
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.push('/auth/congratulations')}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  bottom: { gap: 12 },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: Colors.text,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
