import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { FirstButton } from '@/components/FirstButton';
import { FirstCarrousel } from '@/components/FirstCarrousel';
import { styles } from '../components/styles/styleHome';

// Imagens do carrossel
const carouselImages = [
  require('../assets/images/ciclimoto.jpg'),
  require('../assets/images/Rodovia.jpg'),
  require('../assets/images/Moto.jpg'),
];

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Carrossel */}
      <FirstCarrousel images={carouselImages} />

      {/* Área sobreposta */}
      <View style={styles.overlayContent}>
        <View style={{ height: 16 }} />
      </View>

      {/* Botões na parte inferior */}
      <View style={styles.bottomButtons}>
        <FirstButton
          title="Login"
          onPress={() => router.push('/Login')}
          customStyle={styles.loginButton}
          customTextStyle={styles.loginButtonText}
        />

        <FirstButton
          title="Cadastro"
          onPress={() => router.push('/Cadastro')}
          customStyle={styles.signupButton}
          customTextStyle={styles.signupButtonText}
        />
      </View>
    </View>
  );
}
