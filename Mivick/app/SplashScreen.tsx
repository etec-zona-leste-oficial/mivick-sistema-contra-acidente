import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../components/styles/styleSplashScreen";

export default function SplashScreen() {
  const router = useRouter();

  // Valores animados
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const textGlow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        bounciness: 14,       
        speed: 6,
        useNativeDriver: true,
      })
    ]).start();
    // 2️⃣ Texto aparece com fade + slide
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        delay: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();

    // 3️⃣ Efeito de glow pulsante
    Animated.loop(
      Animated.sequence([
        Animated.timing(textGlow, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textGlow, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // 4️⃣ Navegar para Home após 2s
    const timeout = setTimeout(() => {
      router.replace("./index");
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <Animated.Image
        source={require("../assets/images/logo.png")}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />

      {/* TEXTO */}
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: textOpacity,
            transform: [{ translateY: slideUp }, { scale: textGlow }],
          },
        ]}
      >
        Mivick, segurança é essencial.
      </Animated.Text>
    </View>
  );
}
