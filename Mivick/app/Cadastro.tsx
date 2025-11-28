// Ícones do Expo
import { FontAwesome } from '@expo/vector-icons';

// Navegação do Expo Router
import { useRouter } from 'expo-router';

// React
import React, { useState } from 'react';

// Componentes nativos do React Native
import { SafeAreaView, Text, TouchableOpacity, View, Alert } from 'react-native';

// Login Google
import { GoogleSignin, User, isSuccessResponse } from "@react-native-google-signin/google-signin";

// Armazenamento local
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componentes personalizados do projeto
import { FirstButton } from '@/components/FirstButton';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstTitle } from '@/components/FirstTitle';
import { Header } from '@/components/Header';
import Toast from "react-native-toast-message";
import { BackButton } from '@/components/BackButton/BackButton';
import { FirstModal } from '@/components/FirstModal';


// Stylesheet da página
import { styles } from '../components/styles/styleCadastro';
import { FirstModalTerms } from '@/components/FirstModalTerms/FirstModal';


// -----------------------------------------------------------
// Configuração do login Google
// -----------------------------------------------------------
GoogleSignin.configure({
  iosClientId: "361690709955-92l95olnj2mbh7mo2d3ube4sbk9eran8.apps.googleusercontent.com",
  webClientId: "361690709955-sqe5mbar1mq4bp5vu9e1b2b9m07jkqnj.apps.googleusercontent.com",
});


// -----------------------------------------------------------
// Componente principal: Cadastro
// -----------------------------------------------------------
export default function Cadastro() {

  // Hook para navegação
  const router = useRouter();

  // checkbox termos
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Controle de login Google
  const [auth, setAuth] = useState<User | null>(null);

  // URL do backend
  const API_URL = "http://10.135.37.162:3000"; // Backend

  // Campos do formulário
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Modal de Termos de Uso
  const [modalVisible, setModalVisible] = useState(false);


  // -----------------------------------------------------------
  // Função: Cadastro normal
  // -----------------------------------------------------------
  async function handleRegister() {

    // Validação simples
    if (!nome || !telefone || !email || !senha) {
      Toast.show({
        type: 'error',
        text1: 'Por favor, preencha todos os campos!'
      })
      return;
    }

    // Confirmação de senha
    if (senha !== confirmarSenha) {
      Toast.show({
        type: 'error',
        text1: 'As senhas não coincidem!'
      })
      return;
    }

    try {
      // POST para criar usuário
      const response = await fetch(`${API_URL}/app/mivick/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone, email, senha }),
      });

      // Resposta do servidor
      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Cadastro realizado com sucesso!'
        })
        router.push("./Login"); // Redireciona para Login
      } else {
        Toast.show({
          type: "error",
          text1: "Erro ao cadastrar",
          text2: data.error || "Falha ao cadastrar",
        });
      }

    } catch (error) {
      console.error("Erro ao cadastrar:", error);

      Toast.show({
        type: "error",
        text1: "Erro de conexão",
        text2: "Falha de conexão com o servidor",
      });
    }

  }


  // -----------------------------------------------------------
  // Função: Cadastro/Login com Google
  // -----------------------------------------------------------
  async function handleGoogleSignIn() {
    try {
      // Garante que serviços Google estão funcionando
      await GoogleSignin.hasPlayServices();

      // Abre popup de login Google
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {

        // Obtém ID Token
        const { idToken } = await GoogleSignin.getTokens();

        if (!idToken) {
          Alert.alert("Erro", "Não foi possível obter o ID Token do Google.");
          return;
        }

        // Envia para o backend validar e criar usuário
        const backendResponse = await fetch(`${API_URL}/app/mivick/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        });

        const data = await backendResponse.json();

        if (backendResponse.ok) {
          // Salva o token JWT
          await AsyncStorage.setItem("token", data.token);

          // Redireciona
          router.push("./Home");
        } else {
          Alert.alert("Erro", "Falha ao autenticar com o backend.");
        }
      } else {
        console.warn("Login cancelado ou falhou.");
      }

    } catch (error) {
      console.error("Erro no login com Google:", error);
    }
  }


  // -----------------------------------------------------------
  // UI da Tela de Cadastro
  // -----------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      {/* Header fixo do app */}
      <Header />



      <View style={styles.content}>

        {/* Título da página */}
        <FirstTitle text="Cadastre-se" fontSize={35} style={{ alignItems: 'center', alignSelf: 'center' }} />

        {/* Campos do formulário */}
        <FirstTextField placeholder="Nome" value={nome} onChangeText={setNome} style={styles.textField} />
        <FirstTextField placeholder="Telefone" value={telefone} onChangeText={setTelefone} maskTelefone={true} style={styles.textField} />
        <FirstTextField placeholder="Email" value={email} onChangeText={setEmail} style={styles.textField} />
        <FirstTextField placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry style={styles.textField} />
        <FirstTextField placeholder="Confirmar senha" value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry style={styles.textField} />

        {/* Botão principal */}
        <FirstButton
          title="Cadastre-se"
          onPress={handleRegister}
          customStyle={styles.signupButton}
        />

        {/* Linha separadora */}
        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '100%',
            alignSelf: 'center',
            marginVertical: 12,
          }}
        />

        {/* Google Login Button */}
        <FirstButton
          title="Faça Login com o Google"
          onPress={handleGoogleSignIn}
          customStyle={styles.googleButton}
          customTextStyle={styles.googleButtonText}
          icon={<FontAwesome name="google" size={24} color="#fff" />}
        />

        {/* Checkbox para termos de uso */}
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
            Ao clicar, você concorda com os{" "}
            <Text style={styles.termsText} onPress={() => setModalVisible(true)}>termos de uso</Text> do aplicativo.
          </Text>
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
