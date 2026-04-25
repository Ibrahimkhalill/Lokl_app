import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../constants/colors";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Find your\nLokl Gym",
    image: require("../assets/images/onboarding-3.png"),
  },
  {
    id: "2",
    title: "Find your\nLokl Course",
    image: require("../assets/images/onboarding-2.png"),
  },
  {
    id: "3",
    title: "Find your\nLokl Class",
    image: require("../assets/images/onboarding-1.png"),
  },
  {
    id: "4",
    title: "Find your\nLokl Workout",
    image: require("../assets/images/onboarding-4.png"),
  },
  {
    id: "5",
    title: "Find your\nLokl Competition",
    image: require("../assets/images/onboarding-5.png"),
  },
];

export default function SplashScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];

  const handlePrimaryPress = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    if (isLastSlide) {
      router.push("/auth/choose-role");
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={currentSlide.image}
        style={styles.slide}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.slideContent}>
          <Text style={styles.slideTitle}>{currentSlide.title}</Text>
        </View>
      </ImageBackground>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePrimaryPress}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
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
    backgroundColor: "rgba(0,0,0,0.35)",
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
