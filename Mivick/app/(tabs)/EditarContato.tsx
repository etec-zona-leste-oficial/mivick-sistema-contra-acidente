import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { HeaderComLogin } from '@/components/HeaderComLogin';
import { FirstTitle } from '@/components/FirstTitle';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstButton } from '@/components/FirstButton';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';

import { styles } from '../../components/styles/styleEditarContato';;

const { width, height } = Dimensions.get('window');

const BASE_URL = 'http://192.168.15.66:3000';
const API_URL = `${BASE_URL}/app/mivick/contact`;

export default function EditarContato() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); 

    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [fotoUri, setFotoUri] = useState<string | null>(null);

    useEffect(() => {
        const loadContactData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                const response = await fetch(`${API_URL}/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    Alert.alert("Erro", "Não foi possível carregar o contato");
                    return;
                }

                const fullName = data.contact.nome.split(" ");
                const firstName = fullName[0];
                const lastName = fullName.slice(1).join(" ");

                setNome(firstName);
                setSobrenome(lastName);
                setTelefone(data.contact.telefone);
                setEmail(data.contact.email);
                setFotoUri(data.contact.foto ? `${BASE_URL}${data.contact.foto}` : null);

            } catch (err) {
                console.error(err);
                Alert.alert("Erro", "Falha ao carregar o contato");
            }
        };

        loadContactData();
    }, [id]);

    const safeParseResponse = async (response: Response) => {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return response.json();
        }
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
            formData.append('nome', `${nome} ${sobrenome}`);
            formData.append('telefone', telefone);
            formData.append('email', email);

            // Atualiza foto se o usuário trocar
            if (fotoUri && fotoUri.startsWith("file")) {
                // @ts-ignore - React Native File
                formData.append("foto", {
                    uri: fotoUri,
                    type: 'image/jpeg',
                    name: 'contato.jpg',
                });
            }

            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await safeParseResponse(response);

            if (response.ok) {
                Alert.alert("Sucesso", data.message || "Contato atualizado!");
                router.push('/Contatos');
            } else {
                Alert.alert("Erro", data.error || data.message || "Falha ao atualizar contato");
            }

        } catch (error) {
            console.error("Erro geral:", error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
        }
    };

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

                <FirstTextField
                    placeholder="Nome"
                    style={{ marginBottom: 12 }}
                    value={nome}
                    onChangeText={setNome}
                />

                <FirstTextField
                    placeholder="Sobrenome"
                    style={{ marginBottom: 12 }}
                    value={sobrenome}
                    onChangeText={setSobrenome}
                />

                <FirstTextField
                    placeholder="Telefone"
                    style={{ marginBottom: 12 }}
                    value={telefone}
                    onChangeText={setTelefone}
                    maskTelefone={true}
                />

                <FirstTextField
                    placeholder="Email"
                    style={{ marginBottom: 12 }}
                    value={email}
                    onChangeText={setEmail}
                />

                <FirstButton
                    title="Salvar Alterações"
                    onPress={handleAtualizarContato}
                    customStyle={{
                        marginTop: height * 0.12,
                        height: height * 0.070,
                        width: width * 0.9,
                        alignSelf: 'center',
                    }}
                />
            </ScrollView>
        </View>
    );
}
