// screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../components/styles/styleSplashScreen';

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current; // começa mais embaixo

  useEffect(() => {

    // 1️⃣ Fade da logo
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 2️⃣ Texto aparece com delay + slide up
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 700,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      })
    ]).start();

    // 3️⃣ Navegar para Home após 2 segundos
    const timeout = setTimeout(() => {
      router.replace("./index");
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>

      {/* LOGO ANIMADA */}
      <Animated.Image
        source={require('../assets/images/logo.png')} // sua logo aqui
        style={[styles.logo, { opacity: logoOpacity }]}
        resizeMode="contain"
      />

      {/* TEXTO ANIMADO */}
      <Animated.Text
        style={[
          styles.text,
          { 
            opacity: textOpacity,
            transform: [{ translateY: slideUp }]
          }
        ]}
      >
        Mivick, segurança é essencial.
      </Animated.Text>

    </View>
  );
}
