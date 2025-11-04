import React, { createContext, useState, useContext } from "react";
import { BleManager, Device } from "react-native-ble-plx";

interface BleContextType {
  manager: BleManager;
  device: Device | null;
  setDevice: (d: Device | null) => void;
  connected: boolean;
  setConnected: (v: boolean) => void;
}

const BleContext = createContext<BleContextType | null>(null);

export const BleProvider = ({ children }: { children: React.ReactNode }) => {
  const [manager] = useState(() => new BleManager());
  const [device, setDevice] = useState<Device | null>(null);
  const [connected, setConnected] = useState(false);

  return (
    <BleContext.Provider value={{ manager, device, setDevice, connected, setConnected }}>
      {children}
    </BleContext.Provider>
  );
};

export const useBle = () => {
  const ctx = useContext(BleContext);
  if (!ctx) throw new Error("useBle deve ser usado dentro de BleProvider");
  return ctx;
};
