import { Stack } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const toastConfig = {
  success: (props: any) => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#000",
        padding: 12,
        borderLeftWidth: 6,
        borderLeftColor: "#22c55e",
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 10,
      }}
    >
      <FontAwesome
        name="check-circle"
        size={30}
        color="#22c55e"
        style={{ marginRight: 10 }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {props.text1}
        </Text>

        {props.text2 ? (
          <Text style={{ color: "#ccc", marginTop: 2 }}>{props.text2}</Text>
        ) : null}
      </View>
    </View>
  ),

  error: (props: any) => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#000",
        padding: 12,
        borderLeftWidth: 6,
        borderLeftColor: "#ef4444",
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 10,
      }}
    >
      <FontAwesome
        name="times-circle"
        size={30}
        color="#ef4444"
        style={{ marginRight: 10 }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {props.text1}
        </Text>

        {props.text2 ? (
          <Text style={{ color: "#ccc", marginTop: 2 }}>{props.text2}</Text>
        ) : null}
      </View>
    </View>
  ),

  info: (props: any) => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#000",
        padding: 12,
        borderLeftWidth: 6,
        borderLeftColor: "#3b82f6",
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 10,
      }}
    >
      <FontAwesome
        name="info-circle"
        size={30}
        color="#3b82f6"
        style={{ marginRight: 10 }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {props.text1}
        </Text>

        {props.text2 ? (
          <Text style={{ color: "#ccc", marginTop: 2 }}>{props.text2}</Text>
        ) : null}
      </View>
    </View>
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
