import React from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="chevron-back" size={28} color="#fff" />
    </TouchableOpacity>
  );
}
