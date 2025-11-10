// Imports
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { GoogleSignin, User, isSuccessResponse } from "@react-native-google-signin/google-signin";
import AsyncStorage from '@react-native-async-storage/async-storage';


// -------------------------
// Componentes
import { FirstButton } from '@/components/FirstButton';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstTitle } from '@/components/FirstTitle';
import { Header } from '@/components/Header';
import { styles } from '../components/styles/styleLogin';
// -------------------------

const { height } = Dimensions.get("window");

// Configuração do Google Sign-In
GoogleSignin.configure({
  iosClientId: "361690709955-92l95olnj2mbh7mo2d3ube4sbk9eran8.apps.googleusercontent.com",
  webClientId: "361690709955-sqe5mbar1mq4bp5vu9e1b2b9m07jkqnj.apps.googleusercontent.com",
});

export default function Login() {
  const router = useRouter();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [auth, setAuth] = useState<User | null>(null);
  const API_URL = "http://192.168.15.66:3000" //Backend
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  //Login Usuário
  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/app/mivick/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        console.log("Usuário logado:", data.user);
        router.push("./Home");
      } else {
        Alert.alert("Erro", data.error || "Falha ao fazer login");
      }
    } catch (error) {
      console.error("Erro ao logar:", error);
      Alert.alert("Erro", "Falha de conexão com o servidor");
    }
  }

  //Login com Google
  async function handleGoogleSignIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {

        const { idToken } = await GoogleSignin.getTokens();

        if (!idToken) {
          Alert.alert("Erro", "Não foi possível obter o ID Token do Google.");
          return;
        }

        // Envia o token para o backend
        const backendResponse = await fetch(`${API_URL}/app/mivick/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        });

        const data = await backendResponse.json();

        if (backendResponse.ok) {
          console.log("✅ Token do backend:", data.token);
          console.log("Google ID Token:", idToken);
          await AsyncStorage.setItem("token", data.token);
          router.push("./Home");
        } else {
          console.warn("Erro do backend:", data.message);
          Alert.alert("Erro", "Falha ao autenticar com o backend.");
        }
      } else {
        console.warn("Login cancelado ou falhou.");
      }
    } catch (error) {
      console.error("Erro no login com Google:", error);
    }
  }



  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <FirstTitle text="Login" fontSize={35} />

        <FirstTextField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[styles.textField, { marginTop: height * 0.06 }]}
        />
        <FirstTextField
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          style={[styles.textField, { marginTop: height * 0.0 }]}
        />

        <FirstButton
          title="Login"
          onPress={handleLogin}
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
          onPress={handleGoogleSignIn}
          customStyle={styles.googleButton}
          customTextStyle={styles.googleButtonText}
          icon={<FontAwesome name="google" size={24} color="#fff" />}
        />

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            {agreeToTerms && <FontAwesome name="check" size={16} color="#FFFFFF" />}
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
