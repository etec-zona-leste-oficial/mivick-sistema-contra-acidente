
import { FirstButton } from "@/components/FirstButton";
import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstSubTitle } from "@/components/FirstSubTitle";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import { useBle } from '@/components/providers/BleProvider'; // ⬅️ importa o contexto BLE
import { FontAwesome } from "@expo/vector-icons";
import { Buffer } from "buffer";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Dimensions, Pressable, ScrollView, View } from "react-native";
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHARACTERISTIC_UUID = "abcdefab-1234-1234-1234-abcdefabcdef";

const { width, height } = Dimensions.get("window");

export default function ConfigurarDispositivo() {
  const router = useRouter();
const { manager, devices,  connected, setConnected } = useBle();


async function enviarComando(cmd: string) {
  if (!connected) {
    Alert.alert("Aviso", "Nenhum dispositivo BLE conectado.");
    return;
  }

  try {
    const arr = Object.values(devices);

    for (const dev of arr) {
      await dev.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        Buffer.from(cmd, "utf-8").toString("base64")
      );
    }

    Alert.alert("Comando enviado a todos", cmd);
  } catch (e) {
    console.log(e);
    Alert.alert("Erro", "Falha ao enviar comando.");
  }
}
async function desconectarTodos() {
  if (!connected) {
    Alert.alert("Aviso", "Nenhum dispositivo BLE conectado.");
    return;
  }

  try {
    const arr = Object.values(devices);

    for (const dev of arr) {
      await dev.cancelConnection();
    }

    setConnected(false); // atualiza estado global

    Alert.alert("Desconectado", "Todos os dispositivos foram desconectados.");
  } catch (e) {
    console.log(e);
    Alert.alert("Erro", "Falha ao desconectar.");
  }
}

console.log("Devices conectados:", devices);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: height * 0.1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header --- */}
        <HeaderComLogin />

        {/* --- Título --- */}
        <FirstTitle
          text={"Configurações do \ndispositivo"}
          fontSize={Math.min(width * 0.08, 32)}
          style={{
            marginBottom: height * 0.015,
            marginTop: height * 0.025,
            paddingHorizontal: width * 0.06,
          }}
        />

        {/* --- Linha --- */}
        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "106%",
            alignSelf: "center",
            marginTop: height * 0.015,
            marginBottom: -height * 0.025,
          }}
        />

        {/* --- Status do dispositivo --- */}
        <FirstCard
          customStyle={{
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: width * 0.06,
            paddingVertical: height * 0.02,
            borderRadius: 0,
            elevation: 0,
            shadowOpacity: 0,
            marginTop: height * 0.025,
            marginBottom: height * 0.02,
            justifyContent: "center",

          }}
        >
          {/* Título do Card */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: height * 0.012,
            }}
          >
            <FontAwesome
              name="wifi"
              size={Math.min(width * 0.06, 24)}
              color="#F85200"
              style={{ marginRight: width * 0.02 }}
            />
            <FirstTitle
              text="Status do dispositivo:"
              fontSize={Math.min(width * 0.06, 25)}
            />
          </View>

          {/* Nível de bateria */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: height * 0.008,
              paddingHorizontal: width * 0.05,
            }}
          >
            <FirstTitle text="Nível de bateria: " fontSize={Math.min(width * 0.045, 18)} />
            <FirstSubTitle
              text="100%"
              style={{
                fontSize: Math.min(width * 0.04, 16),
                color: "#D9D9D9",
              }}
            />
          </View>

          {/* Dispositivo */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: height * 0.008,
              paddingHorizontal: width * 0.05,
            }}
          >
            <FirstTitle text="Dispositivo: " fontSize={Math.min(width * 0.045, 18)} />
            <FirstSubTitle
              text="Ligado"
              style={{
                fontSize: Math.min(width * 0.04, 16),
                color: "#D9D9D9",
              }}
            />
          </View>

          {/* Sensores */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: width * 0.05,
            }}
          >
            <FirstTitle text="Sensores: " fontSize={Math.min(width * 0.045, 18)} />
            <FirstSubTitle
              text="Conectados"
              style={{
                fontSize: Math.min(width * 0.04, 16),
                color: "#D9D9D9",
              }}
            />
            
          </View>
          {connected && (
  <View style={{ alignItems: "center", marginTop: 20 }}>
    <FirstButton
      title="Ligar Sensores"
      onPress={() => enviarComando("ON")}
      customStyle={{ marginVertical: 10, width: "85%" }}
    />

    <FirstButton
      title="Desligar Sensores"
      onPress={() => enviarComando("OFF")}
      customStyle={{ marginVertical: 10, width: "85%" }}
    />

    <FirstButton
      title="Desconectar"
      onPress={desconectarTodos}
      customStyle={{ marginVertical: 10, width: "85%" }}
    />
  </View>
)}


        </FirstCard>

         {/* --- Linha --- */}
        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "90%",
            alignSelf: "center",
            marginVertical: height * 0.00,
            marginBottom: height * 0.06,
          }}
        />
          
          {/* --- BOTÕES --- */}
        

        {/* --- Linha --- */}
        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "90%",
            alignSelf: "center",
            marginVertical: height * 0.00,
            marginBottom: height * 0.06,
          }}
        />

        {/* --- Histórico --- */}
        <FirstTitle
          text="Histórico:"
          fontSize={Math.min(width * 0.085, 34)}
          style={{ paddingHorizontal: width * 0.05 }}
        />

        {/* --- Card 1 --- */}
        <Pressable onPress={() => router.push("/HistoricoAlerta")}>
          <FirstCard
            customStyle={{
              borderRadius: 0,
              marginTop: height * 0.015,
              padding: width * 0.04,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: width * 0.04,
              }}
            >
              {/* Ícone */}
              <View
                style={{
                  width: width * 0.16,
                  height: width * 0.16,
                  borderRadius: width * 0.08,
                  borderWidth: 2,
                  borderColor: "#F85200",
                  backgroundColor: "#F85200",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome
                  name="bluetooth"
                  size={Math.min(width * 0.1, 37)}
                  color="#2D2D2D"
                />
              </View>

              {/* Texto */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <FirstTitle
                    text="Alerta de sensor de distância"
                    fontSize={Math.min(width * 0.05, 20)}
                  />
                  <FirstSubTitle
                    text="16/06"
                    style={{
                      fontSize: Math.min(width * 0.035, 14),
                      color: "#D9D9D9",
                    }}
                  />
                </View>

                <FirstSubTitle
                  text={"Alerta de distância registrado, clique para \nmais informações"}
                  style={{
                    marginTop: height * 0.005,
                    fontSize: Math.min(width * 0.035, 14),
                    lineHeight: Math.min(width * 0.045, 18),
                    color: "#D9D9D9",
                  }}
                />
              </View>
            </View>
          </FirstCard>
        </Pressable>

        {/* --- Card 2 --- */}
        <Pressable onPress={() => router.push("/HistoricoAlerta")}>
          <FirstCard
            customStyle={{
              borderRadius: 0,
              marginTop: height * 0.015,
              padding: width * 0.04,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: width * 0.04,
              }}
            >
              {/* Ícone */}
              <View
                style={{
                  width: width * 0.16,
                  height: width * 0.16,
                  borderRadius: width * 0.08,
                  borderWidth: 2,
                  borderColor: "#F85200",
                  backgroundColor: "#F85200",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome
                  name="warning"
                  size={Math.min(width * 0.1, 37)}
                  color="#2D2D2D"
                />
              </View>

              {/* Texto */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <FirstTitle
                    text="Alerta de possível acidente"
                    fontSize={Math.min(width * 0.05, 20)}
                  />
                  <FirstSubTitle
                    text="16/06"
                    style={{
                      fontSize: Math.min(width * 0.035, 14),
                      color: "#D9D9D9",
                    }}
                  />
                </View>

                <FirstSubTitle
                  text={"Alerta de um possível acidente registrado, \nclique para mais informações"}
                  style={{
                    marginTop: height * 0.005,
                    fontSize: Math.min(width * 0.035, 14),
                    lineHeight: Math.min(width * 0.045, 18),
                    color: "#D9D9D9",
                  }}
                />
              </View>
            </View>
          </FirstCard>
        </Pressable>
      </ScrollView>
    </View>
  );
}
