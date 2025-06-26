import { useEffect } from "react";
import { View, Platform } from "react-native";
import { Slot } from "expo-router";
import { initDatabase, verifyTables } from "../services/db";
import { AuthProvider } from "@/context/AuthContext"; 

export default function Layout() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      initDatabase();
      verifyTables();
    }
  }, []);

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </AuthProvider>
  );
}
