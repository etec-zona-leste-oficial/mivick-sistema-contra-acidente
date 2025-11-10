// app/_layout.tsx
import { Stack } from "expo-router";
import { BleProvider } from "./BleContext"; // caminho correto
import FontProvider from "@/components/providers/FontProvider";

export default function RootLayout() {
  return (
    <FontProvider>
      <BleProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BleProvider>
    </FontProvider>
  );
}
