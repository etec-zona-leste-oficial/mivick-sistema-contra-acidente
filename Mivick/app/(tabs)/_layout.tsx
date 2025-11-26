import { BleProvider } from '@/components/providers/BleProvider'; // ⬅️ importa o contexto BLE
import FontProvider from '@/components/providers/FontProvider';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

let sound: Audio.Sound | null = null;

async function carregarSom() {
  const res = await Audio.Sound.createAsync(
    require("../../assets/alerta.mp3"),
    { shouldPlay: false } // garante preload
  );
  sound = res.sound;
}

async function tocarSomAlerta() {
  if (!sound) return;
  try {
    await sound.stopAsync();
  } catch {}
  await sound.playFromPositionAsync(0);
}



async function buscarUltimoAlerta(id_dispositivo: number, token: string) {
  const resp = await fetch(
    `http://10.116.216.162:3000/app/mivick/iot/ultimo-alerta/${id_dispositivo}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const json = await resp.json();
  if (!json.ok) return null;

  return json.datahora;
}
export default function TabsLayout() {
 useEffect(() => {
  let interval: any;

  async function iniciar() {
    await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: false,
  playThroughEarpieceAndroid: false,
  
});


    await carregarSom();   // 🔊 carrega som 1x
    iniciarMonitoramento(); // 🟠 verifica alertas
  }

  async function iniciarMonitoramento() {
    const token = await AsyncStorage.getItem("token");
    const id = await AsyncStorage.getItem("device_id");

    if (!token || !id) return;

    interval = setInterval(async () => {
      const datahoraAlerta = await buscarUltimoAlerta(Number(id), token);
      if (!datahoraAlerta) return;

      const agora = new Date();
      const alerta = new Date(datahoraAlerta);

      const diff = Math.abs((agora.getTime() - alerta.getTime()) / 1000);

      if (diff <= 15) {
        tocarSomAlerta(); // 🔊 toca
      }
    }, 5000);
  }

  iniciar();

  return () => {
    clearInterval(interval);
    if (sound) sound.unloadAsync();
  };
}, []);

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
              <Ionicons name="people-outline" color={color} size={size} />
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
