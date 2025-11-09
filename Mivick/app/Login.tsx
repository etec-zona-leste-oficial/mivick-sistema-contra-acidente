// Imports
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { GoogleSignin, User } from "@react-native-google-signin/google-signin"


// -------------------------

// Componentes
import { FirstButton } from '@/components/FirstButton';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstTitle } from '@/components/FirstTitle';
import { Header } from '@/components/Header';
import { styles } from '../components/styles/styleLogin';


// -------------------------

// Variáveis
const { width, height } = Dimensions.get("window");


// Implementando Google Sign In
GoogleSignin.configure({
  iosClientId: "361690709955-92l95olnj2mbh7mo2d3ube4sbk9eran8.apps.googleusercontent.com "
})

export default function Login() {
  const router = useRouter();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [auth, setAuth] = useState<User | null>(null)

  function handleGoogleSignIn() {
    try {

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />


      <View style={styles.content}>
        <FirstTitle text="Login" fontSize={35} />
        <FirstTextField
          placeholder="Nome"
          style={[styles.textField, { marginTop: height * 0.06 }]}
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
          onPress={() => router.push('./Home')}
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
