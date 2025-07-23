// app/_layout.tsx
import React, { useEffect } from 'react';
import { Platform, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, View } from 'react-native';
import { Stack } from 'expo-router';
import AuthGuard from '@/components/AuthGuard';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { initDatabase, verifyTables , resetDatabase  } from '@/services/db';
import { NetworkProvider } from '@/context/NetworkContext';
import NotificationBanner from '@/components/NotificationBanner';

export default function Layout() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initDatabase();
      verifyTables();
      // resetDatabase();
    }
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
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
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
