import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

// Componentes ajustados
import { FirstButton } from '@/components/FirstButton';
import { FirstCarrousel } from '@/components/FirstCarrousel';
import { styles } from '../components/styles/styleHome';
import  FontProvider  from '../components/providers/FontProvider';

// Imagens do carrossel
const carouselImages = [
  require('../assets/images/primeira-bike1.jpg'),
  require('../assets/images/segundo.webp'),
  require('../assets/images/terceira.jpg')
];

export default function Home() {
  const router = useRouter();

  return (
    <FontProvider>
      <View style={styles.container}>
        {/* Carrossel de fundo */}
        <FirstCarrousel images={carouselImages} />

        {/* Conteúdo sobreposto */}
        <View style={styles.overlayContent}>
          {/* Nome do App */}
          <View style={styles.appNameContainer}>
            <Text style={[styles.appNameText, { fontFamily: 'SansBoldPro' }]}>
              Mivick
            </Text>
          </View>

          <View style={{ height: 16 }} /> {/* Espaço extra */}
        </View>

        {/* Botões Login e Cadastro na parte inferior */}
        <View style={styles.bottomButtons}>
          <FirstButton
            title="Login"
            onPress={() => router.push('/login')}
            customStyle={styles.loginButton}
            customTextStyle={[styles.loginButtonText, { fontFamily: 'SansBoldPro' }]}
          />
          <FirstButton
            title="Cadastro"
            onPress={() => router.push('/cadastro')}
            customStyle={styles.signupButton}
            customTextStyle={[styles.signupButtonText, { fontFamily: 'SansBoldPro' }]}
          />
        </View>
      </View>
    </FontProvider>
  );
}
