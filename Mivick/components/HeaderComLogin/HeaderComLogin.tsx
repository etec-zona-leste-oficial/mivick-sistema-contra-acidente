// components/HeaderComLogin.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Logo } from "@/components/Logo";
import { styles } from "./styleHeaderComLogin";
import { Ionicons } from "@expo/vector-icons";

export function HeaderComLogin() {
  const router = useRouter();
  const navigation = useNavigation<any>(); // para abrir o drawer

  return (
    <View style={styles.header}>
      {/* Logo + Nome */}
      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={() => router.push("/home1")}>
          <Logo />
        </TouchableOpacity>
      </View>

      {/* Botão menu sanduíche abre o Drawer */}
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Ionicons name="menu" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
