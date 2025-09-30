// app/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false, 
          drawerStyle: { backgroundColor: "#fff", width: 220 },
          drawerLabelStyle: { fontSize: 16, color: "#333" },
        }}
      >
        {/* Home */}
        <Drawer.Screen
          name="home1"
          options={{
            drawerLabel: "Home",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        {/* Contatos */}
        <Drawer.Screen
          name="contato"
          options={{
            drawerLabel: "Contatos",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
