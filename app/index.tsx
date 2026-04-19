import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Find your\nLokl Gym',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  },
  {
    id: '2',
    title: 'Find your\nLokl Course',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
  },
  {
    id: '3',
    title: 'Find your\nLokl Class',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  },
  {
    id: '4',
    title: 'Find your\nLokl Workout',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
  },
];

export default function SplashScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.slide}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle}>{item.title}</Text>
      </View>
    </ImageBackground>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/auth/choose-role')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 200,
  },
  slideTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.black,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
