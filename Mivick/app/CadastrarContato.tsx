import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componentes personalizados do projeto
import { HeaderComLogin } from '../components/HeaderComLogin';
import { FirstTitle } from '@/components/FirstTitle';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstButton } from '@/components/FirstButton';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';
import { useRouter } from 'expo-router';

// Estilos da tela
import { styles } from '../components/styles/styleCadastrarContato';

const { width, height } = Dimensions.get('window');

// URL base da API
const BASE_URL = 'http://192.168.15.66:3000';
const API_URL = `${BASE_URL}/app/mivick/contact`;

export default function CadastrarContato() {
    const router = useRouter();

    // Estados dos campos
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [fotoUri, setFotoUri] = useState<string | null>(null);

    // Função que tenta interpretar a resposta da API como JSON
    // Caso a API não devolva JSON, evita crash e mostra texto bruto.
    const safeParseResponse = async (response: Response) => {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return response.json();
        }
        const text = await response.text();
        return { __raw: text };
    };

    /**
     * Reseta todos os campos ao SAIR da tela.
     * useFocusEffect → executado quando a tela ganha foco ou perde foco.
     */
    useFocusEffect(
        useCallback(() => {
            // Retorna função de limpeza, executada quando sai da página
            return () => {
                setNome('');
                setSobrenome('');
                setTelefone('');
                setEmail('');
                setFotoUri(null);
            };
        }, [])
    );

    /**
     * Função que envia os dados do formulário para a API
     * Valida campos, monta FormData, envia requisição POST.
     */
    const handleCadastrarContato = async () => {
        try {
            // Validação simples
            if (!nome || !telefone || !email) {
                Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
                return;
            }

            // Obtém token salvo (login)
            const token = await AsyncStorage.getItem("token");

            if (!token) {
                Alert.alert("Erro", "Usuário não autenticado.");
                return;
            }

            // Monta FormData para envio multipart/form-data
            const formData = new FormData();
            formData.append('nome', `${nome} ${sobrenome}`);
            formData.append('telefone', telefone);
            formData.append('email', email);

            // Se tiver foto selecionada, adiciona no formData
            if (fotoUri && fotoUri.startsWith("file")) {
                // @ts-ignore — RN File object
                formData.append("foto", {
                    uri: fotoUri,
                    type: "image/jpeg",
                    name: "contato.jpg",
                });
            }

            // Faz requisição à API
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // Token JWT
                },
                body: formData,
            });

            const data = await safeParseResponse(response);

            // Verifica se foi sucesso
            if (response.ok) {
                Alert.alert("Sucesso", data.message || "Contato cadastrado!");

                // Limpa campos depois do cadastro
                setNome('');
                setSobrenome('');
                setTelefone('');
                setEmail('');
                setFotoUri(null);

                // Redireciona para lista de contatos
                router.push('./Contatos');
            } else {
                Alert.alert("Erro", data.error || data.message || "Falha ao cadastrar contato");
                console.error("Erro:", data);
            }

        } catch (error) {
            console.error("Erro geral:", error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Header fixo com usuário logado */}
            <HeaderComLogin />

            {/* Scroll da página */}
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                {/* Título da página */}
                <FirstTitle
                    text="Cadastre um contato"
                    style={{ fontSize: 35, marginBottom: 10, marginTop: 15, paddingHorizontal: 12 }}
                />

                {/* Linha decorativa laranja */}
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
                    showEditIcon={true}          // Mostra o botão para escolher foto
                    onChangePhoto={(uri) => setFotoUri(uri)} // Atualiza estado da foto
                    imageUri={fotoUri || ""}     // Mostra a foto escolhida
                />

                {/* Campo Nome */}
                <FirstTextField
                    placeholder="Nome"
                    style={{ marginBottom: 12 }}
                    value={nome}
                    onChangeText={setNome}
                />

                {/* Campo Sobrenome */}
                <FirstTextField
                    placeholder="Sobrenome"
                    style={{ marginBottom: 12 }}
                    value={sobrenome}
                    onChangeText={setSobrenome}
                />

                {/* Campo Telefone (com máscara) */}
                <FirstTextField
                    placeholder="Telefone"
                    style={{ marginBottom: 12 }}
                    value={telefone}
                    onChangeText={setTelefone}
                    maskTelefone={true}
                />

                {/* Campo Email */}
                <FirstTextField
                    placeholder="Email"
                    style={{ marginBottom: 12 }}
                    value={email}
                    onChangeText={setEmail}
                />

                {/* Botão cadastrar */}
                <FirstButton
                    title="Cadastrar"
                    onPress={handleCadastrarContato}
                    customStyle={{
                        marginTop: height * 0.12,
                        height: height * 0.075,
                        width: width * 0.9,
                        alignSelf: 'center',
                    }}
                />
            </ScrollView>
        </View>
    );
}
