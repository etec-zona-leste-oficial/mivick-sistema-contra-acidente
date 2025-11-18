import React from "react";
import { View, Text } from "react-native";

interface ToastProps {
  text1?: string;
  text2?: string;
}

export const toastConfig = {
  success: ({ text1, text2 }: ToastProps) => (
    <View
      style={{
        backgroundColor: "#000",
        borderLeftWidth: 6,
        borderLeftColor: "#00C851",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginHorizontal: 12,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
        {text1}
      </Text>
      {text2 && (
        <Text style={{ color: "#ccc", marginTop: 3, fontSize: 14 }}>
          {text2}
        </Text>
      )}
    </View>
  ),

  error: ({ text1, text2 }: ToastProps) => (
    <View
      style={{
        backgroundColor: "#000",
        borderLeftWidth: 6,
        borderLeftColor: "#ff4444",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginHorizontal: 12,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
        {text1}
      </Text>
      {text2 && (
        <Text style={{ color: "#ccc", marginTop: 3, fontSize: 14 }}>
          {text2}
        </Text>
      )}
    </View>
  ),
};
