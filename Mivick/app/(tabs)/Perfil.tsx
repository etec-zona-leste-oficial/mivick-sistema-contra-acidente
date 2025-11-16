import React, { useEffect, useState } from 'react';
import { View, ScrollView, Dimensions, Alert, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

import { FirstTextField } from '@/components/FirstTextField/FirstTextField';
import { FirstSubTitle } from '@/components/FirstSubTitle';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';
import { FirstButton } from '@/components/FirstButton';
import FontProvider from '@/components/providers/FontProvider';

const { width, height } = Dimensions.get('window');

const BASE_URL = 'http://192.168.15.66:3000';
const API_URL = `${BASE_URL}/app/mivick/user`;

type UserData = {
  nome: string;
  telefone: string | null;
  email: string;
  foto: string | null;
};

export default function Perfil() {
  const [userData, setUserData] = useState<UserData>({ nome: '', telefone: '', email: '', foto: '' });
  const [googleUser, setGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper: tenta parsear JSON se for JSON, senão retorna texto
  const safeParseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    // não é JSON — retorna texto (útil para debugar HTML de erro)
    const text = await response.text();
    return { __raw: text };
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeParseResponse(response);

      if (response.ok) {
        // Se por algum motivo token JWT do Google foi usado e senha é null, marcamos googleUser
        const serverUser = data.user || {};
        setUserData({
          nome: serverUser.nome || '',
          telefone: serverUser.telefone || '',
          email: serverUser.email || '',
          foto: serverUser.foto ? `${BASE_URL}${serverUser.foto}` : '',
        });

        if (!serverUser.senha) {
          setGoogleUser(true);
        } else {
          setGoogleUser(false);
        }
      } else {
        // Se servidor retornou HTML ou texto, mostra para debug
        const errMsg = data.error || data.message || data.__raw || 'Falha ao carregar perfil';
        Alert.alert('Erro', errMsg);
        console.error('Resposta inválida fetchProfile:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      Alert.alert('Erro', 'Falha de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
        setSaving(false);
        return;
      }

      // monta FormData corretamente (sempre usar new FormData)
      const formData = new FormData();
      formData.append('nome', userData.nome || '');
      formData.append('telefone', userData.telefone || '');

      // Se usuário normal (não-google), permite enviar email
      if (!googleUser) {
        formData.append('email', userData.email || '');
      }

      // Se a foto for local (ex: file://...) é sinal de alteração — envia
      // Caso a foto seja remoto (http://...) não anexa nada
      if (userData.foto && (userData.foto as string).startsWith('file')) {
        // @ts-ignore — RN FormData file object
        formData.append('foto', {
          uri: userData.foto,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // NÃO setar Content-Type aqui — fetch vai criar boundary automaticamente
        },
        body: formData,
      });

      const data = await safeParseResponse(response);

      if (response.ok) {
        const serverUser = data.user || {};
        setUserData(prev => ({
          ...prev,
          // recebe caminho unix /uploads/arquivo.jpg do backend; converte pra URL completa
          foto: serverUser.foto ? `${BASE_URL}${serverUser.foto}` : prev.foto,
          nome: serverUser.nome ?? prev.nome,
          telefone: serverUser.telefone ?? prev.telefone,
          email: serverUser.email ?? prev.email,
        }));

        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      } else {
        const errMsg = data.error || data.message || data.__raw || 'Falha ao atualizar perfil';
        Alert.alert('Erro', errMsg);
        console.error('Resposta inválida handleSave:', data);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Falha de conexão com o servidor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#F85200" />
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 10 }}>Carregando perfil...</Text>
      </View>
    );
  }

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
        {/* FOTO */}
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
            showEditIcon
            onChangePhoto={(uri: string) => setUserData(prev => ({ ...prev, foto: uri }))}
            imageUri={userData.foto ?? ''}
          />
        </View>

        <FirstSubTitle
          text="Editar Perfil"
          style={{
            fontSize: Math.min(width * 0.05, 20),
            color: '#F85200',
            marginBottom: height * 0.025,
            alignSelf: 'center',
          }}
        />

        <View
          style={{
            height: 1.5,
            backgroundColor: '#F85200',
            width: '100%',
            alignSelf: 'center',
            marginBottom: height * 0.05,
          }}
        />

        {/* CAMPOS */}
        {(['nome', 'telefone', 'email'] as (keyof UserData)[]).map((campo, index) => (
          <View key={index} style={{ width: '90%', alignSelf: 'center', marginBottom: height * 0.06 }}>
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
              <FirstSubTitle text={campo.charAt(0).toUpperCase() + campo.slice(1)} style={{ fontSize: Math.min(width * 0.035, 15), color: '#fff' }} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome
                name={campo === 'nome' ? 'user' : campo === 'telefone' ? 'phone' : 'envelope'}
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
                  color: '#fff',
                  height: height * 0.069,
                  paddingHorizontal: width * 0.025,
                  borderRadius: 6,
                  fontSize: Math.min(width * 0.04, 16),
                }}
                placeholderTextColor="#ccc"
                value={(userData[campo] ?? '') as string}
                editable={!(campo === 'email' && googleUser)}
                onChangeText={text => setUserData(prev => ({ ...prev, [campo]: text }))}
              />
            </View>
          </View>
        ))}

        <FirstButton
          title={saving ? 'Salvando...' : 'Salvar'}
          customStyle={{
            marginHorizontal: width * 0.05,
            opacity: saving ? 0.6 : 1,
          }}
          disabled={saving}
          onPress={handleSave}
        />
      </ScrollView>
    </FontProvider>
  );
}
