import React from 'react';
import { View, ScrollView, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { FirstCard } from '../../components/FirstCard/FirstCard';
import { FirstTitle } from '../../components/FirstTitle';
import { FirstSubTitle } from '../../components/FirstSubTitle';
import { FirstButton } from '../../components/FirstButton';
import { FirstCarrousel } from '../../components/FirstCarrousel/FirstCarrousel';
import { HeaderComLogin } from '@/components/HeaderComLogin/HeaderComLogin';
import { ContactCard } from '@/components/ContactCard/ContactCard';

const { height, width } = Dimensions.get("window");

const carouselImages = [
  require('../../assets/images/primeira-bike1.jpg'),
  require('../../assets/images/primeira-bike1.jpg'),
  require('../../assets/images/primeira-bike1.jpg')
];

export default function HomeScreen() {
  const router = useRouter();

  const scaleFont = (size: number) => {
    // Escala de fonte responsiva baseada na largura da tela
    const baseWidth = 375; // largura base padrão (iPhone X)
    return Math.round(size * (width / baseWidth));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: height * 0.15 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <HeaderComLogin />
       
        {/* Carrossel */}
        <View style={{ height: height * 0.22, width: '100%' }}>
          <FirstCarrousel images={carouselImages} style={{ flex: 1 }} />
        </View>

        {/* Dispositivos Conectados */}
        <View style={{ marginTop: height * 0.03, paddingHorizontal: '4%' }}>
          <FirstTitle text="Dispositivos Conectados" fontSize={scaleFont(24)} />
          <FirstSubTitle text="Para começar, conecte um dispositivo Mivick." />
        </View>

        <FirstCard customStyle={{ width: '90%', alignSelf: 'center', paddingHorizontal: '5%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <FontAwesome name="wifi" size={scaleFont(20)} color="#FF4500" style={{ marginRight: 6 }} />
            <FirstTitle text="Como conectar?" fontSize={scaleFont(22)} />
          </View>

          <FirstSubTitle
            text="Para conectar, clique no botão abaixo e siga o passo a passo que irá aparecer."
            style={{ marginBottom: height * 0.08, textAlign: 'center' }}
          />

          <FirstButton
            title="Conectar Dispositivo"
            onPress={() => router.push('/ConectarDispositivo')}
          />
        </FirstCard>

        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '90%',
            alignSelf: 'center',
            marginVertical: height * 0.015,
          }}
        />

        {/* Contatos Cadastrados */}
        <FirstTitle
          text="Contatos cadastrados"
          fontSize={scaleFont(26)}
          style={{ paddingHorizontal: '5%', marginBottom: 25 }}
        />

        <ContactCard
          style={{
            width: '90%',
            maxWidth: 250, // mantém proporção do card
            backgroundColor: '#2A2A2A',
            borderRadius: 20,
            alignItems: 'flex-start', // textos no topo
            justifyContent: 'space-between',
            paddingVertical: height * 0.025, // padding proporcional
            paddingHorizontal: '5%',
            minHeight: height * 0.35,
            alignSelf: 'center',
            marginBottom: height * 0.025,
          }}
        >
          {/* Título e subtítulo */}
          <View style={{ width: '100%' }}>
            <FirstTitle
              text="Você ainda não possui um contato cadastrado."
              fontSize={Math.min(scaleFont(25), width * 0.06)} // responsivo, não ultrapassa a tela
              style={{
                color: '#fff',
                marginBottom: height * 0.008,
                lineHeight: Math.min(scaleFont(26), width * 0.07)
              }}
            />
            <FirstSubTitle
              text="Cadastre um contato para vê-lo aqui."
              style={{
                fontSize: Math.min(scaleFont(14), width * 0.045), // responsivo
                color: '#D9D9D9',
                marginBottom: height * 0.02,
              }}
            />
          </View>

          {/* Botão largo e responsivo */}
          <FirstButton
            title="Cadastrar contato"
            onPress={() => router.push('/CadastrarContato')}
            customStyle={{
              width: '100%', // botão largo
              paddingVertical: height * 0.012, // altura agora depende do conteúdo
              marginTop: height * 0.01,
              backgroundColor: '#F85200',
              borderRadius: 7,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            customTextStyle={{
              fontSize: Math.min(scaleFont(16), width * 0.045), // texto sempre visível
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          />
        </ContactCard>



        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '90%',
            alignSelf: 'center',
            marginVertical: height * 0.015,
          }}
        />

        {/* Histórico */}
        <FirstCard customStyle={{ borderRadius: 0, paddingVertical: height * 0.03 }}>
          <View style={{ alignItems: 'center', marginBottom: height * 0.03 }}>
            <FirstTitle text="Verifique seu histórico" fontSize={scaleFont(20)} style={{ marginBottom: 20 }} />
            <FirstSubTitle text="Confira seu histórico de corridas, vias e ruas em que passou, zonas de perigo e etc." style={{ marginBottom: 20, textAlign: 'center' }} />
          </View>
          <FirstButton title="Histórico do dispositivo" onPress={() => router.push('/HistoricoAlerta')} />
        </FirstCard>
      </ScrollView>
     
    </View>
  );
}
