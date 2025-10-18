import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FirstCard } from '../components/FirstCard/FirstCard';
import { FirstTitle } from '../components/FirstTitle';
import { useRouter } from 'expo-router';
import { FirstSubTitle } from '../components/FirstSubTitle';
import { FirstButton } from '../components/FirstButton';
import { styles } from '../components/styles/styleContato';
import { HeaderComLogin } from '../components/HeaderComLogin'; // 🔥 import do header
import { FontAwesome } from '@expo/vector-icons';


export default function ContatoScreen () {
    const router = useRouter();
    return (
        <View style={{ flex: 1 }}>
                  <HeaderComLogin />
        <ScrollView style={styles.container}>
        <FirstTitle text="Contatos" />  
         <View
            style={{
            height: 2,          // espessura da linha
            backgroundColor: '#F85200', // cor laranja
            width: '100%',       // comprimento da linha
            alignSelf: 'center',
            marginVertical: 12, // espaço acima e abaixo da linha
            }}
            />

            
            {/* Adicionar os Cards de contatos */}

        <FirstButton title="Adicionar Contato"  onPress={() => router.push('/cadastrarContato')} />
            
        </ScrollView>  
        </View>
    );
}