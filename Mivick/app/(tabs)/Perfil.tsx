import React, { useEffect, useState } from 'react';
import { View, ScrollView, Dimensions, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

import { FirstTextField } from '@/components/FirstTextField/FirstTextField';
import { FirstSubTitle } from '@/components/FirstSubTitle';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';
import { FirstButton } from '@/components/FirstButton';
import FontProvider from '@/components/providers/FontProvider';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from "react-native-toast-message";
import { styles } from '@/components/styles/stylePerfil'


const { width, height } = Dimensions.get('window');

const BASE_URL = 'http://10.116.216.162:3000';
const API_URL = `${BASE_URL}/app/mivick/user`;

type UserData = {
  nome: string;
  telefone: string | null;
  email: string;
  foto: string | null;
};

export default function Perfil() {
  /** Armazena os dados do usuário carregados do backend */
  const [userData, setUserData] = useState<UserData>({ nome: '', telefone: '', email: '', foto: '' });

  /** Indica se a conta é originada do Google (sem senha) */
  const [googleUser, setGoogleUser] = useState(false);

  /** Estado de carregamento inicial */
  const [loading, setLoading] = useState(true);

  /** Estado de salvamento ao enviar alterações */
  const [saving, setSaving] = useState(false);

  /** Controla se o usuário está no modo de edição */
  const [editing, setEditing] = useState(false);

  /* =========================================================
   * Função utilitária para tratar respostas do servidor que
   * podem vir com JSON ou texto puro.
   * =========================================================
   */
  const safeParseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return { __raw: await response.text() };
  };

  /* =========================================================
   * Carrega os dados de perfil do servidor usando o token
   * salvo no dispositivo.
   * =========================================================
   */
  const fetchProfile = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Token não encontrado.'
        })
        return;
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeParseResponse(response);

      if (response.ok) {
        const u = data.user || {};

        // Preenche o estado com os dados recebidos
        setUserData({
          nome: u.nome || '',
          telefone: u.telefone || '',
          email: u.email || '',
          foto: u.foto ? `${BASE_URL}${u.foto}` : '',
        });

        setGoogleUser(!u.senha);
      } else {
        Toast.show({
          type: 'error',
          text1: data.error|| data.__raw || 'Falha ao carregar perfil.'
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Falha de conexão com o servidor.'
      })
    } finally {
      setLoading(false);
    }
  };

  /** Carrega o perfil ao abrir a tela */
  useEffect(() => {
    fetchProfile();
  }, []);

  /* =========================================================
   * Envia as alterações do perfil para o backend.
   * Prepara FormData pois pode haver envio de imagem.
   * =========================================================
   */
  const handleSave = async () => {
    try {
      setSaving(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Erro', 'Token não encontrado.');

      const formData = new FormData();
      formData.append('nome', userData.nome || '');
      formData.append('telefone', userData.telefone || '');

      // Email só pode ser alterado se não for conta Google
      if (!googleUser) {
        formData.append('email', userData.email || '');
      }

      // Envia a foto somente se ela for um arquivo novo
      if (userData.foto && userData.foto.startsWith('file')) {
        // @ts-ignore
        formData.append('foto', {
          uri: userData.foto,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await safeParseResponse(response);

      if (response.ok) {
        const u = data.user || {};

        // Atualiza dados no estado
        setUserData(prev => ({
          ...prev,
          foto: u.foto ? `${BASE_URL}${u.foto}` : prev.foto,
          nome: u.nome ?? prev.nome,
          telefone: u.telefone ?? prev.telefone,
          email: u.email ?? prev.email,
        }));

        // Desativa o modo edição após salvar
        setEditing(false);

        Toast.show({
          type: 'success',
          text1: 'Perfil atualizado com sucesso!'
        })

      } else {
        Toast.show({
          type: 'error',
          text1: data.error || data.__raw || 'Falha ao tentar atualizar perfil.'
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Falha de conexão com o servidor.'
      })
      
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
   * Tela de carregamento enquanto os dados estão sendo buscados
   * =========================================================
   */
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#F85200" />
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 10 }}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  /* =========================================================
   * Renderização principal da interface
   * =========================================================
   */
  return (
    <FontProvider>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: '#000',
          paddingVertical: height * 0.05,
        }}
        showsVerticalScrollIndicator={false}
      >

        <LinearGradient
          colors={['#F85200',  '#000']}
          start={{x: 0.5, y: 0}}
          end={{x:0.5, y:1}}
          style={styles.linearGrad}
        />

        {/* Área da foto de perfil */}
        <View
          style={{
            alignSelf: 'center',
            marginTop: height * 0.06,
            marginBottom: height * 0.02,
            borderRadius: width * 0.25,
            borderWidth: 3,
            borderColor: '#F85200',
            padding: 3,
          }}
        >
          <PerfilFoto
            style={{ width: width * 0.27, height: width * 0.27 }}
            showEditIcon={editing}
            onChangePhoto={(uri: string) =>
              editing && setUserData(prev => ({ ...prev, foto: uri }))
            }
            imageUri={userData.foto ?? ''}
          />
        </View>

        {/* Botão que ativa o modo de edição */}
        {!editing && (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <FirstSubTitle
              text="Editar Perfil"
              style={{
                fontSize: Math.min(width * 0.05, 20),
                color: '#F85200',
                marginBottom: height * 0.025,
                alignSelf: 'center',
              }}
            />
          </TouchableOpacity>
        )}

        {/* Texto exibido quando o modo edição está ativo */}
        {editing && (
          <FirstSubTitle
            text="Edição ativada"
            style={{
              fontSize: Math.min(width * 0.045, 18),
              color: '#F85200',
              marginBottom: height * 0.025,
              alignSelf: 'center',
            }}
          />
        )}

        {/* Linha divisória */}
        <View
          style={{
            height: 1.5,
            backgroundColor: '#F85200',
            width: '100%',
            alignSelf: 'center',
            marginBottom: height * 0.05,
          }}
        />

        {/* Campos do formulário (Nome, Telefone, Email) */}
        {(['nome', 'telefone', 'email'] as (keyof UserData)[]).map((campo, index) => (
          <View key={index} style={{ width: '90%', alignSelf: 'center', marginBottom: height * 0.06 }}>
            {/* Rótulo acima do campo */}
            <View
              style={{
                position: 'absolute',
                top: -height * 0.015,
                left: width * 0.12,
                backgroundColor: '#000',
                paddingHorizontal: width * 0.015,
                zIndex: 1,
              }}
            >
              <FirstSubTitle
                text={campo.charAt(0).toUpperCase() + campo.slice(1)}
                style={{ fontSize: Math.min(width * 0.035, 15), color: '#fff' }}
              />
            </View>

            {/* Campo com ícone */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome
                name={
                  campo === 'nome'
                    ? 'user'
                    : campo === 'telefone'
                    ? 'phone'
                    : 'envelope'
                }
                size={Math.min(width * 0.06, 26)}
                color="#F85200"
                style={{ marginRight: width * 0.03 }}
              />

              <FirstTextField
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderColor: '#F85200',
                  borderWidth: 2,
                  height: height * 0.069,
                  paddingHorizontal: width * 0.025,
                  borderRadius: 6,
                  fontSize: Math.min(width * 0.04, 16),
                  color: editing ? '#fff' : '#999', // cinza fora do modo edição
                }}
                placeholderTextColor="#ccc"
                value={(userData[campo] ?? '') as string}
                editable={editing && !(campo === 'email' && googleUser)}
                onChangeText={text =>
                  setUserData(prev => ({ ...prev, [campo]: text }))
                }
              />
            </View>
          </View>
        ))}

        {/* Botão salvar exibido somente durante edição */}
        {editing && (
          <FirstButton
            title={saving ? 'Salvando...' : 'Salvar'}
            customStyle={{
              marginHorizontal: width * 0.05,
              opacity: saving ? 0.6 : 1,
            }}
            disabled={saving}
            onPress={handleSave}
          />
        )}
      </ScrollView>
    </FontProvider>
  );
}
