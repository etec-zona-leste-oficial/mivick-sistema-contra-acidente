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
const [ws, setWs] = useState<WebSocket | null>(null);
const [images, setImages] = useState<string[]>([]);

const [ultimaLeitura, setUltimaLeitura] = useState<any>(null);

      const [deviceId, setDeviceId] = useState<number | null>(null);
      const [wifiSalvo, setWifiSalvo] = useState<
        { ssid: string; senha: string }[]
      >([]);

      const [logs, setLogs] = useState<string[]>([]);
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
            "http://10.135.37.162:3000/app/mivick/iot/leituras",
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
      // ENVIAR WIFI VIA BLE
      // =============================================================
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

          addLog("Wi-Fi enviado ao ESP");

          if (deviceId) {
            enviarParaBackend({
              id_dispositivo: deviceId,
              wifi_ssid: ssid,
              wifi_senha: senha,
            });
          }
        } catch (e) {
          console.error("Erro ao enviar Wi-Fi:", e);
          Alert.alert("Erro", "Falha ao enviar credenciais.");
        }
      }

      async function abrirModalWifi() {
        if (!deviceId) return;

        try {
          const token = await AsyncStorage.getItem("token");

          const resp = await fetch(
            `http://10.135.37.162:3000/app/mivick/iot/wifi/${deviceId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const json = await resp.json();

          if (json.ok) setWifiSalvo(json.lista);
        } catch (e) {
          console.log("Erro ao buscar wifi:", e);
        }

        setSsidModalVisible(true);
      }

      function onSendWifiFromModal() {
        if (!inputSsid || !inputPass) {
          Alert.alert("Preencha", "Informe SSID e senha.");
          return;
        }

        setSsidModalVisible(false);
        enviarWifi(inputSsid.trim(), inputPass.trim());
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
    // ALERTAS DE ACIDENTE
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
    //  ULTRASSÔNICO
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
    //  MPU / SW420
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
useEffect(() => {
  async function loadIp() {
    const savedIp = await AsyncStorage.getItem("device_ip");

    if (savedIp) {
      setIp(savedIp);
      console.log("IP recuperado:", savedIp);

      // reconectar WS automaticamente
      conectarWebSocket(savedIp);
    } else {
      console.log("Nenhum IP salvo encontrado.");
    }
  }

  loadIp();
}, []);

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

                {/* BOTÃO 3 */}
                <TouchableOpacity onPress={abrirModalWifi}>
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
                    <FontAwesome name="wifi" size={40} color="#F85200" />
                  </View>
                  <FirstSubTitle
                    text="WiFi"
                    style={{
                      textAlign: "center",
                      marginTop: 5,
                      color: "#D9D9D9",
                    }}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: "#F85200",
                width: "90%",
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

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