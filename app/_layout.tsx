// app/_layout.tsx
import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Slot } from 'expo-router';
import { initDatabase, verifyTables } from '@/services/db';
import AuthGuard from '@/components/AuthGuard';
import { AuthProvider } from '@/context/AuthContext'; // ⬅️ You forgot this before

export default function Layout() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initDatabase();
      verifyTables();
    }
  }, []);

  return (
    <AuthProvider> 
      <AuthGuard>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </AuthGuard>
    </AuthProvider>
  );
}
