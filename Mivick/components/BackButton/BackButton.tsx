import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        position: "absolute",
        left: 15,
        top: 34,
        zIndex: 10,
        padding: 5,
      }}
    >
      <Ionicons name="chevron-back" size={28} color="#fff" />
    </TouchableOpacity>
  );
}
