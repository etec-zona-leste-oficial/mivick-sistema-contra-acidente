// =============================================================
// IMPORTS
// =============================================================
import { FirstButton } from "@/components/FirstButton";
import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstSubTitle } from "@/components/FirstSubTitle";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import { StyleSheet } from "react-native";
import { FirstModal } from "@/components/FirstModal";
import { useBle } from "@/components/providers/BleProvider";

import { FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Buffer } from "buffer";

import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  View,
  TouchableOpacity,
  Modal,
  Text,
  TextInput,
} from "react-native";


import { Device } from "react-native-ble-plx";

// BLE UUIDs
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHARACTERISTIC_UUID = "abcdefab-1234-1234-1234-abcdefabcdef";

// Dimensões
const { width, height } = Dimensions.get("window");

// =============================================================
// COMPONENTE PRINCIPAL
// =============================================================
export default function ConectarDispositivo() {
  const router = useRouter();

  const { manager, devices, addDevice, removeDevice, connected, setConnected } =
    useBle();

  const [esp1Device, setEsp1Device] = useState<Device | null>(null);
  const [sensoresLigados, setSensoresLigados] = useState(false);

  const [ssidModalVisible, setSsidModalVisible] = useState(false);
  const [inputSsid, setInputSsid] = useState("");
  const [inputPass, setInputPass] = useState("");

  const [deviceId, setDeviceId] = useState<number | null>(null);
  const [wifiSalvo, setWifiSalvo] = useState<
    { ssid: string; senha: string }[]
  >([]);

  const [logs, setLogs] = useState<string[]>([]);

  function addLog(msg: string) {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  }

  useEffect(() => {
    async function loadDeviceId() {
      const id = await AsyncStorage.getItem("device_id");
      if (id) setDeviceId(Number(id));
    }
    loadDeviceId();
  }, []);

  // =============================================================
  // ENVIAR COMMANDO GENÉRICO A TODOS OS DISPOSITIVOS
  // =============================================================
  async function enviarComando(cmd: string) {
    if (!connected) {
      Toast.show({
        type: "info",
        text1: "Nenhum dispositivo BLE conectado!",
      });
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

      Toast.show({ type: "success", text1: "Comando enviado!", text2: cmd });
    } catch (e) {
      console.log(e);
      Toast.show({
        type: "error",
        text1: "Erro ao enviar comando",
      });
    }
  }

  async function toggleSensores() {
    const cmd = sensoresLigados ? "OFF" : "ON";
    await enviarComando(cmd);
    setSensoresLigados(!sensoresLigados);
  }

  // =============================================================
  // BACKEND
  // =============================================================
  async function enviarParaBackend(body: any) {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!body.id_dispositivo) {
        console.warn("Tentou enviar sem ID");
        return;
      }

      const response = await fetch(
        "http://10.135.37.203:3000/app/mivick/iot/leituras",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      console.log("Backend:", await response.json());
    } catch (error) {
      console.log("Erro ao enviar:", error);
    }
  }

 

  // =============================================================
  // DESCONECTAR TODOS
  // =============================================================
  async function desconectarTodos() {
    if (!connected) {
      Toast.show({ type: "info", text1: "Nenhum dispositivo conectado." });
      return;
    }

    try {
      const arr = Object.values(devices);

      for (const dev of arr) await dev.cancelConnection();

      setConnected(false);

      Toast.show({
        type: "success",
        text1: "Todos foram desconectados.",
      });
    } catch (e) {
      console.log(e);
      Toast.show({
        type: "error",
        text1: "Erro ao desconectar",
      });
    }
  }

  // =============================================================
  // UI
  // =============================================================
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: height * 0.1 }}
        showsVerticalScrollIndicator={false}
      >
        <HeaderComLogin />

        <FirstTitle
          text={"Configurações do \ndispositivo"}
          fontSize={Math.min(width * 0.08, 32)}
          style={{
            marginBottom: height * 0.015,
            marginTop: height * 0.025,
            paddingHorizontal: width * 0.06,
          }}
        />

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

        {/* CARD ESTATUS */}
        <FirstCard
          customStyle={{
            paddingHorizontal: width * 0.06,
            paddingVertical: height * 0.02,
            marginTop: height * 0.025,
            marginBottom: height * 0.02,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <FontAwesome name="wifi" size={28} color="#F85200" />
            <FirstTitle text=" Status do dispositivo" fontSize={24} />
          </View>

          <View style={{ flexDirection: "row", paddingHorizontal: 20 }}>
            <FirstTitle text="Nível de bateria: " fontSize={18} />
            <FirstSubTitle text="100%" style={{ color: "#D9D9D9" }} />
          </View>

          <View style={{ flexDirection: "row", paddingHorizontal: 20 }}>
            <FirstTitle text="Dispositivo: " fontSize={18} />
            <FirstSubTitle text="Ligado" style={{ color: "#D9D9D9" }} />
          </View>

          <View style={{ flexDirection: "row", paddingHorizontal: 20 }}>
            <FirstTitle text="Sensores: " fontSize={18} />
            <FirstSubTitle text="Conectados" style={{ color: "#D9D9D9" }} />
          </View>
        </FirstCard>

        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "90%",
            alignSelf: "center",
            marginBottom: height * 0.05,
          }}
        />

        {/* BOTÕES PRINCIPAIS */}
        {connected && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
              marginBottom: 20,
            }}
          >
            {/* BOTÃO 1 */}
            <TouchableOpacity onPress={toggleSensores}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  borderWidth: 3,
                  borderColor: "#F85200",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome
                  name={sensoresLigados ? "power-off" : "play"}
                  size={40}
                  color="#F85200"
                />
              </View>
              <FirstSubTitle
                text={
                  sensoresLigados ? "Desligar Sensores" : "Ligar Sensores"
                }
                style={{
                  textAlign: "center",
                  marginTop: 5,
                  color: "#D9D9D9",
                }}
              />
            </TouchableOpacity>

            {/* BOTÃO 2 */}
            <TouchableOpacity onPress={desconectarTodos}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  borderWidth: 3,
                  borderColor: "#F85200",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome name="rss" size={40} color="#F85200" />
              </View>
              <FirstSubTitle
                text="Desconectar"
                style={{
                  textAlign: "center",
                  marginTop: 5,
                  color: "#D9D9D9",
                }}
              />
            </TouchableOpacity>
</View>  
)}

   
        <FirstTitle
          text="Histórico:"
          fontSize={32}
          style={{ paddingHorizontal: width * 0.05 }}
        />

        {/* HISTÓRICO */}
        <Pressable onPress={() => router.push("/HistoricoAlerta")}>
          <FirstCard customStyle={{ marginTop: 20, padding: 15 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  borderWidth: 2,
                  borderColor: "#F85200",
                  backgroundColor: "#F85200",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome
                  name="bluetooth"
                  size={35}
                  color="#2D2D2D"
                />
              </View>

              <View style={{ marginLeft: 15 }}>
                <FirstTitle
                  text="Alerta de sensor de distância"
                  fontSize={20}
                />
                <FirstSubTitle
                  text="16/06"
                  style={{ color: "#D9D9D9", marginTop: 2 }}
                />
                <FirstSubTitle
                  text="Clique para mais informações"
                  style={{ color: "#D9D9D9", marginTop: 5 }}
                />
              </View>
            </View>
          </FirstCard>
        </Pressable>
    
      </ScrollView>
    </View>
  );
}
