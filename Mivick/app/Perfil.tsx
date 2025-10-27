import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { FirstTextField } from '@/components/FirstTextField/FirstTextField';
import { FirstSubTitle } from '@/components/FirstSubTitle';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';
import { styles } from '@/components/styles/stylePerfil';

export default function Perfil() {
    const router = useRouter();

    const campos: { label: string; icon: 'pencil' }[] = [
        { label: 'Nome', icon: 'pencil' },
        { label: 'Telefone', icon: 'pencil' },
        { label: 'Email', icon: 'pencil' },
    ];


    return (
        <ScrollView contentContainerStyle={styles.container}>

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
                <PerfilFoto style={{ width: 100, height: 100 }} showEditIcon={true}/>
            </View>



            <FirstSubTitle
                text="Editar"
                style={{
                    fontSize: 20,
                    color: '#F85200',
                    marginBottom: 22,
                    alignSelf: 'center',
                }}
            />


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


            {campos.map((campo, index) => (
                <View
                    key={index}
                    style={{
                        width: '90%',
                        alignSelf: 'center',
                        marginBottom: 40,
                    }}
                >

                    <View
                        style={{
                            position: 'absolute',
                            top: -10,
                            left: 45,
                            backgroundColor: '#1B1B1A',
                            paddingHorizontal: 5,
                            zIndex: 1,
                        }}
                    >
                        <FirstSubTitle text={campo.label} style={{ fontSize: 14, color: '#F85200' }} />
                    </View>


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
                                backgroundColor: '#1B1B1A',
                                borderColor: '#F85200',
                                borderWidth: 2,
                                color: '#fff',
                                height: 45,
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                            }}
                        />
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}
