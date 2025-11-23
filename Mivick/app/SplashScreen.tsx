import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../components/styles/styleSplashScreen";

export default function SplashScreen() {
  const router = useRouter();


  // LOGO ANIMATIONS
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  // TEXT GLOW
  const textGlow = useRef(new Animated.Value(1)).current;

  // TYPEWRITER STATE
  const fullText = "Mivick, segurança é essencial.";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    // Logo: fade + scale suave
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Glow do texto
    Animated.loop(
      Animated.sequence([
        Animated.timing(textGlow, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textGlow, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Typewriter extremamente suave
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, index));
      index++;

      if (index > fullText.length) {
        clearInterval(interval);
      }
    }, 60);

    // Redirecionamento
    const timeout = setTimeout(() => {
      router.replace("./index");
    }, 3800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <Animated.Image
        source={require("../assets/images/LogoPrincipal.png")}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />



      {/* TEXTO TYPEWRITER */}
      <Animated.Text
        style={[
          styles.text,
          {
            transform: [{ scale: textGlow }],
            textAlign: "center",
            marginTop: 12,
          },
        ]}
      >
        {displayedText}
      </Animated.Text>
    </View>
  );
}
