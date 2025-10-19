import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { HeaderComLogin } from '../components/HeaderComLogin';
import { FirstTitle } from '@/components/FirstTitle';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstButton } from '@/components/FirstButton';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';
import DropDownPicker from 'react-native-dropdown-picker';
import { styles } from '../components/styles/styleCadastrarContato';
import { FontAwesome } from '@expo/vector-icons';

export default function CadastrarContato() {
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [items, setItems] = useState([
        { label: 'Baixo', value: 'baixo' },
        { label: 'Médio', value: 'medio' },
        { label: 'Alto', value: 'alto' },
    ]);


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

                <PerfilFoto
                    style={{ alignSelf: 'center', marginBottom: 22, paddingHorizontal: 12, marginTop: 8 }}
                    showEditIcon={true}
                    onEditPress={() => console.log('Editar foto')}
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

                <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Prioridade de contato"
                    placeholderStyle={{ color: '#A0AEC0' }}
                    listMode="SCROLLVIEW"
                    style={styles.dropdown}
                />

                <FirstButton title="Cadastrar" customStyle={{ marginTop: 110, height: 50 }} />
            </ScrollView>
        </View>
    );
}
