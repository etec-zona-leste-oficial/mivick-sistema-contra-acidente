// =============================================================
// Imports dos componentes reutilizáveis da aplicação
// =============================================================
import { FirstButton } from "@/components/FirstButton";
import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstSubTitle } from "@/components/FirstSubTitle";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";

// Contexto BLE criado no app, permitindo acessar dispositivos, conexão etc.
import { useBle } from '@/components/providers/BleProvider';

// Biblioteca de ícones
import { FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";


// Usado para converter strings em base64 antes de enviar via BLE
import { Buffer } from "buffer";

// Navegação do Expo Router
import { useRouter } from "expo-router";

import React from "react";
import { Alert, Dimensions, Pressable, ScrollView, View, TouchableOpacity } from "react-native";

// UUIDs do serviço BLE e característica utilizada para envio de comandos
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHARACTERISTIC_UUID = "abcdefab-1234-1234-1234-abcdefabcdef";

// Dimensões da tela
const { width, height } = Dimensions.get("window");

// =============================================================
// Tela principal de configuração do dispositivo
// =============================================================
export default function ConfigurarDispositivo() {

  const router = useRouter();

  // Manager BLE + lista de dispositivos + estado de conexão
  const { manager, devices, connected, setConnected } = useBle();

  // -------------------------------------------------------------
  // Função para enviar comandos para todos os dispositivos conectados
  // -------------------------------------------------------------
  async function enviarComando(cmd: string) {
    if (!connected) {
      Toast.show({
        type: 'info',
        text1: 'Nenhum dispositivo BLE conectado!'
      })
      return;
    }

    try {
      // Pega a lista de dispositivos conectados
      const arr = Object.values(devices);

      // Envia o comando codificado em base64 para cada dispositivo
      for (const dev of arr) {
        await dev.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          Buffer.from(cmd, "utf-8").toString("base64")
        );
      }

      Toast.show({
        type: 'success',
        text1: 'Comando enviado a todos',
        text2: cmd
      });

    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao enviar comando.'
      });
    }
  }

  // -------------------------------------------------------------
  // Função para desconectar todos os dispositivos BLE
  // -------------------------------------------------------------
  async function desconectarTodos() {
    if (!connected) {
      Toast.show({
        type: 'info',
        text1: 'Nenhum dispositivo BLE conectado.'
      });
      return;
    }

    try {
      const arr = Object.values(devices);

      for (const dev of arr) {
        await dev.cancelConnection();
      }

      // Atualiza estado global de conexão
      setConnected(false);

      Toast.show({
        type: 'success',
        text1: 'Todos os dispositivos foram desconectados.'
      });

    } catch (e) {
      console.log(e);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao desconectar.'
      });
    }
  }

  console.log("Devices conectados:", devices);

  // =============================================================
  // Interface da tela
  // =============================================================
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: height * 0.1 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Header com login */}
        <HeaderComLogin />

        {/* Título da página */}
        <FirstTitle
          text={"Configurações do \ndispositivo"}
          fontSize={Math.min(width * 0.08, 32)}
          style={{
            marginBottom: height * 0.015,
            marginTop: height * 0.025,
            paddingHorizontal: width * 0.06,
          }}
        />

        {/* Linha de divisão */}
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

        {/* Card com status do dispositivo */}
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

          {/* Cabeçalho do card */}
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

          {/* Status do dispositivo */}
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

          {/* Botões de ação só aparecem quando há conexão BLE */}
          {connected && (
            <View style={{ alignItems: "center", marginTop: 20 }}>

              {/* Ligar sensores */}
              <FirstButton
                title="Ligar Sensores"
                onPress={() => enviarComando("ON")}
                customStyle={{ marginVertical: 10, width: "85%" }}
              />

              {/* Desligar sensores */}
              <FirstButton
                title="Desligar Sensores"
                onPress={() => enviarComando("OFF")}
                customStyle={{ marginVertical: 10, width: "85%" }}
              />

              {/* Desconectar BLE */}
              <FirstButton
                title="Desconectar"
                onPress={desconectarTodos}
                customStyle={{ marginVertical: 10, width: "85%" }}
              />
            </View>
          )}

        </FirstCard>

        {/* Linha divisória */}
        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "90%",
            alignSelf: "center",
            marginVertical: height * 0.00,
            marginBottom: height * 0.05,
          }}
        />

        {/* Botões principais de ações rápidas */}
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginBottom: height * 0.02,
          }}
        >

          {connected && (
            <>
              {/* Botão desligar dispositivo */}
              <TouchableOpacity
                onPress={() => enviarComando("ON")}
                style={{ alignItems: "center" }}
              >
                <View
                  style={{
                    width: width * 0.22,
                    height: width * 0.22,
                    borderRadius: (width * 0.22) / 2,
                    borderWidth: 3,
                    borderColor: "#F85200",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome
                    name="power-off"
                    size={Math.min(width * 0.12, 40)}
                    color="#F85200"
                  />
                </View>

                <FirstSubTitle
                  text="Ligar sensores"
                  style={{
                    textAlign: "center",
                    marginTop: 5,
                    fontSize: Math.min(width * 0.035, 14),
                    color: "#D9D9D9",
                  }}
                />
              </TouchableOpacity>

              {/* Botão desligar sensores */}
              <TouchableOpacity
                onPress={desconectarTodos}
                style={{ alignItems: "center" }}
              >
                <View
                  style={{
                    width: width * 0.22,
                    height: width * 0.22,
                    borderRadius: (width * 0.22) / 2,
                    borderWidth: 3,
                    borderColor: "#F85200",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome
                    name="rss"
                    size={Math.min(width * 0.12, 40)}
                    color="#F85200"
                  />
                </View>

                <FirstSubTitle
                  text="Desligar Sensores"
                  style={{
                    textAlign: "center",
                    marginTop: 5,
                    fontSize: Math.min(width * 0.040, 14),
                    color: "#D9D9D9",
                  }}
                />
              </TouchableOpacity>

              {/* Botão conectar WiFi */}
              <TouchableOpacity
                onPress={() => enviarComando("WIFI")}
                style={{ alignItems: "center" }}
              >
                <View
                  style={{
                    width: width * 0.22,
                    height: width * 0.22,
                    borderRadius: (width * 0.22) / 2,
                    borderWidth: 3,
                    borderColor: "#F85200",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome
                    name="wifi"
                    size={Math.min(width * 0.12, 40)}
                    color="#F85200"
                  />
                </View>

                <FirstSubTitle
                  text="Desconectar"
                  style={{
                    textAlign: "center",
                    marginTop: 5,
                    fontSize: Math.min(width * 0.035, 14),
                    color: "#D9D9D9",
                  }}
                />
              </TouchableOpacity>
            </>
          )}


        </View>

        {/* Linha divisória */}
        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "90%",
            alignSelf: "center",
            marginVertical: height * 0.00,
            marginBottom: height * 0.04,
          }}
        />

        {/* Título da seção de histórico */}
        <FirstTitle
          text="Histórico:"
          fontSize={Math.min(width * 0.085, 34)}
          style={{ paddingHorizontal: width * 0.05 }}
        />

        {/* Card de histórico — alerta de distância */}
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

              {/* Ícone do card */}
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

              {/* Textos do card */}
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

        {/* Card de histórico — possível acidente */}
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

              {/* Ícone do card */}
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

              {/* Textos */}
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
