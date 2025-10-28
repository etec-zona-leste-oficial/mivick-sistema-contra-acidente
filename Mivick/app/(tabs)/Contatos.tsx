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

  return (
    <View style={{ flex: 1 }}>
      <HeaderComLogin />
      <ScrollView style={styles.container}>
        <FirstTitle
          text="Contatos"
          style={{
            fontSize: 35,
            marginBottom: 10,
            marginTop: 15,
            paddingHorizontal: 12,
          }}
        />

        <View
          style={{
            height: 2,
            backgroundColor: '#F85200',
            width: '107%',
            alignSelf: 'center',
            marginVertical: 12,
            marginBottom: 30,
          }}
        />

        {/* --- Lista de contatos --- */}
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            style={{
              marginBottom: 15,
              height: height * 0.1,
              width: width * 0.95,
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
            }}
          >
            {/* Área esquerda: Foto + Nome */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <PerfilFoto
                size={50} // tamanho menor para caber no card
                style={{ borderRadius: 25 }}
              />
              <FirstTitle text={contact.name} fontSize={23} />
            </View>

            {/* Área direita: Botões de ação */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View
                style={{
                  backgroundColor: '#F85200',
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome name="pencil" size={18} color="#fff" />
              </View>

              <View
                style={{
                  backgroundColor: '#F85200',
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome name="close" size={22} color="#fff" />
              </View>
            </View>
          </ContactCard>
        ))}

        {/* --- Botão para adicionar novo contato --- */}
        <FirstButton
          title="Adicionar Contato"
          onPress={() => router.push('./CadastrarContato')}
          customStyle={{ marginTop: 25 }}
          icon={<FontAwesome name="plus" size={18} color="#fff" />}
        />
      </ScrollView>
    </View>
  );
}
