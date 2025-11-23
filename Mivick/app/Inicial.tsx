import React from 'react';
import { View } from 'react-native';
import { FirstButton } from '@/components/FirstButton';
import { FirstCarrousel } from '@/components/FirstCarrousel';
import { useRouter } from 'expo-router';
import { styles } from '../components/styles/styleHome';
import { Redirect } from "expo-router";

const carouselImages = [
  require('../assets/images/ciclimoto.jpg'),
  require('../assets/images/Rodovia.jpg'),
  require('../assets/images/Moto.jpg')
];

export default function Inicial() {
  const router = useRouter();
   // return <Redirect href="/SplashScreen" />;

  return (
    <View style={styles.container}>
      {/* Carrossel */}
      <FirstCarrousel images={carouselImages} />

      {/* Conteúdo */}
      <View style={styles.overlayContent}></View>

      {/* Botões */}
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
