// components/BackButton/BackButton.tsx
import React from "react";
import { TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BackButton({ size = 28, color = "#fff" }: { size?: number; color?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // garante header perfeito em qualquer dispositivo

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          width: size + 13,
          height: size + 13,
          borderRadius: (size + 15) / 2,
          top: insets.top + 8, // fica na altura exata do header real
        },
      ]}
    >
      <Ionicons name="chevron-back" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    left: 12, // sempre no canto esquerdo do header
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff4221ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 50, // sempre acima do header
  },
});
