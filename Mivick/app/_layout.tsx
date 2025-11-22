import { Stack } from "expo-router";
import React from "react";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastProps,
} from "react-native-toast-message";

// 🔥 Configuração de toasts personalizados
const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#22c55e", // verde
        backgroundColor: "#000",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
      text2Style={{ color: "#ccc", fontSize: 14 }}
    />
  ),

  error: (props: ToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ef4444", // vermelho
        backgroundColor: "#000",
      }}
      text1Style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
      text2Style={{ color: "#ccc", fontSize: 14 }}
    />
  ),

  info: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#F85200", // laranja
        backgroundColor: "#000",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
      text2Style={{ color: "#ccc", fontSize: 14 }}
    />
  ),
};

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast config={toastConfig} />
    </>
  );
}
