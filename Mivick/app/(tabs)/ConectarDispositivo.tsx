// screens/ConectarDispositivo.tsx
import { FirstButton } from "@/components/FirstButton";
import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstModal } from "@/components/FirstModal";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import { useRouter } from "expo-router";
import { useBle } from '@/components/providers/BleProvider'; // ⬅️ importa o contexto BLE
import { Buffer } from "buffer";
import React, { useState } from "react";
import { Alert, Dimensions, Image, PermissionsAndroid, Platform, ScrollView, Text, View } from "react-native";
import { Device } from "react-native-ble-plx"; // ✅ adicione esta linha
const { height } = Dimensions.get("window");

const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHARACTERISTIC_UUID = "abcdefab-1234-1234-1234-abcdefabcdef";
const DEVICE_NAME = "ESP32-CAM-BLE";
//const ESP32_WS_IP = "ws://192.168.1.10:80/ws"; // IP do ESP32

global.Buffer = global.Buffer || Buffer;

export default function ConectarDispositivo() {
  // ========== FRONT ==========
  const [modalVisible, setModalVisible] = useState(false);

  // ========== BLE e WebSocket ==========
 const { manager, device, setDevice, connected, setConnected } = useBle();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Função de log
  function addLog(msg: string) {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  }

  // ===================== BLE =====================
  async function requestBlePermissions() {
  if (Platform.OS === "android") {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(
        (res) => res === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
}
async function startScan() {
  if (!manager) {
    addLog("⚠️ BLE Manager ainda não inicializado");
    Alert.alert("Aguarde", "Inicializando o Bluetooth...");
    return;
  }

  addLog("🔍 Iniciando varredura BLE...");
  manager.startDeviceScan(null, null, (error, scannedDevice) => {
    if (error) {
      addLog("❌ Erro no scan: " + error.message);
      return;
    }
    if (scannedDevice?.name === DEVICE_NAME) {
      addLog("📡 Encontrado: " + scannedDevice.name);
      manager?.stopDeviceScan();
      connectToDevice(scannedDevice);
    }
  });
}
// Enviar credenciais Wi-Fi
async function enviarWifi(ssid: string, senha: string) {
  if (!device || !connected) return;
  try {
    const msg = `WIFI|${ssid}|${senha}`;
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      Buffer.from(msg, "utf-8").toString("base64")
    );
    addLog("📶 Enviando credenciais Wi-Fi...");
  } catch (e) {
    console.error("❌ Erro ao enviar Wi-Fi:", e);
  }
}


  // Dentro da função connectToDevice()
async function connectToDevice(dev: Device) {
  try {
    const connectedDevice = await dev.connect();
    await connectedDevice.discoverAllServicesAndCharacteristics();
    setDevice(connectedDevice);
    setConnected(true);
    addLog("✅ Conectado a " + connectedDevice.name);
// Escuta notificações BLE
connectedDevice.monitorCharacteristicForService(
  SERVICE_UUID,
  CHARACTERISTIC_UUID,
  (error, characteristic) => {
    if (error) {
      addLog("❌ Erro ao monitorar BLE: " + error.message);
      return;
    }

    const valor = Buffer.from(characteristic?.value ?? "", "base64").toString("utf-8");
    addLog("📩 Recebido: " + valor);

    // Se o ESP32 responder com IP
    if (valor.startsWith("WIFI_OK|")) {
      const ip = valor.split("|")[1];
      addLog("🌐 Wi-Fi conectado. IP: " + ip);
      conectarWebSocket(ip);
    } else if (valor.startsWith("WIFI_FAIL")) {
      Alert.alert("Erro", "Falha ao conectar o ESP32 ao Wi-Fi");
    }
  }
);
    // Envia comando BLE para ESP32 conectar ao Wi-Fi
    // Após conectar BLE, solicitar SSID/Senha ao usuário
Alert.prompt(
  "Conectar ao Wi-Fi",
  "Digite o nome (SSID) e a senha da sua rede",
  [
    {
      text: "Cancelar",
      style: "cancel"
    },
    {
      text: "Enviar",
     onPress: async (entrada) => {
  if (!entrada) {
    Alert.alert("Aviso", "Você precisa digitar o nome e a senha da rede Wi-Fi.");
    return;
  }

  try {
    const [ssid, senha] = entrada.split(" ");
    if (!ssid || !senha) {
      Alert.alert("Formato inválido", "Digite: NOME_SSID SENHA_WIFI");
      return;
    }

    await enviarWifi(ssid, senha);
    addLog(`📶 Enviando credenciais: ${ssid}`);
  } catch (err) {
    console.error("Erro ao enviar Wi-Fi:", err);
    Alert.alert("Erro", "Falha ao processar as credenciais Wi-Fi.");
  }
}
    }
  ],
  "plain-text"
);
  } catch (e) {
    console.error("❌ Erro ao conectar BLE:", e);
    Alert.alert("Erro", "Falha ao conectar ao dispositivo BLE.");
  }
}

  async function enviarComando(cmd: string) {
    if (!device || !connected) return;
    try {
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        Buffer.from(cmd, "utf-8").toString("base64")
      );
      addLog("📤 Comando enviado: " + cmd);
    } catch (e) {
      console.error("❌ Erro ao enviar comando:", e);
      Alert.alert("Erro", "Falha ao enviar comando.");
    }
  }

  // ===================== WebSocket =====================
  function conectarWebSocket(ip: string) {
  const socket = new WebSocket(`ws://${ip}/ws`);

  socket.onopen = () => addLog("🌐 WebSocket conectado!");
  socket.onmessage = (event) => {
    addLog("📨 WS: " + event.data);
    // Se vier imagem Base64
    if (event.data.startsWith("/9j/")) {
      setImages((prev) => [...prev, `data:image/jpeg;base64,${event.data}`]);
    }
  };
  socket.onerror = (err) => addLog("❌ Erro WS: " + JSON.stringify(err));
  socket.onclose = () => addLog("⚠️ WS desconectado");

  setWs(socket);
}

  // ===================== FUNÇÕES DE INTERFACE =====================
const openModal = async () => {
  const ok = await requestBlePermissions();
  if (!ok) {
    Alert.alert("Permissão negada", "Ative o Bluetooth e a localização para continuar.");
    return;
  }
  setModalVisible(true);
  
  setTimeout(() => startScan(), 800);
};

  const closeModal = () => setModalVisible(false);

  // ===================== INTERFACE =====================
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView>
        <HeaderComLogin />

        <FirstTitle
          text="Como conectar?"
          fontSize={40}
          style={{ marginBottom: 9, marginTop: 20, alignSelf: "center" }}
        />

        <View
          style={{
            height: 1,
            backgroundColor: "#F85200",
            width: "106%",
            alignSelf: "center",
            marginVertical: 12,
            marginBottom: 50,
          }}
        />

        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <Image
            source={require("@/assets/images/pareamento.png")}
            style={{
              width: 179,
              height: 179,
              resizeMode: "contain",
            }}
          />
        </View>

        <FirstCard
          customStyle={{
            width: "100%",
            height: height * 0.18,
            alignSelf: "center",
            paddingHorizontal: 16,
            marginTop: -2,
            alignItems: "center",
            borderRadius: 0,
            elevation: 0,
            shadowOpacity: 0,
          }}
        >
          <FirstTitle
            text={"Primeiramente, ligue \no Bluetooth no seu \ncelular."}
            fontSize={36}
            style={{ alignSelf: "center", textAlign: "center" }}
          />
        </FirstCard>

        <FirstTitle
          text={"Aceite a permissão do app \npara parear o dispositivo"}
          fontSize={30}
          style={{
            marginBottom: 16,
            marginTop: 12,
            alignSelf: "center",
            textAlign: "center",
          }}
        />

        <FirstButton
          title={connected ? "Conectado ✅" : "Parear"}
          onPress={openModal}
          customStyle={{
            marginBottom: 40,
            marginTop: 40,
            width: "85%",
            alignSelf: "center",
          }}
        />
      </ScrollView>

      {/* Modal que mostra logs */}
      <FirstModal visible={modalVisible} onClose={closeModal}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
            {connected
              ? "✅ Dispositivo conectado!"
              : "⏳ Procurando dispositivo..."}
          </Text>

          {logs.slice(-10).map((l, i) => (
            <Text key={i} style={{ color: "#ccc", fontSize: 12 }}>
              {l}
            </Text>
          ))}
        </View>
      </FirstModal>
    </View>
  );
}
