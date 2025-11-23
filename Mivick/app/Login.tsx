// =============================================================
// Imports de bibliotecas e dependências externas
// =============================================================
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { GoogleSignin, User, isSuccessResponse } from "@react-native-google-signin/google-signin";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from "react-native-toast-message";

// =============================================================
// Importação de componentes customizados
// =============================================================
import { FirstButton } from '@/components/FirstButton';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstTitle } from '@/components/FirstTitle';
import { Header } from '@/components/Header';
import { styles } from '../components/styles/styleLogin';
import { BackButton } from '@/components/BackButton/BackButton';
import { FirstModalTerms } from '@/components/FirstModalTerms/FirstModal';

const { height } = Dimensions.get("window");


// =============================================================
// Configuração Google Sign-In
// Obrigatório para permitir login via Google
// =============================================================
GoogleSignin.configure({
  iosClientId: "361690709955-92l95olnj2mbh7mo2d3ube4sbk9eran8.apps.googleusercontent.com",
  webClientId: "361690709955-sqe5mbar1mq4bp5vu9e1b2b9m07jkqnj.apps.googleusercontent.com",
});

export default function Login() {
  const router = useRouter();

  // Modal de Termos de Uso
  const [modalVisible, setModalVisible] = useState(false);


  // Estado para checkbox dos termos de uso
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Estado com dados do usuário do Google (quando aplicável)
  const [auth, setAuth] = useState<User | null>(null);

  // URL base da API
  const API_URL = "http://192.168.15.66:3000";

  // Estados controlando os inputs do formulário
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // =============================================================
  // Login padrão utilizando email e senha
  // =============================================================
  async function handleLogin() {
    // Validação básica dos campos obrigatórios
    if (!email || !senha) {
      Toast.show({
        type: 'error',
        text1: 'Por favor, preencha todos os campos!'
      })

      return;
    }

    // Termos de uso obrigatórios
    if (!agreeToTerms) {
      Toast.show({
        type: 'error',
        text1: 'Você precisa concordar com os termos de uso!'
      })

      return;
    }
    try {
      // Requisição ao backend para autenticação
      const response = await fetch(`${API_URL}/app/mivick/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      // Tratamento de erro de autenticação
      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "Erro ao fazer login",
          text2: data.error || "Falha ao fazer login",
        });
        return;
      }


      // Armazenando token JWT localmente
      await AsyncStorage.setItem("token", data.token);

      // Redirecionamento após login bem-sucedido
      router.push("./Home");
      Toast.show({
        type: "success",
        text1: "Login realizado com sucesso!"
      })

    } catch (error) {
      console.error("Erro ao logar:", error);

      Toast.show({
        type: "error",
        text1: "Erro de conexão",
        text2: "Falha de conexão com o servidor",
      });
    }

  }

  // =============================================================
  // Login via Google
  // Autenticação externa + backend
  // =============================================================
  async function handleGoogleSignIn() {
    try {
      // Verifica se o dispositivo tem os serviços necessários
      await GoogleSignin.hasPlayServices();

      // Inicia processo de login Google
      const response = await GoogleSignin.signIn();

      // Se não for sucesso (cancelado ou falhou)
      if (!isSuccessResponse(response)) {
        console.warn("Login cancelado ou falhou.");
        return;
      }

      // Obtém tokens do Google
      const tokens = await GoogleSignin.getTokens();

      if (!tokens.idToken) {
        Alert.alert("Erro", "Não foi possível obter o ID Token.");
        return;
      }

      // Envia o ID Token ao backend para validação e criação/autenticação do usuário
      const backendResponse = await fetch(`${API_URL}/app/mivick/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokens.idToken }),
      });

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        Alert.alert("Erro", data.message || "Falha ao autenticar com o backend.");
        return;
      }

      // Salva token JWT retornado pelo backend
      await AsyncStorage.setItem("token", data.token);

      // Redireciona para Home
      router.push("./Home");

    } catch (error) {
      console.error("Erro no login com Google:", error);
      Alert.alert("Erro", "Erro ao conectar com o Google.");
    }
  }

  // =============================================================
  // Interface da tela de login
  // =============================================================
  return (
    <SafeAreaView style={styles.container}>

      {/* Cabeçalho da aplicação */}
      <Header />
      <BackButton />

      <View style={styles.content}>


        {/* Título da tela */}
        <FirstTitle text="Fazer Login" fontSize={35} />

        {/* Campo de email */}
        <FirstTextField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.textField, { marginTop: height * 0.06 }]}
        />

        {/* Campo de senha */}
        <FirstTextField
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          style={[styles.textField]}
        />

        {/* Botão de login padrão */}
        <FirstButton
          title="Login"
          onPress={handleLogin}
          customStyle={styles.loginButton}
        />

        {/* Divisor visual */}
        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '100%',
            marginVertical: height * 0.02,
          }}
        />

        {/* Botão de login com Google */}
        <FirstButton
          title="Faça Login com o Google"
          onPress={handleGoogleSignIn}
          customStyle={styles.googleButton}
          customTextStyle={styles.googleButtonText}
          icon={<FontAwesome name="google" size={24} color="#fff" />}
        />

        {/* Área do checkbox dos termos */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            {agreeToTerms && (
              <FontAwesome name="check" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.checkboxText}>
              Ao clicar, você concorda com os{" "}
              <Text style={styles.termsText}>termos de uso</Text> do aplicativo.
            </Text>
          </TouchableOpacity>
        </View>


        {/*Modal de Termos de Uso */}
        <FirstModalTerms
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        >
          {`
            Bem-vindo ao Mivick! Ao utilizar nosso aplicativo, você concorda com os seguintes termos de uso:

            Utilização de informações pessoais para fins de pesquisa e funcionalidades do app.   

            Envio de mensagens a contatos salvos no seu dispositivo.

            Armazenamento local de dados para melhorar a experiência do usuário.

            Não nos responsabilizamos por qualquer dano ou perda de dados causados por mau uso do aplicativo.

            Reservamo-nos o direito de modificar estes termos a qualquer momento.
            Recomendamos que você os revise periodicamente.
          `}
        </FirstModalTerms>



      </View>
    </SafeAreaView>
  );
}
