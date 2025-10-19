import React, { useState } from 'react';

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { HeaderComLogin } from '../components/HeaderComLogin'; // 🔥 import do header
import { FirstTitle } from '@/components/FirstTitle';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstButton } from '@/components/FirstButton';
import { styles } from '../components/styles/styleCadastrarContato';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';

export default function CadastrarContato() {

    const prioridades = ['Baixa', 'Média', 'Alta'];
    const [selectedPrioridade, setSelectedPrioridade] = useState<string | null>(null)

    return (
        <View style={{ flex: 1 }}>
            <HeaderComLogin />
            <ScrollView style={styles.container}>

                <FirstTitle text="Cadastre um contato" style={{ fontSize: 35, marginBottom: 10, marginTop: 15, paddingHorizontal: 12 }} />
                <View
                    style={{
                        height: 1,
                        backgroundColor: '#F85200',
                        width: '100%',
                        alignSelf: 'center',
                        marginVertical: 12,
                    }}
                />

                <PerfilFoto style={{ alignSelf: 'center', marginBottom: 22, paddingHorizontal: 12, marginTop: 8 }} />

                <FirstTextField placeholder="Nome" style={{ marginBottom: 12 }} />
                <FirstTextField placeholder="Telefone" style={{ marginBottom: 12 }} />
                <FirstTextField placeholder="Email" style={{ marginBottom: 12 }} />
                <FirstTextField
                    placeholder="Prioridade do contato"
                    value={selectedPrioridade || ''}
                    onChangeText={setSelectedPrioridade}
                    style={{ marginBottom: 12 }}
                />




                <FirstButton title="Cadastrar" customStyle={{ marginTop: '70%' }} />

            </ScrollView>
        </View>
    )
}