import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ImageBackground,
  TouchableOpacity,
  ImageSourcePropType,
  Text,
  StyleProp,
  ViewStyle,
  PanResponder,
  Animated,
} from 'react-native';
import { styles } from './styleCarrousel';

interface CarouselProps {
  images: ImageSourcePropType[];
  autoPlayInterval?: number;
  style?: StyleProp<ViewStyle>;
}

export function FirstCarrousel({ images, autoPlayInterval = 5000, style }: CarouselProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Para criar animação de movimento horizontal
  const pan = useRef(new Animated.Value(0)).current;

  // Detectar gestos
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 20; // começa a responder quando arrastar horizontalmente
      },

      onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -80) {
          // swipe para esquerda → próxima imagem
          goToNext();
        } else if (gesture.dx > 80) {
          // swipe para direita → imagem anterior
          goToPrevious();
        }

        // reset position
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // Funções de troca manual
  const goToNext = () => {
    setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPrevious = () => {
    setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // autoplay
  useEffect(() => {
    if (!images || images.length <= 1) return;

    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [images?.length, autoPlayInterval]);

  if (!images || images.length === 0) {
    return (
      <View
        style={[
          styles.carouselContainer,
          { justifyContent: 'center', alignItems: 'center' },
          style,
        ]}
      >
        <Text style={{ color: '#fff' }}>Sem imagens</Text>
      </View>
    );
  }

  return (
    <View style={[styles.carouselContainer, style]}>
      <Animated.View style={{ transform: [{ translateX: pan }] }} {...panResponder.panHandlers}>
        <ImageBackground
          source={images[activeImageIndex]}
          style={[styles.imageBackground, { width: '100%', height: '100%' }]}
          resizeMode="cover"
        >
          <View style={styles.overlay} />

          {/* Indicadores */}
          <View style={styles.indicatorsWrapper}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  index === activeImageIndex
                    ? { backgroundColor: '#FF4500' }
                    : { backgroundColor: 'rgba(255,255,255,0.35)' },
                ]}
                onPress={() => setActiveImageIndex(index)}
                activeOpacity={0.8}
              />
            ))}
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}
