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
  const DEVICE_NAME_ESP1 = "ESP32-CAM-BLE";
  const DEVICE_NAME_ESP2 = "ESP32-VEICULO-BLE";


  // ---------------------- REGISTRAR DISPOSITIVO ----------------------
  async function registrarDispositivoSeNecessario(): Promise<number | null> {
    try {
      let storedId = await AsyncStorage.getItem("device_id");

      if (storedId) {
        console.log("📦 Dispositivo já registrado! ID:", storedId);
        return Number(storedId);
      }

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        "http://10.116.216.162:3000/app/mivick/iot/registrar-dispositivo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ nome: "MIVICK-ESP32" })
        }
      );

      const json = await response.json();

      if (json.id_dispositivo) {
        await AsyncStorage.setItem("device_id", String(json.id_dispositivo));
        return Number(json.id_dispositivo);
      }

      return null;
    } catch (err) {
      console.log("❌ Erro registrarDispositivo:", err);
      return null;
    }
  }



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

      if (!body.id_dispositivo) {
        console.warn("⚠️ Tentando enviar sem ID do dispositivo");
        return;
      }

      const response = await fetch("http://10.116.216.162:3000/app/mivick/iot/leituras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      console.log("📡 Backend:", await response.json());

    } catch (error) {
      console.log("❌ Erro ao enviar:", error);
    }
  }

  // =============================================================
  // TELA PRINCIPAL
  // =============================================================
  export default function ConectarDispositivo() {
    const [modalVisible, setModalVisible] = useState(false);
    const { manager, devices, addDevice, removeDevice, connected, setConnected } = useBle();
    const [esp1Device, setEsp1Device] = useState<Device | null>(null);
    const [esp1Connected, setEsp1Connected] = useState(false);
    const [esp2Device, setEsp2Device] = useState<Device | null>(null);
    const [esp2Connected, setEsp2Connected] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [ultimaLeitura, setUltimaLeitura] = useState<any>(null);

    // SSID modal
    const [ssidModalVisible, setSsidModalVisible] = useState(false);
    const [inputSsid, setInputSsid] = useState("");
    const [inputPass, setInputPass] = useState("");
    const [deviceId, setDeviceId] = useState<number | null>(null);
    const [wifiSalvo, setWifiSalvo] = useState<{ ssid: string, senha: string }[]>([]);

    function addLog(msg: string) {
      console.log(msg);
      setLogs((prev) => [...prev, msg]);
    }
  useEffect(() => {
    async function init() {
      const id = await registrarDispositivoSeNecessario();
      if (id) setDeviceId(Number(id));
    }
    init();
  }, []);
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
        addLog(" BLE Manager não inicializado");
        return;
      }
      //addLog(" Procurando dispositivo BLE...");
      manager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          addLog("❌ Erro no scan: " + error.message);
          return;
        }
 if (scannedDevice?.name === DEVICE_NAME_ESP1 && !esp1Connected) {
    connectToEsp1(scannedDevice);
}

if (scannedDevice?.name === DEVICE_NAME_ESP2 && !esp2Connected) {
    connectToEsp2(scannedDevice);
}
if (esp1Connected && esp2Connected) manager.stopDeviceScan();


      });
    }

    // ---------------------- ENVIAR WI-FI VIA BLE ----------------------
    async function enviarWifi(ssid: string, senha: string) {
  const target = esp1Device;
  if (!target) return;
  try {
    const msg = `WIFI|${ssid}|${senha}`;
    await target.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      Buffer.from(msg, "utf-8").toString("base64")
    );
    addLog("Wi-Fi enviado via BLE para ESP1");
        if (deviceId === null) return;
        // salvar no backend
        enviarParaBackend({
          id_dispositivo: deviceId,
          wifi_ssid: ssid,
          wifi_senha: senha
        });

      } catch (e) {
        console.error("❌ Erro ao enviar Wi-Fi:", e);
        Alert.alert("Erro", "Falha ao enviar credenciais.");
      }
    }
// ---------------------- CONECTAR ESP1 ----------------------
async function connectToEsp1(dev: Device) {
  try {
    const d = await dev.connect();
    await d.discoverAllServicesAndCharacteristics();

    setEsp1Device(d);
    setEsp1Connected(true);
    setConnected(true);     // ← ADICIONE AQUI
    addDevice(d);
    addLog("ESP1 conectado!");

    // Monitor do ESP1
    d.monitorCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) return addLog("Erro ESP1: " + error.message);

        const msg = Buffer.from(characteristic?.value ?? "", "base64").toString("utf8");
        addLog("ESP1: " + msg);

        if (deviceId === null) return;

        enviarParaBackend({
          id_dispositivo: deviceId,
          ble_log: "ESP1: " + msg
        });

        if (msg.startsWith("OK|")) {
          const ip = msg.split("|")[1];
          console.log("WIFI_OK recebido:", msg);
          conectarWebSocket(ip); // WS apenas do ESP1
        }
       if (esp2Device && inputSsid && inputPass) {
  esp2Device.writeCharacteristicWithoutResponseForService(
    SERVICE_UUID,
    CHARACTERISTIC_UUID,
    Buffer.from(`WIFI|${inputSsid}|${inputPass}`).toString("base64")
  );
  addLog("Wi-Fi reenviado ao ESP2 após ESP1 confirmar WIFI_OK");
}



      }
    );

  } catch (e) {
    console.log("Erro ESP1:", e);
  }
}

// ---------------------- CONECTAR ESP2 ----------------------
async function connectToEsp2(dev: Device) {
  try {
    const d = await dev.connect();
    await d.discoverAllServicesAndCharacteristics();

    setEsp2Device(d);
    setEsp2Connected(true);
    setConnected(true);     // ← ADICIONE AQUI
    addDevice(d);
    addLog("ESP2 conectado!");
    

    // Monitor ESP2
    d.monitorCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) return addLog("Erro ESP2: " + error.message);

        const msg = Buffer.from(characteristic?.value ?? "", "base64").toString("utf8");
        addLog("ESP2: " + msg);

        if (deviceId === null) return;

        enviarParaBackend({
          id_dispositivo: deviceId,
          ble_log: "ESP2: " + msg
        });

        if (msg.startsWith("VEICULO|")) {
          // Aqui você trata mensagens do veículo
        }
      }
    );

  } catch (e) {
    console.log("Erro ESP2:", e);
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
          if (deviceId === null) return;
          enviarParaBackend({
            id_dispositivo: deviceId,
            ws_log: "WS conectado"
          });
        };

       socket.onmessage = (event) => {
  if (deviceId === null) return;

  const msg = event.data;

  // ========= FOTO =========
if (msg.startsWith("/9j/")) {
  const payload: Partial<BackendPayload> = {
    id_dispositivo: deviceId,
    foto_base64: msg,
    ws_log: "FOTO_RECEBIDA"
  };

  // se temos ultimaLeitura, anexa seus campos, senão marca como FOTO
  if (ultimaLeitura) {
    payload.distancia = ultimaLeitura.distancia;
    payload.impacto = ultimaLeitura.impacto;
    payload.movimentacao = ultimaLeitura.movimentacao;
  } else {
    payload.movimentacao = "FOTO";
  }

  enviarParaBackend(payload);
  setImages(prev => ["data:image/jpeg;base64," + msg, ...prev]);
  return;
}



  // ========= STRINGS DO ESP =========
  if (msg.includes("|")) {
    const parts = msg.split("|");

    // ---------------------------------
    // 🚨 ALERTAS DE ACIDENTE
    // Ex: CICLISTA|ALERTA|POSSIVEL_ACIDENTE|3
    // ---------------------------------
    if (parts[1] === "ALERTA") {
      enviarParaBackend({
        id_dispositivo: deviceId,
        acidente_identificado: true,
        movimentacao: parts[2],      // POSSIVEL_ACIDENTE
        impacto: Number(parts[3]),   // quantidade de eventos
        ws_log: msg
      });
      return;
    }

    // ---------------------------------
    // 📏 ULTRASSÔNICO
    // Ex: CICLISTA|ULTRASSONICO|OBJETO_PROXIMO|95.80
    // ---------------------------------
    if (parts[1] === "ULTRASSONICO") {
  const leitura = {
    distancia: Number(parts[3]),
    impacto: 0,
    movimentacao: "ULTRASSONICO"
  };

  setUltimaLeitura(leitura);

  enviarParaBackend({
    id_dispositivo: deviceId,
    ...leitura,
    ws_log: msg
  });

  return;
}


    // ---------------------------------
    // 🌀 MPU / SW420
    // Ex: CICLISTA|MPU6050|BATIDA|17.22
    // Ex: CICLISTA|SW420|IMPACTO|1
    // ---------------------------------
    if (parts[1] === "MPU6050" || parts[1] === "SW420") {
      enviarParaBackend({
        id_dispositivo: deviceId,
        impacto: Number(parts[3]),
        movimentacao: parts[2],     // BATIDA / IMPACTO
        ws_log: msg
      });
      return;
    }
  }

  // ========= Fallback: Log puro =========
  enviarParaBackend({
    id_dispositivo: deviceId,
    ws_log: msg
  });
};


        socket.onerror = () => {
          addLog(" Erro no WebSocket");
        if (deviceId === null) return;
          enviarParaBackend({
            id_dispositivo: deviceId,
            ws_log: "Erro WS"
          });
        };

        socket.onclose = () => {
          addLog(" WebSocket fechado");
        if (deviceId === null) return;
          enviarParaBackend({
            id_dispositivo: deviceId,
            ws_log: "WS desconectado"
          });
        };

        setWs(socket);

      } catch (err) {
        addLog(" Falha ao abrir WS: " + String(err));
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
      async function abrirModalWifi() {
    if (!deviceId) return;

    try {
      const token = await AsyncStorage.getItem("token");

      const resp = await fetch(`http://10.116.216.162:3000/app/mivick/iot/wifi/${deviceId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const json = await resp.json();

      if (json.ok) setWifiSalvo(json.lista);
    } catch (e) {
      console.log("Erro ao buscar wifi:", e);
    }

    setSsidModalVisible(true);
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
       <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
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
            title={connected ? "Conectado" : "Parear"}
            onPress={openModal}
            customStyle={{ marginBottom: 40, width: "85%", alignSelf: "center" }}
          />
          {connected && (
    <FirstButton
      title="Configurar Wi-Fi "
      onPress={abrirModalWifi}
      customStyle={{ width: "85%", alignSelf: "center", marginBottom: 20 }}
    />
  )}

        
        {/* Modal de pareamento */}
        <FirstModal visible={modalVisible} onClose={closeModal}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
              {connected ? " Dispositivo conectado!" : " Procurando dispositivo..."}
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

      <Text style={{ color: "#fff", fontSize: 18, marginBottom: 12 }}>
        Conectar ao Wi-Fi
      </Text>

      {wifiSalvo.length > 0 && (
        <>
          <Text style={{ color: "#aaa", marginBottom: 6 }}>Redes salvas:</Text>

          {wifiSalvo.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setInputSsid(item.ssid);
                setInputPass(item.senha);
              }}
              style={{
                padding: 10,
                backgroundColor: "#222",
                borderRadius: 6,
                marginBottom: 6
              }}
            >
              <Text style={{ color: "#fff" }}>{item.ssid}</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 1, backgroundColor: "#333", marginVertical: 10 }} />
        </>
      )}

      <TextInput
        placeholder="SSID"
        placeholderTextColor="#999"
        value={inputSsid}
        onChangeText={setInputSsid}
        style={styles.input}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#999"
        value={inputPass}
        onChangeText={setInputPass}
        secureTextEntry
        style={styles.input}
      />

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
</ScrollView>
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
