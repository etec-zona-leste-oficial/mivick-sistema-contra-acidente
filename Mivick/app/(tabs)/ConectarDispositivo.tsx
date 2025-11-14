// screens/ConectarDispositivo.tsx
import { FirstButton } from "@/components/FirstButton";
import { FirstCard } from "@/components/FirstCard/FirstCard";
import { FirstModal } from "@/components/FirstModal";
import { FirstTitle } from "@/components/FirstTitle";
import { HeaderComLogin } from "@/components/HeaderComLogin";
import { useRouter } from "expo-router";
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

const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const CHARACTERISTIC_UUID = "abcdefab-1234-1234-1234-abcdefabcdef";
const DEVICE_NAME = "ESP32-CAM-BLE";

export default function ConectarDispositivo() {
  const [modalVisible, setModalVisible] = useState(false);
  const { manager, device, setDevice, connected, setConnected } = useBle();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // modal para SSID/senha (substitui Alert.prompt)
  const [ssidModalVisible, setSsidModalVisible] = useState(false);
  const [inputSsid, setInputSsid] = useState("");
  const [inputPass, setInputPass] = useState("");

  function addLog(msg: string) {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  }

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
      addLog("⚠️ BLE Manager não inicializado");
      Alert.alert("Aguarde", "Inicializando o Bluetooth...");
      return;
    }
    addLog("🔍 Iniciando scan BLE...");
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
      Alert.alert("Erro", "Falha ao enviar credenciais via BLE.");
    }
  }

  async function connectToDevice(dev: Device) {
    try {
      addLog("Conectando ao dispositivo...");
      const connectedDevice = await dev.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setDevice(connectedDevice);
      setConnected(true);
      addLog("✅ Conectado a " + (connectedDevice.name || connectedDevice.id));

      // registrar monitor antes de pedir credenciais
      connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            addLog("❌ Erro monitor BLE: " + error.message);
            return;
          }
          const valor = Buffer.from(characteristic?.value ?? "", "base64").toString("utf-8");
          addLog("📩 Recebido: " + valor);

          if (valor.startsWith("WIFI_OK|")) {
            const ip = valor.split("|")[1];
            addLog("🌐 Wi-Fi conectado. IP: " + ip);
            conectarWebSocket(ip);
          } else if (valor.startsWith("WIFI_FAIL")) {
            Alert.alert("Erro", "Falha ao conectar o ESP32 ao Wi-Fi");
          } else if (valor.startsWith("VEICULO|")) {
            addLog("🚗 VEICULO: " + valor);
            // opcional: tratar mensagem do veículo na UI
          }
        }
      );

      // Agora abrir modal para inserir SSID/senha (no Android/iOS)
      setInputSsid("");
      setInputPass("");
      setSsidModalVisible(true);

    } catch (e) {
      console.error("❌ Erro ao conectar BLE:", e);
      Alert.alert("Erro", "Falha ao conectar ao dispositivo BLE.");
    }
  }

  async function enviarComando(cmd: string) {
    if (!device || !connected) {
      Alert.alert("Erro", "Dispositivo não conectado");
      return;
    }
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

  function conectarWebSocket(ip: string) {
    const url = `ws://${ip}/ws`;
    addLog("Tentando WebSocket em " + url);
    try {
      const socket = new WebSocket(url);
      socket.onopen = () => addLog("🌐 WebSocket conectado!");
      socket.onmessage = (event) => {
        addLog("📨 WS: " + (typeof event.data === "string" ? event.data.substring(0,100) : "[binary]"));
        if (typeof event.data === "string" && event.data.startsWith("/9j/")) {
          setImages((prev) => [ `data:image/jpeg;base64,${event.data}`, ...prev ]);
        }
      };
      socket.onerror = (err) => addLog("❌ Erro WS");
      socket.onclose = () => addLog("⚠️ WS desconectado");
      setWs(socket);
    } catch (err) {
      addLog("❌ Falha ao abrir WebSocket: " + String(err));
    }
  }

  // modal handlers
  function onSendWifiFromModal() {
    if (!inputSsid || !inputPass) {
      Alert.alert("Preencha", "Informe SSID e senha");
      return;
    }
    setSsidModalVisible(false);
    enviarWifi(inputSsid.trim(), inputPass.trim());
    addLog(`📶 Enviando credenciais: ${inputSsid.trim()}`);
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

  // UI
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView>
        <HeaderComLogin />
        <FirstTitle text="Como conectar?" fontSize={40} style={{ marginBottom: 9, marginTop: 20, alignSelf: "center" }} />
        <View style={{ height: 1, backgroundColor: "#F85200", width: "106%", alignSelf: "center", marginVertical: 12, marginBottom: 50 }} />
        <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
          <Image source={require("@/assets/images/pareamento.png")} style={{ width: 179, height: 179, resizeMode: "contain" }} />
        </View>
        <FirstCard customStyle={{ width: "100%", height: height * 0.18, alignSelf: "center", paddingHorizontal: 16, marginTop: -2, alignItems: "center", borderRadius: 0, elevation: 0, shadowOpacity: 0 }}>
          <FirstTitle text={"Primeiramente, ligue \no Bluetooth no seu \ncelular."} fontSize={36} style={{ alignSelf: "center", textAlign: "center" }} />
        </FirstCard>
        <FirstTitle text={"Aceite a permissão do app \npara parear o dispositivo"} fontSize={30} style={{ marginBottom: 16, marginTop: 12, alignSelf: "center", textAlign: "center" }} />
        <FirstButton title={connected ? "Conectado ✅" : "Parear"} onPress={openModal} customStyle={{ marginBottom: 40, marginTop: 40, width: "85%", alignSelf: "center" }} />
      </ScrollView>

      <FirstModal visible={modalVisible} onClose={closeModal}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>{connected ? "✅ Dispositivo conectado!" : "⏳ Procurando dispositivo..."}</Text>
          {logs.slice(-10).map((l, i) => (<Text key={i} style={{ color: "#ccc", fontSize: 12 }}>{l}</Text>))}
        </View>
      </FirstModal>

      {/* SSID Modal - crossplatform */}
      <Modal visible={ssidModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={{ color:"#fff", fontSize:18, marginBottom:8 }}>Conectar ao Wi-Fi</Text>
            <TextInput placeholder="SSID" placeholderTextColor="#999" value={inputSsid} onChangeText={setInputSsid} style={styles.input} />
            <TextInput placeholder="Senha" placeholderTextColor="#999" value={inputPass} onChangeText={setInputPass} secureTextEntry style={styles.input} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
              <TouchableOpacity onPress={() => setSsidModalVisible(false)} style={styles.buttonSecondary}><Text style={{color:'#fff'}}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={onSendWifiFromModal} style={styles.buttonPrimary}><Text style={{color:'#fff'}}>Enviar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center' },
  modalBox: { width:'85%', padding:16, backgroundColor:'#111', borderRadius:8 },
  input: { backgroundColor:'#222', color:'#fff', padding:10, marginTop:8, borderRadius:6 },
  buttonPrimary: { backgroundColor:'#F85200', padding:10, borderRadius:6, paddingHorizontal:16 },
  buttonSecondary: { backgroundColor:'#444', padding:10, borderRadius:6, paddingHorizontal:16 },
});
