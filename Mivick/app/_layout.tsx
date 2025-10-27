// app/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false, 
          drawerStyle: { backgroundColor: "#2D2D2D", width: 220 },
          drawerLabelStyle: { fontSize: 16, color: "#fff" },
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
