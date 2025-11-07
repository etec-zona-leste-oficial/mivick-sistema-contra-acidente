import React, { createContext, useState, useContext, useEffect } from "react";
import { View, Text } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

interface BleContextType {
  manager: BleManager | null;
  device: Device | null;
  setDevice: (d: Device | null) => void;
  connected: boolean;
  setConnected: (v: boolean) => void;
}

const BleContext = createContext<BleContextType | null>(null);

// 🔹 Versão antiga mantida apenas para comparação/teste
export const BleProviderOld = ({ children }: { children: React.ReactNode }) => {
  const [manager, setManager] = useState<BleManager | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const m = new BleManager();
    setManager(m);
    console.log("✅ BLE Manager inicializado");

    return () => {
      console.log("🧹 Limpando BLE Manager");
      m.destroy();
    };
  }, []);

  if (!manager) return null;

  return (
    <BleContext.Provider
      value={{ manager, device, setDevice, connected, setConnected }}
    >
      {children}
    </BleContext.Provider>
  );
};

// 🔹 Versão nova que evita o fechamento do app
export const BleProvider = ({ children }: { children: React.ReactNode }) => {
  const [manager, setManager] = useState<BleManager | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [connected, setConnected] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const m = new BleManager();
        setManager(m);
        console.log("✅ BLE Manager inicializado");
        setReady(true);
      } catch (error) {
        console.error("❌ Erro ao iniciar BLE Manager:", error);
      }
    };
    init();

    return () => {
      console.log("🧹 Limpando BLE Manager");
      manager?.destroy();
    };
  }, []);

  return (
    <BleContext.Provider
      value={{
        manager,
        device,
        setDevice,
        connected,
        setConnected,
      }}
    >
      {!ready ? (
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
      ) : (
        children
      )}
    </BleContext.Provider>
  );
};

export const useBle = () => {
  const ctx = useContext(BleContext);
  if (!ctx) throw new Error("useBle deve ser usado dentro de BleProvider");
  return ctx;
};
