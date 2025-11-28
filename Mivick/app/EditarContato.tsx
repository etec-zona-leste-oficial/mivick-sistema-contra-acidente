import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from "react-native-toast-message";


// Componentes reutilizáveis
import { HeaderComLogin } from '@/components/HeaderComLogin';
import { FirstTitle } from '@/components/FirstTitle';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstButton } from '@/components/FirstButton';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';

// Estilos específicos da tela
import { styles } from '../components/styles/styleEditarContato';

const { width, height } = Dimensions.get('window');

const BASE_URL = 'http://10.98.97.162:3000';
const API_URL = `${BASE_URL}/app/mivick/contact`;

export default function EditarContato() {
  const router = useRouter();

  // ID do contato passado pela rota
  const { id_contato } = useLocalSearchParams();

  // Estados dos campos de edição
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  /**
   * STATES DE CONTROLE
   */
  const [contactLoaded, setContactLoaded] = useState(false); // controla montagem dos campos
  const [loading, setLoading] = useState(false); // loading geral da tela

  /**
   * 🔄 Carregar dados do contato ao abrir a tela
   */
  useEffect(() => {
    // não executa enquanto o id não existir
    if (!id_contato) return;

    const loadContactData = async () => {
      try {
        setLoading(true);

        const token = await AsyncStorage.getItem("token");

        // Faz a requisição para buscar o contato específico
        const response = await fetch(`${API_URL}/${id_contato}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Garante que a resposta seja JSON
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const raw = await response.text();
          setLoading(false);
          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Resposta inválida do servidor.",
          });
          return;
        }

        const data = await response.json();
        console.log("Dados recebidos da API:", JSON.stringify(data, null, 2));

        const contato = data.contact;
        if (!contato) {
          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Contato não encontrado.",
          });
          setLoading(false);
          return;
        }

        /**
         * Divide o nome em primeiro nome + sobrenome
         * — Evita quebra caso usuário tenha 1 ou 5 nomes
         */
        const partes = (contato.nome || "").trim().split(/\s+/);
        const primeiroNome = partes[0] || "";
        const sobrenomeJunto = partes.length > 1 ? partes.slice(1).join(" ") : "";

        // Seta estados dos campos
        setNome(primeiroNome);
        setSobrenome(sobrenomeJunto);
        setTelefone(contato.telefone || "");
        setEmail(contato.email || "");

        // Foto vinda da API
        setFotoUri(contato.foto ? `${BASE_URL}${contato.foto}` : null);

        // Permite renderizar os TextFields
        setContactLoaded(true);

      } catch (error) {
        console.error("Erro ao carregar contato:", error);

        Toast.show({
          type: "error",
          text1: "Erro ao carregar contato",
          text2: "Falha ao carregar os dados do contato.",
        });

      } finally {
        setLoading(false);
      }
    };

    loadContactData();
  }, [id_contato]);

  /**
   * Trata respostas não-JSON da API
   */
  const safeParseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    const text = await response.text();
    return { __raw: text };
  };

  /**
   * 📝 Atualizar dados do contato
   */
  const handleAtualizarContato = async () => {
    try {
      // validação simples antes do envio
      if (!nome || !telefone || !email) {
        Toast.show({
          type: "error",
          text1: "Preencha todos os campos obrigatórios.",
        });
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem("token");

      // Monta formData igual ao cadastro
      const formData = new FormData();
      formData.append('nome', `${nome} ${sobrenome}`.trim());
      formData.append('telefone', telefone);
      formData.append('email', email);

      // Envia foto nova se tiver sido alterada
      if (fotoUri && fotoUri.startsWith("file")) {
        // @ts-ignore — RN File
        formData.append("foto", {
          uri: fotoUri,
          type: 'image/jpeg',
          name: 'contato.jpg',
        });
      }

      // Faz requisição PUT para atualizar
      const response = await fetch(`${API_URL}/${id_contato}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await safeParseResponse(response);

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Contato atualizado com sucesso!",
        });
        
        router.push("/Contatos");
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao atualizar o contato',
          text2: data.error || 'Falha ao atualizar o contato.',
          
        })
      }

    } catch (error) {
      Toast.show({
        type: "error",
        text1 : "Erro de conexão",
        text2 : "Não foi possível conectar ao servidor."
      })
    }
  };

  /**
   * Tela de loading enquanto os dados são carregados
   */
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#F85200" />
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 10 }}>
          Carregando contato...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <HeaderComLogin />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Título da página */}
        <FirstTitle
          text="Editar Contato"
          style={{
            fontSize: 35,
            marginBottom: 10,
            marginTop: 15,
            paddingHorizontal: 12,
          }}
        />

        {/* Linha laranja */}
        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '106%',
            alignSelf: 'center',
            marginVertical: 12,
          }}
        />

        {/* Foto do contato */}
        <PerfilFoto
          style={{
            alignSelf: 'center',
            marginBottom: 22,
            paddingHorizontal: 12,
            marginTop: 8,
          }}
          showEditIcon={true}
          onChangePhoto={(uri) => setFotoUri(uri)}
          imageUri={fotoUri || ""}
        />

        {/* Monta os campos SOMENTE após carregar dados do contato */}
        {!contactLoaded ? null : (
          <>
            {/* Nome */}
            <FirstTextField
              placeholder="Nome"
              style={{ marginBottom: 12 }}
              value={nome}
              onChangeText={setNome}
              key={`nome-${nome}`} // força atualização se necessário
            />

            {/* Sobrenome */}
            <FirstTextField
              placeholder="Sobrenome"
              style={{ marginBottom: 12 }}
              value={sobrenome}
              onChangeText={setSobrenome}
              key={`sob-${sobrenome}`}
            />

            {/* Telefone */}
            <FirstTextField
              placeholder="Telefone"
              style={{ marginBottom: 12 }}
              value={telefone}
              onChangeText={setTelefone}
              maskTelefone={true}
              key={`tel-${telefone}`}
            />

            {/* Email */}
            <FirstTextField
              placeholder="Email"
              style={{ marginBottom: 12 }}
              value={email}
              onChangeText={setEmail}
              key={`email-${email}`}
            />

            {/* Botão salvar */}
            <FirstButton
              title="Salvar Alterações"
              onPress={handleAtualizarContato}
              customStyle={{
                marginTop: height * 0.12,
                height: height * 0.077,
                width: width * 0.8,
                alignSelf: 'center',
              }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
