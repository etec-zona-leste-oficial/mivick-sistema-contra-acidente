import { ContactCard } from '@/components/ContactCard/ContactCard';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { FirstButton } from '../../components/FirstButton';
import { FirstTitle } from '../../components/FirstTitle';
import { HeaderComLogin } from '../../components/HeaderComLogin';
import { styles } from '../../components/styles/styleContato';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';

export default function ContatoScreen() {
  const router = useRouter();
  const { height, width } = Dimensions.get('window');

  const contacts = [
    { id: 1, name: 'Contato 1' },
    { id: 2, name: 'Contato 2' },
    { id: 3, name: 'Contato 3' },
  ];

  // Escalas baseadas na tela
  const scale = width / 375; // base iPhone X
  const fontScale = Math.min(scale * 1.1, 1.3);

  return (
    <View style={{ flex: 1, backgroundColor: '#1B1B1A' }}>
      <HeaderComLogin />
      <ScrollView
        style={[styles.container, { paddingHorizontal: width * 0.04 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Título --- */}
        <FirstTitle
          text="Contatos"
          style={{
            fontSize: 30 * fontScale,
            marginBottom: height * 0.012,
            marginTop: height * 0.02,
            alignSelf: 'flex-start',
          }}
        />

        {/* --- Linha separadora --- */}
        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '110%',
            alignSelf: 'center',
            marginVertical: height * 0.015,
            marginBottom: height * 0.035,
          }}
        />

        {/* --- Lista de contatos --- */}
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            style={{
              marginBottom: height * 0.02,
              height: height * 0.1    ,
              width: width * 0.90,
              borderRadius: width * 0.02,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: width * 0.04,
              alignSelf: 'center',
            }}
          >
            {/* --- Área esquerda: Foto + Nome --- */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: width * 0.03,
              }}
            >
              <PerfilFoto
                size={width * 0.13} // tamanho dinâmico
                style={{ borderRadius: (width * 0.13) / 2 }}
              />
              <FirstTitle text={contact.name} fontSize={20 * fontScale} />
            </View>

            {/* --- Área direita: Botões --- */}
            <View style={{ flexDirection: 'row', gap: width * 0.03 }}>
              <View
                style={{
                  backgroundColor: '#F85200',
                  width: width * 0.11,
                  height: width * 0.11,
                  borderRadius: (width * 0.11) / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome
                  name="pencil"
                  size={width * 0.045}
                  color="#fff"
                />
              </View>

              <View
                style={{
                  backgroundColor: '#F85200',
                  width: width * 0.11,
                  height: width * 0.11,
                  borderRadius: (width * 0.11) / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome
                  name="close"
                  size={width * 0.05}
                  color="#fff"
                />
              </View>
            </View>
          </ContactCard>
        ))}

        {/* --- Botão para adicionar novo contato --- */}
        <FirstButton
          title="Adicionar Contato"
          onPress={() => router.push('./CadastrarContato')}
          customStyle={{
            marginTop: height * 0.03,
            marginBottom: height * 0.04,
            alignSelf: 'center',
            width: width * 0.85,
          }}
          icon={<FontAwesome name="plus" size={width * 0.045} color="#fff" />}
        />
      </ScrollView>
    </View>
  );
}
