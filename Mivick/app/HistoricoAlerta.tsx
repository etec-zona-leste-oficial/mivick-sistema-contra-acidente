import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstSubTitle } from "@/components/FirstSubTitle";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import React, { useState, useEffect } from "react";
import { Dimensions, Image, ScrollView, View } from "react-native";
import { useBle } from '@/components/context/BleContext'; // ⬅️ importa o contexto BLE

const { width, height } = Dimensions.get("window");

export default function HistoricoAlerta() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);

useEffect(() => {
  const socket = new WebSocket("ws://192.168.1.10:80/ws");

  socket.onopen = () => console.log("🌐 Conectado ao ESP32 via WebSocket");
  socket.onmessage = (event) => {
    const base64Image = event.data as string;
    setImageBase64(`data:image/jpeg;base64,${base64Image}`);
  };
  socket.onerror = (err) => console.error("❌ Erro WebSocket:", err);
  socket.onclose = () => console.log("⚠️ Conexão encerrada");

  return () => socket.close();
}, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: height * 0.05,
        }}
      >
        <HeaderComLogin />

        {/* Título principal */}
        <FirstTitle
          text="Histórico do alerta"
          fontSize={Math.min(width * 0.08, 32)} 
          style={{
            paddingHorizontal: width * 0.06,
            marginTop: height * 0.03,
            marginBottom: height * 0.025
          }}
        />

        {/* Linha divisória */}
        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "100%",
            alignSelf: "center",
            marginVertical: height * 0.00,
            
          }}
        />

        {/* Imagem */}
       <Image
  source={
    imageBase64
      ? { uri: imageBase64 }
      : require("@/assets/images/terceira.jpg")
  }
  style={{
    width: "100%",
    height: height * 0.25,
    marginBottom: -height * 0.010,
    alignItems: "center",
    justifyContent: "center",
  }}
  resizeMode="cover"
/>


        {/* Card */}
        <FirstCard
          customStyle={{
            width: "100%",
            borderRadius: 0,
            paddingVertical: height * 0.02,
            paddingHorizontal: width * 0.05,
          }}
        >
          {/* Texto acima da imagem */}
          <View
            style={{
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#F85200",
              marginTop: height * 0.01,
              width: width * 0.60, 
              height: height * 0.035, 
              justifyContent: "center",
              alignSelf: "center",
              marginBottom: height * 0.015,
            }}
          >
            <FirstSubTitle
              text="Foto tirada no momento do alerta"
              style={{
                textAlign: "center",
                includeFontPadding: false,
                textAlignVertical: "center",
                fontSize: Math.min(width * 0.035, 15),
                lineHeight: Math.min(width * 0.04, 17),
              }}
            />
          </View>

          {/* Sensor Ativado */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: height * 0.012,
              paddingHorizontal: width * 0.05,
            }}
          >
            <FirstTitle
              text="Sensor Ativado: "
              fontSize={Math.min(width * 0.05, 20)}
            />
            <FirstSubTitle
              text="Sensor de distância"
              style={{
                fontSize: Math.min(width * 0.04, 16),
                color: "#D9D9D9",
              }}
            />
          </View>

          {/* Data */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: height * 0.012,
              paddingHorizontal: width * 0.05,
            }}
          >
            <FirstTitle text="Data: " fontSize={Math.min(width * 0.05, 20)} />
            <FirstSubTitle
              text="16/06/2025"
              style={{
                fontSize: Math.min(width * 0.04, 16),
                color: "#D9D9D9",
              }}
            />
          </View>

          {/* Situação */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: height * 0.012,
              paddingHorizontal: width * 0.05,
            }}
          >
            <FirstTitle text="Situação: " fontSize={Math.min(width * 0.05, 20)} />
            <FirstSubTitle
              text="Alerta desligado"
              style={{
                fontSize: Math.min(width * 0.04, 16),
                color: "#D9D9D9",
              }}
            />
          </View>
        </FirstCard>

        {/* Linha final */}
        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "85%",
            alignSelf: "center",
            marginTop: -height * 0.015, 

            
          }}
        />
      </ScrollView>
    </View>
  );
}
