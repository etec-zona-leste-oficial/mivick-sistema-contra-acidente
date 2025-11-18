import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { HeaderComLogin } from '@/components/HeaderComLogin';
import { FirstTitle } from '@/components/FirstTitle';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstButton } from '@/components/FirstButton';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';

import { styles } from '../components/styles/styleEditarContato';

const { width, height } = Dimensions.get('window');

const BASE_URL = 'http://192.168.15.66:3000';
const API_URL = `${BASE_URL}/app/mivick/contact`;

export default function EditarContato() {
  const router = useRouter();
  const { id_contato } = useLocalSearchParams();
  console.log("ID recebido ->", id_contato);

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  // controla se o contato já foi carregado (garante montagem com valores)
  const [contactLoaded, setContactLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // não tenta buscar enquanto id_contato não existir
    if (!id_contato) return;

    const loadContactData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(`${API_URL}/${id_contato}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const raw = await response.text();
          console.log("⚠️ RESPOSTA RAW:", raw);
          Alert.alert("Erro", "Resposta inválida do servidor.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("📌 Dados recebidos da API:", JSON.stringify(data, null, 2));

        const contato = data.contact;
        if (!contato) {
          Alert.alert("Erro", "Contato não encontrado.");
          setLoading(false);
          return;
        }

        // Dividir nome em primeiro + sobrenome (seguro)
        const partes = (contato.nome || "").trim().split(/\s+/);
        const primeiroNome = partes[0] || "";
        const sobrenomeJunto = partes.length > 1 ? partes.slice(1).join(" ") : "";

        // seta estados antes de marcar contactLoaded
        setNome(primeiroNome);
        setSobrenome(sobrenomeJunto);
        setTelefone(contato.telefone || "");
        setEmail(contato.email || "");
        setFotoUri(contato.foto ? `${BASE_URL}${contato.foto}` : null);

        // Indica que tudo está pronto — isso faz com que os campos sejam montados com valores
        setContactLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar contato:", error);
        Alert.alert("Erro", "Falha ao carregar os dados do contato.");
      } finally {
        setLoading(false);
      }
    };

    loadContactData();
  }, [id_contato]);

  const safeParseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    const text = await response.text();
    return { __raw: text };
  };

  const handleAtualizarContato = async () => {
    try {
      if (!nome || !telefone || !email) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
        return;
      }

      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append('nome', `${nome} ${sobrenome}`.trim());
      formData.append('telefone', telefone);
      formData.append('email', email);

      if (fotoUri && fotoUri.startsWith("file")) {
        // @ts-ignore
        formData.append("foto", {
          uri: fotoUri,
          type: 'image/jpeg',
          name: 'contato.jpg',
        });
      }

      const response = await fetch(`${API_URL}/${id_contato}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await safeParseResponse(response);

      if (response.ok) {
        Alert.alert("Sucesso", data.message || "Contato atualizado!");
        router.push("/Contatos");
      } else {
        Alert.alert("Erro", data.error || "Falha ao atualizar contato");
      }

    } catch (error) {
      console.error("Erro geral:", error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  // mostra loading enquanto busca por dados
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#F85200" />
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 10 }}>Carregando contato...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <HeaderComLogin />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <FirstTitle
          text="Editar Contato"
          style={{
            fontSize: 35,
            marginBottom: 10,
            marginTop: 15,
            paddingHorizontal: 12,
          }}
        />

        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '106%',
            alignSelf: 'center',
            marginVertical: 12,
          }}
        />

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

        {/* Só monta os campos depois que contactLoaded for true */}
        {!contactLoaded ? null : (
          <>
            <FirstTextField
              placeholder="Nome"
              style={{ marginBottom: 12 }}
              value={nome}
              onChangeText={setNome}
              key={`nome-${nome}`} // força remount se precisar
            />

            <FirstTextField
              placeholder="Sobrenome"
              style={{ marginBottom: 12 }}
              value={sobrenome}
              onChangeText={setSobrenome}
              key={`sob-${sobrenome}`}
            />

            <FirstTextField
              placeholder="Telefone"
              style={{ marginBottom: 12 }}
              value={telefone}
              onChangeText={setTelefone}
              maskTelefone={true}
              key={`tel-${telefone}`}
            />

            <FirstTextField
              placeholder="Email"
              style={{ marginBottom: 12 }}
              value={email}
              onChangeText={setEmail}
              key={`email-${email}`}
            />

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
