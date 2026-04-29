import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";

const CYCLES = [
  { label: "Gym", image: require("../assets/images/onboarding-3.jpg") },
  { label: "Course", image: require("../assets/images/onboarding-2.jpg") },
  { label: "Class", image: require("../assets/images/onboarding-1.jpg") },
  { label: "Workout", image: require("../assets/images/onboarding-4.jpg") },
  {
    label: "Competitions",
    image: require("../assets/images/onboarding-5.jpg"),
  },
] as const;

const ROTATE_MS = 4000;

const TEXT_SLIDE_OUT_MS = 420;
const BG_FADE_OUT_MS = 420;
const BG_FADE_IN_MS = 520;
const PAUSE_AFTER_BG_MS = 160;
const TEXT_SLIDE_IN_MS = 520;
/** How far the word moves vertically (px) — old up, new from below */
const LABEL_SLIDE_PX = 52;

export default function SplashScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const imgOpacity = useRef(new Animated.Value(1)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;
  const labelTranslateY = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const advance = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    Animated.sequence([
      // 1) Word slides up + fades (new one will come from below)
      Animated.parallel([
        Animated.timing(labelTranslateY, {
          toValue: -LABEL_SLIDE_PX,
          duration: TEXT_SLIDE_OUT_MS,
          useNativeDriver: true,
        }),
        Animated.timing(labelOpacity, {
          toValue: 0,
          duration: TEXT_SLIDE_OUT_MS,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(imgOpacity, {
        toValue: 0,
        duration: BG_FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        isAnimating.current = false;
        return;
      }

      setIndex((i) => (i + 1) % CYCLES.length);

      labelOpacity.setValue(0);
      labelTranslateY.setValue(LABEL_SLIDE_PX);
      imgOpacity.setValue(0);

      requestAnimationFrame(() => {
        Animated.sequence([
          Animated.timing(imgOpacity, {
            toValue: 1,
            duration: BG_FADE_IN_MS,
            useNativeDriver: true,
          }),
          Animated.delay(PAUSE_AFTER_BG_MS),
          // New word: from below → baseline while fading in
          Animated.parallel([
            Animated.timing(labelTranslateY, {
              toValue: 0,
              duration: TEXT_SLIDE_IN_MS,
              useNativeDriver: true,
            }),
            Animated.timing(labelOpacity, {
              toValue: 1,
              duration: TEXT_SLIDE_IN_MS,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          labelTranslateY.setValue(0);
          isAnimating.current = false;
        });
      });
    });
  }, [imgOpacity, labelOpacity, labelTranslateY]);

  useEffect(() => {
    const id = setInterval(advance, ROTATE_MS);
    return () => clearInterval(id);
  }, [advance]);

  const current = CYCLES[index];

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        <Animated.View
          style={[StyleSheet.absoluteFillObject, { opacity: imgOpacity }]}
        >
          <ImageBackground
            source={current.image}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        </Animated.View>

        <View style={styles.overlay} pointerEvents="none" />

        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.slideContent}>
            <Text style={styles.slideTitle}>Find your</Text>
            <View style={styles.titleRow}>
              <Text style={styles.slideTitle}>Lokl </Text>
              <Animated.View
                style={[
                  styles.labelMotionWrap,
                  {
                    opacity: labelOpacity,
                    transform: [{ translateY: labelTranslateY }],
                  },
                ]}
              >
                <Text style={styles.slideTitle}>{current.label}</Text>
              </Animated.View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/auth/choose-role")}
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
  stage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  safe: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 28,
  },
  slideTitle: {
    fontSize: 40,
    fontWeight: "700",
    color: Colors.white,
    lineHeight: 48,
    letterSpacing: -0.5,
    textAlign: "left",
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
  },
  labelMotionWrap: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.black,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
