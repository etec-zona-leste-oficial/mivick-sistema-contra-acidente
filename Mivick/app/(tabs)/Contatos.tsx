import { ContactCard } from '@/components/ContactCard/ContactCard';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, View, Modal, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { FirstButton } from '../../components/FirstButton';
import { FirstTitle } from '../../components/FirstTitle';
import { HeaderComLogin } from '../../components/HeaderComLogin';
import { styles } from '../../components/styles/styleContato';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';
import Toast from "react-native-toast-message";


// --------------------
// Tipagem dos contatos
// --------------------
type Contact = {
  id_contato: number;
  nome: string;
  sobrenome: string;
  foto?: string | null;
};

const BASE_URL = 'http://10.98.97.162:3000';
const API_URL = `${BASE_URL}/app/mivick/contact/`;

export default function ContatoScreen() {
  const router = useRouter();
  const { height, width } = Dimensions.get('window');

  // --------------------
  // ESTADOS IMPORTANTES
  // --------------------

  // Lista de contatos
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Controle de modal para exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // ID do contato selecionado para excluir
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);

  // Escalas para adaptar fontes e tamanhos à tela
  const scale = width / 375;
  const fontScale = Math.min(scale * 1.1, 1.3);

  // -------------------------
  // FUNÇÃO: Buscar contatos
  // -------------------------
  const fetchContacts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        // Seta lista de contatos
        setContacts(data.contacts as Contact[]);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao carregar contatos',
        });
      }
    } catch (err) {
      console.log("Erro:", err);
    }
  };

  // Carregar contatos somente na montagem da tela
  useEffect(() => {
    fetchContacts();
  }, []);

  // -------------------------
  // FUNÇÃO: Deletar contato
  // -------------------------
  const deleteContact = async () => {
    if (!selectedContactId) return;

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_URL}${selectedContactId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Remove contato da lista atual sem precisar recarregar tudo
        setContacts(prev => prev.filter(c => c.id_contato !== selectedContactId));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao excluir contato',
        })
      }
    } catch (err) {
      console.log("Erro:", err);
    }

    setDeleteModalVisible(false);
  };

  // -------------------------
  // RENDERIZAÇÃO
  // -------------------------

  return (
    <View style={{ flex: 1, backgroundColor: '#1B1B1A' }}>
      <HeaderComLogin />

      <ScrollView
        style={[styles.container, { paddingHorizontal: width * 0.04 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* Título */}
        <FirstTitle
          text="Contatos"
          style={{
            fontSize: 30 * fontScale,
            marginBottom: height * 0.012,
            marginTop: height * 0.02,
            alignSelf: 'flex-start',
          }}
        />

        {/* Linha divisória */}
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

        {/* -------------------------
            LISTA DE CONTATOS
        -------------------------- */}
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

            {/* FOTO + NOME */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: width * 0.03,
                flexShrink: 1
              }}
            >
              <PerfilFoto
                size={width * 0.13}
                imageUri={contact.foto ? `${BASE_URL}${contact.foto}` : ""}
                style={{ borderRadius: (width * 0.13) / 2 }}
              />

              {/* Nome completo */}
              <View style={{ maxWidth: width * 0.45, flexShrink: 1, marginRight: width * 0.05 }}>
                <FirstTitle
                  text={`${contact.nome} ${contact.sobrenome}`}
                  fontSize={20 * fontScale}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                />
              </View>
            </View>

            {/* BOTÕES (editar + excluir) */}
            <View style={{ flexDirection: 'row', gap: width * 0.03 }}>

              {/* Editar */}
              <TouchableOpacity
                onPress={() =>      
                  router.push({
                    pathname: "/EditarContato",
                    params: { id_contato: String(contact.id_contato) }
                  })
                }
              >
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
              </TouchableOpacity>

              {/* Excluir */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedContactId(contact.id_contato);
                  setDeleteModalVisible(true);
                }}
              >
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
              </TouchableOpacity>
            </View>
          </ContactCard>
        ))}

        {/* -------------------------
            BOTÃO: ADICIONAR CONTATO
        -------------------------- */}
        <FirstButton
          title="Adicionar Contato"
          onPress={() => router.push('/CadastrarContato')}
          customStyle={{
            marginTop: height * 0.03,
            marginBottom: height * 0.04,
            alignSelf: 'center',
            width: width * 0.85,
          }}
          icon={<FontAwesome name="plus" size={width * 0.045} color="#fff" />}
        />
      </ScrollView>

      {/* -------------------------
         MODAL DE CONFIRMAÇÃO
      -------------------------- */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >

          <View
            style={{
              backgroundColor: '#1B1B1A',
              padding: width * 0.07,
              borderRadius: width * 0.03,
              width: width * 0.8,
              borderWidth: 2,
              borderColor: '#F85200',
              alignItems: 'center',
            }}
          >
            {/* Título usando mesma fonte do app */}
            <FirstTitle
              text="Tem certeza que deseja excluir este contato?"
              style={{
                color: '#fff',
                fontSize: 20 * fontScale,
                marginBottom: width * 0.05,
                textAlign: 'center',
              }}
            />

            {/* Botões */}
            <View style={{ flexDirection: 'row', gap: width * 0.06 }}>

              {/* Cancelar */}
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <View
                  style={{
                    backgroundColor: '#333',
                    paddingVertical: 12,
                    paddingHorizontal: 22,
                    borderRadius: 10,
                  }}
                >
                  <FirstTitle
                    text="Cancelar"
                    style={{ color: '#fff', fontSize: 17 * fontScale }}
                  />
                </View>
              </TouchableOpacity>

              {/* Excluir */}
              <TouchableOpacity onPress={deleteContact}>
                <View
                  style={{
                    backgroundColor: '#F85200',
                    paddingVertical: 12,
                    paddingHorizontal: 22,
                    borderRadius: 10,
                  }}
                >
                  <FirstTitle
                    text="Excluir"
                    style={{ color: '#fff', fontSize: 17 * fontScale }}
                  />
                </View>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}
