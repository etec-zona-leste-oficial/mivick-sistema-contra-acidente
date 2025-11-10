import React, { useEffect, useState } from 'react';
import { View, ScrollView, Dimensions, Alert, TouchableOpacity, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FirstTextField } from '@/components/FirstTextField/FirstTextField';
import { FirstSubTitle } from '@/components/FirstSubTitle';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';
import FontProvider from '@/components/providers/FontProvider';
import { FirstButton } from '@/components/FirstButton';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://192.168.15.66:3000/app/mivick/user'; // Seu backend

export default function Perfil() {
  const [userData, setUserData] = useState({ nome: '', telefone: '', email: '', foto: '' });
  const [loading, setLoading] = useState(true);

  // Função para buscar perfil
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setUserData({
          nome: data.user.nome,
          telefone: data.user.telefone,
          email: data.user.email,
          foto: data.user.foto || '',
        });
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

  // Função para atualizar perfil
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: userData.nome,
          telefone: userData.telefone,
          email: userData.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso', 'Perfil atualizado!');
      } else {
        Alert.alert('Erro', data.error || 'Falha ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Falha de conexão com o servidor');
    }
  };

  if (loading) return <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>Carregando...</Text>;

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
        {/* FOTO DE PERFIL */}
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
            showEditIcon={true}
            onChangePhoto={(uri: string) => setUserData(prev => ({ ...prev, foto: uri }))}
            imageUri={userData.foto}
          />
        </View>

        <FirstSubTitle
          text="Editar"
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
                  color: '#fff',
                  height: height * 0.055,
                  paddingHorizontal: width * 0.025,
                  borderRadius: 6,
                  fontSize: Math.min(width * 0.04, 16),
                }}
                placeholderTextColor="#ccc"
                value={userData[campo]}
                onChangeText={text => setUserData(prev => ({ ...prev, [campo]: text }))}
              />
            </View>
          </View>
        ))}


        {/* BOTÃO SALVAR */}
        <FirstButton title="Salvar" customStyle={{ marginHorizontal: width * 0.05 }} onPress={handleSave} />
      </ScrollView>
    </FontProvider>
  );
}
