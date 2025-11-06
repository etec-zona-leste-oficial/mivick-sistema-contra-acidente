import { BleProvider } from "@/components/context/BleContext";
import FontProvider from "@/components/providers/FontProvider";
import { Tabs } from "expo-router";

export default function App() {
  return (
    <BleProvider>
      <FontProvider>
        <Tabs />
      </FontProvider>
    </BleProvider>
  );
}
