import React from 'react';
import { View, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { FirstTextField } from '@/components/FirstTextField/FirstTextField';
import { FirstSubTitle } from '@/components/FirstSubTitle';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';
import { styles } from '@/components/styles/stylePerfil';
import FontProvider from '@/components/providers/FontProvider'; 

export default function Perfil() {
    const campos: { label: string; icon: keyof typeof FontAwesome.glyphMap }[] = [
        { label: 'Nome', icon: 'user' },
        { label: 'Telefone', icon: 'phone' },
        { label: 'Email', icon: 'envelope' },
    ];

    return (
        <FontProvider>
            <ScrollView contentContainerStyle={styles.container}>
                {/* FOTO DE PERFIL */}
                <View
                    style={{
                        alignSelf: 'center',
                        marginTop: 70,
                        marginBottom: 13,
                        borderRadius: 80,
                        borderWidth: 3,
                        borderColor: '#F85200',
                        padding: 3,
                    }}
                >
                    <PerfilFoto style={{ width: 100, height: 100 }} showEditIcon={true} />
                </View>

                {/* TEXTO "EDITAR" */}
                <FirstSubTitle
                    text="Editar"
                    style={{
                        fontSize: 20,
                        color: '#F85200',
                        marginBottom: 22,
                        alignSelf: 'center',
                    }}
                />

                {/* LINHA DE SEPARAÇÃO */}
                <View
                    style={{
                        height: 2,
                        backgroundColor: '#F85200',
                        width: '106%',
                        alignSelf: 'center',
                        marginVertical: 12,
                        marginBottom: 50,
                    }}
                />

                {/* CAMPOS */}
                {campos.map((campo, index) => (
                    <View
                        key={index}
                        style={{
                            width: '90%',
                            alignSelf: 'center',
                            marginBottom: 40,
                        }}
                    >
                        {/* RÓTULO (título acima do campo) */}
                        <View
                            style={{
                                position: 'absolute',
                                top: -10,
                                left: 45,
                                backgroundColor: '#000',
                                paddingHorizontal: 5,
                                zIndex: 1,
                            }}
                        >
                            <FirstSubTitle
                                text={campo.label}
                                style={{
                                    fontSize: 14,
                                    color: '#fff', // texto branco
                                }}
                            />
                        </View>

                        {/* CAMPO DE TEXTO */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesome
                                name={campo.icon}
                                size={24}
                                color="#F85200"
                                style={{ marginRight: 13 }}
                            />
                            <FirstTextField
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    borderColor: '#F85200',
                                    borderWidth: 2,
                                    color: '#fff',
                                    height: 45,
                                    paddingHorizontal: 10,
                                    paddingVertical: 8,
                                }}
                                placeholderTextColor="#ccc"
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>
        </FontProvider>
    );
}
