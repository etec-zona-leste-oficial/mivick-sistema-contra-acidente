// screens/ConectarDispositivo.tsx
import { FirstButton } from "@/components/FirstButton";
import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstModal } from "@/components/FirstModal";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBle } from '@/components/providers/BleProvider';
import { Buffer } from "buffer";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Device } from "react-native-ble-plx";

global.Buffer = global.Buffer || Buffer;
const { height } = Dimensions.get("window");

// CONFIG
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHARACTERISTIC_UUID = "abcdefab-1234-1234-1234-abcdefabcdef";
const DEVICE_NAME = "ESP32-CAM-BLE";
const DEVICE_ID = 1; // <-- coloque o ID real quando for dinâmico

// ---------------------- BACKEND PAYLOAD ----------------------
type BackendPayload = {
  id_dispositivo: number;

  // Sensores
  distancia?: number;
  impacto?: number;
  movimentacao?: number | string;
  acidente_identificado?: boolean;

  // Imagem
  foto_base64?: string;

  // Logs
  ble_log?: string;
  ws_log?: string;

  // Wi-Fi enviado
  wifi_ssid?: string;
  wifi_senha?: string;
};

// Envio genérico para backend
async function enviarParaBackend(body: Partial<BackendPayload>) {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch("http://192.168.15.66:3000/app/mivick/leituras", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const resp = await response.json();
    console.log("📡 Backend:", resp);
  } catch (error) {
    console.log("❌ Erro ao enviar para o backend:", error);
  }
}

// =============================================================
// TELA PRINCIPAL
// =============================================================
export default function ConectarDispositivo() {
  const [modalVisible, setModalVisible] = useState(false);
  const { manager, device, setDevice, connected, setConnected } = useBle();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // SSID modal
  const [ssidModalVisible, setSsidModalVisible] = useState(false);
  const [inputSsid, setInputSsid] = useState("");
  const [inputPass, setInputPass] = useState("");

  function addLog(msg: string) {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  }

  // ---------------------- PERMISSÕES ----------------------
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

  // ---------------------- BLUETOOTH SCAN ----------------------
  async function startScan() {
    if (!manager) {
      addLog("⚠️ BLE Manager não inicializado");
      return;
    }
    addLog("🔍 Procurando dispositivo BLE...");
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

  // ---------------------- ENVIAR WI-FI VIA BLE ----------------------
  async function enviarWifi(ssid: string, senha: string) {
    if (!device || !connected) return;
    try {
      const msg = `WIFI|${ssid}|${senha}`;
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        Buffer.from(msg, "utf-8").toString("base64")
      );

      addLog("📶 Wi-Fi enviado via BLE!");

      // salvar no backend
      enviarParaBackend({
        id_dispositivo: DEVICE_ID,
        wifi_ssid: ssid,
        wifi_senha: senha
      });

    } catch (e) {
      console.error("❌ Erro ao enviar Wi-Fi:", e);
      Alert.alert("Erro", "Falha ao enviar credenciais.");
    }
  }

  // ---------------------- CONECTAR AO DISPOSITIVO ----------------------
  async function connectToDevice(dev: Device) {
    try {
      addLog("Conectando ao dispositivo...");
      const connectedDevice = await dev.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      setDevice(connectedDevice);
      setConnected(true);

      addLog("✅ Conectado!");

      // Monitor BLE
      connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            addLog("❌ Erro monitor BLE: " + error.message);
            return;
          }

          const valor = Buffer.from(characteristic?.value ?? "", "base64").toString("utf-8");
          addLog("📩 BLE: " + valor);

          // salvar log
          enviarParaBackend({
            id_dispositivo: DEVICE_ID,
            ble_log: valor
          });

          // Respostas do ESP
          if (valor.startsWith("WIFI_OK|")) {
            const ip = valor.split("|")[1];
            addLog("🌐 Wi-Fi conectado! IP: " + ip);
            conectarWebSocket(ip);
          }

          else if (valor.startsWith("WIFI_FAIL")) {
            Alert.alert("Erro", "Falha ao conectar o ESP ao Wi-Fi.");
          }

          else if (valor.startsWith("VEICULO|")) {
            addLog("🚗 Info do veículo: " + valor);
          }
        }
      );

      setInputSsid("");
      setInputPass("");
      setSsidModalVisible(true);

    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao conectar.");
    }
  }

  // ---------------------- WEBSOCKET ----------------------
  function conectarWebSocket(ip: string) {
    const url = `ws://${ip}/ws`;
    addLog("🔌 Tentando WS em: " + url);

    try {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        addLog("🌐 WebSocket conectado!");
        enviarParaBackend({
          id_dispositivo: DEVICE_ID,
          ws_log: "WS conectado"
        });
      };

      socket.onmessage = (event) => {
        if (typeof event.data !== "string") return;

        // Sensor JSON
        if (event.data.startsWith("{")) {
          const dados = JSON.parse(event.data);

          enviarParaBackend({
            id_dispositivo: DEVICE_ID,
            distancia: dados.distancia,
            impacto: dados.impacto,
            movimentacao: dados.movimentacao,
            acidente_identificado: dados.acidente
          });

          addLog(`📊 Sensores: ${JSON.stringify(dados)}`);
        }

        // Imagem
        else if (event.data.startsWith("/9j/")) {
          setImages((prev) => ["data:image/jpeg;base64," + event.data, ...prev]);

          enviarParaBackend({
            id_dispositivo: DEVICE_ID,
            foto_base64: event.data
          });
        }
      };

      socket.onerror = () => {
        addLog("❌ Erro no WebSocket");
        enviarParaBackend({
          id_dispositivo: DEVICE_ID,
          ws_log: "Erro WS"
        });
      };

      socket.onclose = () => {
        addLog("⚠️ WebSocket fechado");
        enviarParaBackend({
          id_dispositivo: DEVICE_ID,
          ws_log: "WS desconectado"
        });
      };

      setWs(socket);

    } catch (err) {
      addLog("❌ Falha ao abrir WS: " + String(err));
    }
  }

  // ---------------------- UI HANDLERS ----------------------
  function onSendWifiFromModal() {
    if (!inputSsid || !inputPass) {
      Alert.alert("Preencha", "Informe SSID e senha.");
      return;
    }

    setSsidModalVisible(false);
    enviarWifi(inputSsid.trim(), inputPass.trim());
  }

  const openModal = async () => {
    const ok = await requestBlePermissions();
    if (!ok) {
      Alert.alert("Permissão negada", "Ative Bluetooth e localização.");
      return;
    }

    setModalVisible(true);
    setTimeout(() => startScan(), 600);
  };

  const closeModal = () => setModalVisible(false);

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView>
        <HeaderComLogin />

        <FirstTitle text="Como conectar?" fontSize={40} style={{ marginTop: 20, alignSelf: "center" }} />

        <View style={{ height: 1, backgroundColor: "#F85200", width: "106%", alignSelf: "center", marginVertical: 12 }} />

        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Image source={require("@/assets/images/pareamento.png")} style={{ width: 179, height: 179 }} />
        </View>

        <FirstCard customStyle={{ width: "100%", height: height * 0.18, paddingHorizontal: 16, alignItems: "center" }}>
          <FirstTitle text={"Primeiramente, ligue o Bluetooth do celular."} fontSize={36} style={{ textAlign: "center" }} />
        </FirstCard>

        <FirstTitle text={"Aceite a permissão para parear o dispositivo"} fontSize={30} style={{ marginVertical: 20, textAlign: "center" }} />

        <FirstButton
          title={connected ? "Conectado ✅" : "Parear"}
          onPress={openModal}
          customStyle={{ marginBottom: 40, width: "85%", alignSelf: "center" }}
        />
      </ScrollView>

      {/* Modal de pareamento */}
      <FirstModal visible={modalVisible} onClose={closeModal}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
            {connected ? "✅ Dispositivo conectado!" : "⏳ Procurando dispositivo..."}
          </Text>
          {logs.slice(-10).map((l, i) => (
            <Text key={i} style={{ color: "#ccc", fontSize: 12 }}>{l}</Text>
          ))}
        </View>
      </FirstModal>

      {/* Modal Wi-Fi */}
      <Modal visible={ssidModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>Conectar ao Wi-Fi</Text>

            <TextInput placeholder="SSID" placeholderTextColor="#999" value={inputSsid} onChangeText={setInputSsid} style={styles.input} />

            <TextInput placeholder="Senha" placeholderTextColor="#999" value={inputPass} onChangeText={setInputPass} secureTextEntry style={styles.input} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
              <TouchableOpacity onPress={() => setSsidModalVisible(false)} style={styles.buttonSecondary}>
                <Text style={{ color: "#fff" }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onSendWifiFromModal} style={styles.buttonPrimary}>
                <Text style={{ color: "#fff" }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "85%", padding: 16, backgroundColor: "#111", borderRadius: 8 },
  input: { backgroundColor: "#222", color: "#fff", padding: 10, marginTop: 8, borderRadius: 6 },
  buttonPrimary: { backgroundColor: "#F85200", padding: 10, borderRadius: 6, paddingHorizontal: 16 },
  buttonSecondary: { backgroundColor: "#444", padding: 10, borderRadius: 6, paddingHorizontal: 16 },
});
