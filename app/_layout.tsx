import { useEffect } from "react";
import { View, Platform } from "react-native";
import { Slot } from "expo-router";
import { initDatabase, verifyTables } from "../services/db";

export default function Layout() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      initDatabase();
      verifyTables();
    }
  }, []);

  return <View style={{ flex: 1 }}><Slot /></View>;
}
