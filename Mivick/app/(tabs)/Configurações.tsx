import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstSubTitle } from "@/components/FirstSubTitle";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, ScrollView, View, Pressable } from "react-native";

const { height } = Dimensions.get("window");

export default function ConfigurarDispositivo() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: height * 0.05 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header --- */}
        <HeaderComLogin />

        {/* --- Titulo --- */}
        <FirstTitle
          text={"Configurações do \ndispositivo"}
          fontSize={32}
          style={{
            marginBottom: 12,
            marginTop: 20,
            paddingHorizontal: 25,
          }}
        />

        {/* --- Linha --- */}
        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "106%",
            alignSelf: "center",
            marginVertical: 12,
            marginBottom: -20,
          }}
        />

        {/* --- Status do dispositivo --- */}
        <FirstCard
          customStyle={{
            width: "100%",
            height: height * 0.22,
            alignSelf: "center",
            paddingHorizontal: 25,
            marginTop: 20,
            borderRadius: 0,
            elevation: 0,
            shadowOpacity: 0,
            marginBottom: 15,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <FontAwesome
              name="wifi"
              size={22}
              color="#FF4500"
              style={{ marginRight: 8 }}
            />
            <FirstTitle text="Status do dispositivo:" fontSize={25} />
          </View>

          {/* Nível de bateria */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, paddingHorizontal: 20 }}>
            <FirstTitle text="Nível de bateria: " fontSize={18} />
            <FirstSubTitle text="100%" />
          </View>

          {/* Dispositivo */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, paddingHorizontal: 20 }}>
            <FirstTitle text="Dispositivo: " fontSize={18} />
            <FirstSubTitle text="Ligado" />
          </View>

          {/* Sensores */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20 }}>
            <FirstTitle text="Sensores: " fontSize={18} />
            <FirstSubTitle text="Conectados" />
          </View>
        </FirstCard>

        {/* --- Linha --- */}
        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "90%",
            alignSelf: "center",
            marginVertical: 12,
            marginBottom: 50,
          }}
        />

        {/* --- Histórico --- */}
        <FirstTitle text="Histórico:" fontSize={34} style={{ paddingHorizontal: 20 }} />

        {/* --- Card 1 --- */}
        <Pressable
          onPress={() => router.push('/HistoricoAlerta')} // <-- Escolha o caminho da tela aqui
        >
          <FirstCard customStyle={{ borderRadius: 0, marginTop: 10, padding: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 35,
                  borderWidth: 2,
                  borderColor: '#F85200',
                  backgroundColor: '#F85200',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FontAwesome name="bluetooth" size={37} color="#2D2D2D" />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FirstTitle text="Alerta de sensor de distância" fontSize={20} />
                  <FirstSubTitle text="16/06" />
                </View>
                <FirstSubTitle text={"Alerta de distância registrado, clique para \nmais informações"} style={{ marginTop: 3 }} />
              </View>
            </View>
          </FirstCard>
        </Pressable>

        {/* --- Card 2 --- */}
        <Pressable
          onPress={() => router.push('/HistoricoAlerta')} // <-- Escolha o caminho da tela aqui
        >
          <FirstCard customStyle={{ borderRadius: 0, marginTop: 10, padding: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 35,
                  borderWidth: 2,
                  borderColor: '#F85200',
                  backgroundColor: '#F85200',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FontAwesome name="warning" size={37} color="#2D2D2D" />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FirstTitle text="Alerta de possível acidente" fontSize={20} />
                  <FirstSubTitle text="16/06" />
                </View>
                <FirstSubTitle text={"Alerta de um possível acidente registrado, \nclique para mais informações"} style={{ marginTop: 3 }} />
              </View>
            </View>
          </FirstCard>
        </Pressable>

      </ScrollView>
    </View>
  );
}
