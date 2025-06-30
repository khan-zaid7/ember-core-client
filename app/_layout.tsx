// app/_layout.tsx
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { initDatabase, resetDatabase, verifyTables } from '@/services/db';
import AuthGuard from '@/components/AuthGuard';
import { AuthProvider } from '@/context/AuthContext';

export default function Layout() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initDatabase();
      verifyTables();
      // resetDatabase();
    }
  }, []);

  return (
    <AuthProvider>
      <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right', 
            gestureEnabled: true,
            contentStyle: { backgroundColor: '#fcfaf8' },
          }}
        />
      </AuthGuard>
    </AuthProvider>
  );
}
