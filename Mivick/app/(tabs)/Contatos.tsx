import { ContactCard } from '@/components/ContactCard/ContactCard';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { FirstButton } from '../../components/FirstButton';
import { FirstTitle } from '../../components/FirstTitle';
import { HeaderComLogin } from '../../components/HeaderComLogin';
import { styles } from '../../components/styles/styleContato';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';

const BASE_URL = 'http://192.168.15.66:3000';
const API_URL = `${BASE_URL}/app/mivick/contact/contato`;

// Defina o shape do contato
interface Contact {
  id_contato: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  foto?: string | null; // '/uploads/xxx.jpg' ou null
}

export default function ContatoScreen() {
  const router = useRouter();
  const { height, width } = Dimensions.get('window');

  const [contacts, setContacts] = useState<Contact[]>([]);

  const scale = width / 375;
  const fontScale = Math.min(scale * 1.1, 1.3);

  // parse seguro (retorna json ou texto bruto)
  const safeParseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    const text = await response.text();
    return { __raw: text };
  };

  // Buscar contatos
  const fetchContacts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("Token não encontrado ao buscar contatos");
        return;
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: any = await safeParseResponse(response);

      if (response.ok) {
        // assume backend retorna { contacts: [...] }
        const list: Contact[] = Array.isArray(data.contacts) ? data.contacts : [];
        setContacts(list);
      } else {
        console.error("Erro ao carregar contatos:", data);
      }
    } catch (err) {
      console.error("Erro ao buscar contatos:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#1B1B1A' }}>
      <HeaderComLogin />
      <ScrollView
        style={[styles.container, { paddingHorizontal: width * 0.04 }]}
        showsVerticalScrollIndicator={false}
      >
        <FirstTitle
          text="Contatos"
          style={{
            fontSize: 30 * fontScale,
            marginBottom: height * 0.012,
            marginTop: height * 0.02,
            alignSelf: 'flex-start',
          }}
        />

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

        {contacts.map((contact) => (
          <ContactCard
            key={contact.id_contato}
            style={{
              marginBottom: height * 0.02,
              height: height * 0.1,
              width: width * 0.90,
              borderRadius: width * 0.02,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: width * 0.04,
              alignSelf: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: width * 0.03 }}>
              <PerfilFoto
                size={width * 0.13}
                imageUri={contact.foto ? `${BASE_URL}${contact.foto}` : ''}
                style={{ borderRadius: (width * 0.13) / 2 }}
              />

              <FirstTitle text={contact.nome} fontSize={20 * fontScale} />
            </View>

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
                <FontAwesome name="pencil" size={width * 0.045} color="#fff" />
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
                <FontAwesome name="close" size={width * 0.05} color="#fff" />
              </View>
            </View>
          </ContactCard>
        ))}

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
