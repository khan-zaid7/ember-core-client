// components/AuthGuard.tsx
import { useAuth } from '@/context/AuthContext';
import { Redirect, usePathname } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const publicRoutes = ['/', '/login', '/register', '/forgot-password'];

  const normalizedPath = pathname.replace(/\/+$/, ''); // strip trailing slashes
  const isPublic = publicRoutes.includes(normalizedPath);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // 🔒 Redirect authenticated users away from login/register
  if (user && isPublic) return <Redirect href="/home" />;

  // 🔒 Redirect unauthenticated users away from protected pages
  if (!user && !isPublic) return <Redirect href="/login" />;

  return <>{children}</>;
}
