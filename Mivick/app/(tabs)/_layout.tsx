import { BleProvider } from '@/components/providers/BleProvider'; // ⬅️ importa o contexto BLE
import FontProvider from '@/components/providers/FontProvider';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <BleProvider>
    <FontProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#000',
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            height: 55,
            width: '80%',           
            marginHorizontal: '10%', 
            borderRadius: 25,
            backgroundColor: '#F85200',
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }


          ,
          tabBarLabelStyle: {
            fontFamily: 'SansBoldPro',
            fontSize: 12,
          },
        }}
      >
        {/* Aba Início */}
        <Tabs.Screen
          name="Home"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />

        {/* Aba Histórico */}
        <Tabs.Screen
          name="Contatos"
          options={{
            title: 'Contatos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="alert-circle-outline" color={color} size={size} />
            ),
          }}
        />

        {/* Aba Configurações */}
        <Tabs.Screen
          name="Configurações"
          options={{
            title: 'Configurações',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" color={color} size={size} />
            ),
          }}
        />

        {/* Aba Perfil */}
        <Tabs.Screen
          name="Perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="ConectarDispositivo"
          options={{
          href: null, // 👈 impede que apareça como aba
          }}
        />
      <Tabs.Screen
          name="HistoricoAlerta"
          options={{
          href: null, // 👈 impede que apareça como aba
          }}
        />

      </Tabs>
      
    </FontProvider>
    </BleProvider>
  );
}
