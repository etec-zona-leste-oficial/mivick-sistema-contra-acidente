import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HeaderComLogin } from '../components/HeaderComLogin';
import { FirstTitle } from '@/components/FirstTitle';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstButton } from '@/components/FirstButton';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';

import { styles } from '../components/styles/styleCadastrarContato';

const { width, height } = Dimensions.get('window');

export default function CadastrarContato() {
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');

    // Resetar campos quando abrir a tela novamente
    useFocusEffect(
        useCallback(() => {
            setNome('');
            setSobrenome('');
            setTelefone('');
            setEmail('');
        }, [])
    );

    // Função de cadastro
    const handleCadastrarContato = async () => {
        try {
            if (!nome || !telefone || !email) {
                Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
                return;
            }

            const token = await AsyncStorage.getItem("token");

            if (!token) {
                Alert.alert("Erro", "Usuário não autenticado.");
                return;
            }

            const response = await fetch('http://192.168.1.7:3000/app/mivick/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nome: `${nome} ${sobrenome}`,
                    telefone,
                    email,
                }),
            });

            let data: any = {};
            try {
                data = await response.json();
            } catch (error) {
                console.log("Erro ao converter JSON:", error);
            }

            if (response.ok) {
                Alert.alert('Sucesso', data.message || 'Contato cadastrado!');
                setNome('');
                setSobrenome('');
                setTelefone('');
                setEmail('');
            } else {
                Alert.alert('Erro', data.error || "Falha ao cadastrar contato.");
            }
        } catch (error) {
            console.error("Erro geral:", error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <HeaderComLogin />
            <ScrollView style={styles.container}>
                <FirstTitle
                    text="Cadastre um contato"
                    style={{ fontSize: 35, marginBottom: 10, marginTop: 15, paddingHorizontal: 12 }}
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

                {/* Foto ainda não implementada no backend */}
                <PerfilFoto
                    style={{ alignSelf: 'center', marginBottom: 22, paddingHorizontal: 12, marginTop: 8 }}
                    showEditIcon={true}
                    onEditPress={() => Alert.alert("Em breve", "Upload de foto ainda não está ativo.")}
                />

                <FirstTextField placeholder="Nome" style={{ marginBottom: 12 }} value={nome} onChangeText={setNome} />
                <FirstTextField placeholder="Sobrenome" style={{ marginBottom: 12 }} value={sobrenome} onChangeText={setSobrenome} />
                <FirstTextField placeholder="Telefone" style={{ marginBottom: 12 }} value={telefone} onChangeText={setTelefone} maskTelefone={true} />
                <FirstTextField placeholder="Email" style={{ marginBottom: 12 }} value={email} onChangeText={setEmail} />

                <FirstButton
                    title="Cadastrar"
                    onPress={handleCadastrarContato}
                    customStyle={{
                        marginTop: height * 0.12,
                        height: height * 0.065,
                        width: width * 0.9,
                        alignSelf: 'center',
                    }}
                />
            </ScrollView>
        </View>
    );
}
