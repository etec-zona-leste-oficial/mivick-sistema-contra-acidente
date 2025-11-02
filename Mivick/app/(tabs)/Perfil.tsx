import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { FirstTextField } from '@/components/FirstTextField/FirstTextField';
import { FirstSubTitle } from '@/components/FirstSubTitle';
import { PerfilFoto } from '@/components/PerfilFoto/perfilFoto';
import FontProvider from '@/components/providers/FontProvider';

const { width, height } = Dimensions.get('window');

export default function Perfil() {
  const campos: { label: string; icon: keyof typeof FontAwesome.glyphMap }[] = [
    { label: 'Nome', icon: 'user' },
    { label: 'Telefone', icon: 'phone' },
    { label: 'Email', icon: 'envelope' },
  ];

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
            style={{
              width: width * 0.27,
              height: width * 0.27,
            }}
            showEditIcon={true}
          />
        </View>

        {/* TEXTO "EDITAR" */}
        <FirstSubTitle
          text="Editar"
          style={{
            fontSize: Math.min(width * 0.05, 20),
            color: '#F85200',
            marginBottom: height * 0.025,
            alignSelf: 'center',
          }}
        />

        {/* LINHA DE SEPARAÇÃO */}
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
        {campos.map((campo, index) => (
          <View
            key={index}
            style={{
              width: '90%',
              alignSelf: 'center',
              marginBottom: height * 0.05,
            }}
          >
            {/* RÓTULO (título acima do campo) */}
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
                text={campo.label}
                style={{
                  fontSize: Math.min(width * 0.035, 15),
                  color: '#fff',
                }}
              />
            </View>

            {/* CAMPO DE TEXTO */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome
                name={campo.icon}
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
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </FontProvider>
  );
}
