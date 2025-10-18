// Imports
import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

// -------------------------

// Componentes
import { Header } from '@/components/Header';
import { FirstTitle } from '@/components/FirstTitle';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstButton } from '@/components/FirstButton';
import { styles } from '../components/styles/styleLogin';


// -------------------------

// Variável  dimensionais
const { width, height } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Header/>

       
      <View style={styles.content}>
        <FirstTitle text="Login"  />

        <FirstTextField 
          placeholder="Nome" 
          style={[styles.textField, { marginTop: height * 0.03 }]} 
        />
        <FirstTextField 
          placeholder="Senha" 
          secureTextEntry 
          style={[styles.textField, { marginTop: height * 0.0 }]} 
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha</Text>
        </TouchableOpacity>

        <FirstButton
          title="Login"
          onPress={() => router.push('/home1')}
          customStyle={styles.loginButton}
        />

        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '100%',
            alignSelf: 'center',
            marginVertical: height * 0.02,
          }}
        />

        <TouchableOpacity style={styles.googleButton}>
          <FontAwesome name="google" size={24} color="#fff" />
          <Text style={styles.googleButtonText}> Login com Google</Text>
        </TouchableOpacity>

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
