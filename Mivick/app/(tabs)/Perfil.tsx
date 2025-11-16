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

export default function Perfil() {
  const [userData, setUserData] = useState({ nome: '', telefone: '', email: '', foto: '' });
  const [googleUser, setGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        setUserData({
          nome: data.user.nome || '',
          telefone: data.user.telefone || '',
          email: data.user.email || '',
          foto: data.user.foto ? `${BASE_URL}${data.user.foto}` : '',
        });

        if (!data.user.senha) {
          setGoogleUser(true);
        }

      } else {
        Alert.alert('Erro', data.error || 'Falha ao carregar perfil');
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
      if (!token) return;

      const formData = new FormData();
      formData.append('nome', userData.nome);
      formData.append('telefone', userData.telefone);

      // Usuário Google NÃO altera email
      if (!googleUser) {
        formData.append('email', userData.email);
      }

      
      if (userData.foto && userData.foto.startsWith('file')) {
        formData.append('foto', {
          uri: userData.foto,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {

        setUserData(prev => ({
          ...prev,
          foto: data.user.foto ? `${BASE_URL}${data.user.foto}` : ''
        }));

        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      } else {
        Alert.alert('Erro', data.error || 'Falha ao atualizar perfil');
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
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 10 }}>
          Carregando perfil...
        </Text>
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
            imageUri={userData.foto}
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
        {(['nome', 'telefone', 'email'] as (keyof typeof userData)[]).map((campo, index) => (
          <View key={index} style={{ width: '90%', alignSelf: 'center', marginBottom: height * 0.05 }}>
            <View
              style={{
                position: 'absolute',
                top: -height * 0.015,
                left: width * 0.12,
                backgroundColor: 'transparent',
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
                  color: '#fff',
                  height: height * 0.055,
                  paddingHorizontal: width * 0.025,
                  borderRadius: 6,
                  fontSize: Math.min(width * 0.04, 16),
                }}
                placeholderTextColor="#ccc"
                value={userData[campo]}
                editable={campo !== 'email' || !googleUser} // 👈 BLOQUEIA EMAIL GOOGLE
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
