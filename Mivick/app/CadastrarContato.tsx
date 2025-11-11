import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            setNome('');
            setSobrenome('');
            setTelefone('');
            setEmail('');
            setValue(null);
            setOpen(false);
        }, [])
    );

    // Função de cadastrar
    const handleCadastrarContato = async () => {
        try {
            if (!nome || !telefone || !email) {
                Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
                return;
            }

            const token = 'SEU_TOKEN_JWT_AQUI'; 

            const response = await fetch('http://192.168.15.66:3000/app/mivick/contact', {
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

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Sucesso', data.message || 'Contato cadastrado!');
                setNome('');
                setSobrenome('');
                setTelefone('');
                setEmail('');
            } else {
                Alert.alert('Erro', data.message || 'Falha ao cadastrar contato.');
            }
        } catch (error) {
            console.error(error);
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

                <View style={{
                    height: 2,
                    backgroundColor: '#F85200',
                    width: '106%',
                    alignSelf: 'center',
                    marginVertical: 12,
                }} />

                <PerfilFoto
                    style={{ alignSelf: 'center', marginBottom: 22, paddingHorizontal: 12, marginTop: 8 }}
                    showEditIcon={true}
                    onEditPress={() => console.log('Editar foto')}
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
