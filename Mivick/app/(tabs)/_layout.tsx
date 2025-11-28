  import { BleProvider } from '@/components/providers/BleProvider'; //importa o contexto BLE
import FontProvider from '@/components/providers/FontProvider';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import Toast from "react-native-toast-message"; //  ADICIONADO PARA OS ALERTAS

  async function buscarUltimoAlerta(id_dispositivo: number, token: string) {
    const resp = await fetch(
      `http://10.98.97.162:3000/app/mivick/iot/ultimo-alerta/${id_dispositivo}`,
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

          // SE O ALERTA TIVER ATÉ 15 SEGUNDOS, EXIBE O TOAST
        if (diff <= 15) {
  Toast.show({
    type: 'error',
    text1: '⚠️ Alerta detectado!',
    text2: 'O dispositivo enviou um alerta recente.',
  });

  // ENVIA ALERTA PARA O BACKEND -> TWILIO
  try {
    await fetch("http://10.98.97.162:3000/app/mivick/alerta/enviar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        id_dispositivo: Number(id),
        descricao: "Alerta detectado automaticamente",
        codigo: "AUTOMATIC"
      })

    });
  } catch (err) {
    console.log("Erro ao notificar backend:", err);
  }
}

        }, 5000);
      }

      iniciarMonitoramento();

      return () => {
        clearInterval(interval);
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
              },
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

            {/* Rotas ocultas da tab bar */}
            <Tabs.Screen
              name="ConectarDispositivo"
              options={{
                href: null,
              }}
            />

            <Tabs.Screen
              name="HistoricoAlerta"
              options={{
                href: null,
              }}
            />
          </Tabs>

          {/* Componente global do Toast */}
          <Toast />
        </FontProvider>
      </BleProvider>
    );
  }
