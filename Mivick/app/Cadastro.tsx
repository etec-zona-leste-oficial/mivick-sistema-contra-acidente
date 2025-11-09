import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

// Componentes
import { FirstButton } from '@/components/FirstButton';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstTitle } from '@/components/FirstTitle';
import { Header } from '@/components/Header';

import { styles } from '../components/styles/styleCadastro';

export default function Cadastro() {
  const router = useRouter();
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.content}>
        <FirstTitle text="Cadastro" fontSize={35} />

        <FirstTextField placeholder="Nome" style={styles.textField} />
        <FirstTextField placeholder="Telefone" style={styles.textField} />
        <FirstTextField placeholder="Email" style={styles.textField} />
        <FirstTextField placeholder="Senha" style={styles.textField} secureTextEntry />
        <FirstTextField placeholder="Confirmar senha" style={styles.textField} secureTextEntry />

        <FirstButton
          title="Cadastre-se"
          customStyle={styles.signupButton}
          onPress={() => console.log("Cadastro com dados")}
        />

        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '100%',
            alignSelf: 'center',
            marginVertical: 12,
          }}
        />

        <FirstButton

          title="Faça Login com o Google"
          customStyle={styles.googleButton}
          customTextStyle={styles.googleButtonText}
          icon={<FontAwesome name="google" size={24} color="#fff" />}
        />

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            {agreeToTerms && (
              <FontAwesome name="check" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <Text style={styles.checkboxText}>
            Ao clicar, você concorda com os{' '}
            <Text style={styles.termsText}>termos de uso</Text> do aplicativo.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
