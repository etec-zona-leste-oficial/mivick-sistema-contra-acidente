// components/HeaderComLogin.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Logo } from "@/components/Logo";
import { styles } from "./styleHeaderComLogin";
import { Ionicons } from "@expo/vector-icons";

export function HeaderComLogin() {
  const router = useRouter();
  

  return (
    <View style={styles.header}>
      {/* Logo + Nome */}
      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={() => router.push("./Home")}>
          <Logo />
        </TouchableOpacity>
      </View>

     
    </View>
  );
}
