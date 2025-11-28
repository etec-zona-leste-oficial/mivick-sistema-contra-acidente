// components/BackButton/BackButton.tsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export function BackButton({ size = 28, color = "#fff" }: { size?: number; color?: string }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={[styles.button, { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2 }]}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff4221ff", // tom ligeiramente mais suave de laranja/vermelho
    shadowColor: "#000", // sombra mais escura e nítida
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10, // sombra mais pronunciada no Android
    position: "absolute",
    left: 15,
    bottom: 3
    , // canto inferior esquerdo
  },
});
