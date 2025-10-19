import React, { useState } from 'react';

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
// Componentes
import { HeaderComLogin } from '../components/HeaderComLogin'; // 🔥 import do header
import { FirstTitle } from '@/components/FirstTitle';
import { FirstTextField } from '@/components/FirstTextField';
import { FirstButton } from '@/components/FirstButton';
import { styles } from '../components/styles/styleCadastrarContato';

export default function CadastrarContato() {
    return (
        <View style={{flex: 1}}>
             <HeaderComLogin />
            <ScrollView style={styles.container}>

                 <FirstTitle text="Cadastre um contato" style={{fontSize: 35, marginBottom: 10, marginTop: 15, paddingHorizontal: 12 }} />
                         <View
                            style={{
                            height: 1,          // espessura da linha
                            backgroundColor: '#F85200', // cor laranja
                            width: '100%',       // comprimento da linha
                            alignSelf: 'center',
                            marginVertical: 12, // espaço acima e abaixo da linha
                            }}
                            />

                   {/* Adicionar o Perfil e TextFields */}
             
            <FirstButton title="Cadastrar"/>
                            
            </ScrollView>
        </View>
    )
}