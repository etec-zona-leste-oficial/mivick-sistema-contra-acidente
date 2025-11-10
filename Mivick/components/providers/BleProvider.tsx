import React, { createContext, useContext, useEffect, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { Platform, PermissionsAndroid, View, Text } from "react-native";

interface BleContextType {
  manager: BleManager | null;
  device: Device | null;
  setDevice: (d: Device | null) => void;
  connected: boolean;
  setConnected: (v: boolean) => void;
  safeReady: boolean;
}

const BleContext = createContext<BleContextType | null>(null);

export const BleProvider = ({ children }: { children: React.ReactNode }) => {
  const [manager, setManager] = useState<BleManager | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [connected, setConnected] = useState(false);
  const [safeReady, setSafeReady] = useState(false);

  useEffect(() => {
    let m: BleManager | null = null;
    let mounted = true;

    const initBLE = async () => {
      try {
        console.log("🔄 Iniciando BLE Manager...");

        // ✅ Pede permissões no Android (sem travar o app)
      if (Platform.OS === "android") {
  try {
    const perms = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

    if (Platform.Version >= 31) {
      perms.push(
        "android.permission.BLUETOOTH_SCAN" as any,
        "android.permission.BLUETOOTH_CONNECT" as any
      );
    }

    for (const p of perms) {
      const granted = await PermissionsAndroid.request(p);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("⚠️ Permissão negada:", p);
      }
    }
  } catch (e) {
    console.warn("Erro ao solicitar permissões:", e);
  }
}

        // ✅ Cria o gerenciador BLE com proteção
        m = new BleManager();
        if (!mounted) return;

        setManager(m);
        console.log("✅ BLE Manager inicializado");
        setSafeReady(true);
      } catch (error) {
        console.error("❌ Erro ao iniciar BLE Manager:", error);
        setSafeReady(false);
      }
    };

    initBLE();

    return () => {
      mounted = false;
      if (m) {
        console.log("🧹 Limpando BLE Manager...");
        try {
          m.destroy();
        } catch (err) {
          console.warn("Erro ao destruir o BLE Manager:", err);
        }
      }
    };
  }, []);

  const value: BleContextType = {
    manager,
    device,
    setDevice,
    connected,
    setConnected,
    safeReady,
  };

  if (!safeReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18 }}>
          Inicializando Bluetooth...
        </Text>
      </View>
    );
  }

  return <BleContext.Provider value={value}>{children}</BleContext.Provider>;
};

export const useBle = () => {
  const context = useContext(BleContext);
  if (!context) {
    throw new Error("useBle deve ser usado dentro de um BleProvider");
  }
  return context;
};
