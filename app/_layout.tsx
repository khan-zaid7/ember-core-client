// app/_layout.tsx
import AuthGuard from '@/components/AuthGuard';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useSyncTrigger } from '@/hooks/useSyncTrigger';
import { initDatabase, verifyTables, resetDatabase } from '@/services/db';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NetworkProvider } from '@/context/NetworkContext'; 
import NotificationBanner from '@/components/NotificationBanner';

export default function Layout() {
  // sync trigger 
      useSyncTrigger();
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initDatabase();
      verifyTables();
      
    }
  }, []);

  return (
    <NetworkProvider>
      <AuthProvider>
        <NotificationProvider>
          <AuthGuard>
            <>
              <NotificationBanner />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right', 
                  gestureEnabled: true,
                  contentStyle: { backgroundColor: '#fcfaf8' },
                }}
              />
            </>
          </AuthGuard>
        </NotificationProvider>
      </AuthProvider>
    </NetworkProvider>
  );
}
