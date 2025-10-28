import React from 'react';
import { View, ScrollView, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { FirstCard } from '../../components/FirstCard/FirstCard';
import { FirstTitle } from '../../components/FirstTitle';
import { FirstSubTitle } from '../../components/FirstSubTitle';
import { FirstButton } from '../../components/FirstButton';
import { FirstCarrousel } from '../../components/FirstCarrousel/FirstCarrousel';
import { HeaderComLogin } from '@/components/HeaderComLogin/HeaderComLogin';
import { styles } from '../../components/styles/styleHome1';
import { ContactCard } from '@/components/ContactCard/ContactCard';

const { height, width } = Dimensions.get("window");

const carouselImages = [
  require('../../assets/images/primeira-bike1.jpg'),
  require('../../assets/images/primeira-bike1.jpg'),
  require('../../assets/images/primeira-bike1.jpg')
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#1B1B1A' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: height * 0.05 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header dentro do ScrollView */}
        <HeaderComLogin />

        {/* Carrossel grudado ao Header */}
        <View style={{ height: height * 0.20, width: '100%' }}>
          <FirstCarrousel images={carouselImages} style={{ flex: 1 }} />
        </View>

        {/* Dispositivos Conectados */}
        <View style={{ marginTop: height * 0.03, paddingHorizontal: 12 }}>
          <FirstTitle text="Dispositivos Conectados" fontSize={28}/>
          <FirstSubTitle text="Para começar, conecte um dispositivo Mivick." />
        </View>

        <FirstCard customStyle={{ width: width * 0.9, alignSelf: 'center', paddingHorizontal: 22 }}>
          {/* Linha com ícone e subtítulo centralizados */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <FontAwesome name="wifi" size={20} color="#FF4500" style={{ marginRight: 6 }} />
            <FirstTitle text="Como conectar?" fontSize={25} />
          </View>

          <FirstSubTitle text = "Para conectar, clique no botão abaixo e siga o passo a passo que irá aparecer." style={{ marginBottom: 70, textAlign: 'center' }} />

          <FirstButton title="Conectar dispositivo"
          onPress={() => router.push('/ConectarDispositivo')}
            //onPress={() => router.push('/ble-screen')} // 🔗 vai pra tela BLE 
             />
        </FirstCard>


        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '90%',
            alignSelf: 'center',
            marginVertical: height * 0.015,
            marginBottom: height * 0.019,
          }}
        />

        {/* Contatos Cadastrados */}

        <FirstTitle text="Contatos cadastrados" fontSize={25} style={{paddingHorizontal: 22, marginBottom: 25}}/>

        <ContactCard style ={{ width: width * 0.6,height: height * 0.4 ,alignSelf: 'center', marginBottom: 16 }}>
          <FirstTitle text="Você ainda não possui um contato cadastrado." fontSize={28} style={{ marginTop: 22 }} />
          <FirstSubTitle text= "Cadastre um contato para vê-lo aqui." />
          <FirstButton
            title="Cadastrar contato"
            onPress={() => router.push('./CadastrarContato')}
            customStyle={{width: width * 0.5,height: 50, marginTop: 50}}
          />
        </ContactCard>

        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '90%',
            alignSelf: 'center',
            marginVertical: height * 0.015,
            marginBottom: height * 0.019,
          }}
        />

        {/* Histórico */}
        <FirstCard customStyle={{ borderRadius: 0 }}>
          <View style={{ alignItems: 'center', marginBottom: '10%' }}>
            <FirstTitle text="Verifique seu histórico" fontSize={26} style={{ marginBottom: 20}}/>
            <FirstSubTitle text="Confira seu histórico de corridas, vias e ruas em que passou, zonas de perigo e etc." style={{ marginBottom: 20 ,textAlign: 'center'}} />
          </View>
          {/* Botão alinhado padrão */}
          <FirstButton title="Histórico do dispositivo" onPress={() => router.push('./HistoricoAlerta')} />
        </FirstCard>
      </ScrollView>
    </View>
  );
}
