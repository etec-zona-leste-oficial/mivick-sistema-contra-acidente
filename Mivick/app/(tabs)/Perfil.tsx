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

  // 🔥 Novo estado — controla se o perfil pode ser editado
  const [editing, setEditing] = useState(false);

  // BACKEND : 

  const safeParseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return { __raw: await response.text() };
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Token não encontrado.');
        return;
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeParseResponse(response);

      if (response.ok) {
        const u = data.user || {};
        setUserData({
          nome: u.nome || '',
          telefone: u.telefone || '',
          email: u.email || '',
          foto: u.foto ? `${BASE_URL}${u.foto}` : '',
        });

        setGoogleUser(!u.senha);
      } else {
        Alert.alert('Erro', data.error || data.__raw || 'Falha ao carregar perfil');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha de conexão');
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
      if (!token) return Alert.alert('Erro', 'Token não encontrado.');

      const formData = new FormData();
      formData.append('nome', userData.nome || '');
      formData.append('telefone', userData.telefone || '');

      if (!googleUser) {
        formData.append('email', userData.email || '');
      }

      // Foto só envia se for nova (file://)
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
        setUserData(prev => ({
          ...prev,
          foto: u.foto ? `${BASE_URL}${u.foto}` : prev.foto,
          nome: u.nome ?? prev.nome,
          telefone: u.telefone ?? prev.telefone,
          email: u.email ?? prev.email,
        }));

        setEditing(false); // 🔥 Fecha modo edição

        Alert.alert('Sucesso', 'Perfil atualizado!');
      } else {
        Alert.alert('Erro', data.error || data.__raw || 'Falha ao atualizar');
      }
    } catch (error) {
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


  // UI PRINCIPAL DESIGN
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

        {/* DEGRADÊ */}



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
            showEditIcon={editing}
            onChangePhoto={(uri: string) => editing && setUserData(prev => ({ ...prev, foto: uri }))}
            imageUri={userData.foto ?? ''}
          />
        </View>

        {/* BOTÃO EDITAR */}
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

      

        {/* Quando está editando, troca para texto informativo */}
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
              <FirstSubTitle
                text={campo.charAt(0).toUpperCase() + campo.slice(1)}
                style={{ fontSize: Math.min(width * 0.035, 15), color: '#fff' }}
              />
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
                  height: height * 0.069,
                  paddingHorizontal: width * 0.025,
                  borderRadius: 6,
                  fontSize: Math.min(width * 0.04, 16),
                  color: editing ? '#fff' : '#999',
                }}
                placeholderTextColor="#ccc"
                value={(userData[campo] ?? '') as string}
                editable={editing && !(campo === 'email' && googleUser)}
                onChangeText={text => setUserData(prev => ({ ...prev, [campo]: text }))}
              />
            </View>
          </View>
        ))}

        {/* BOTÃO SALVAR — só aparece no modo edição */}
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
