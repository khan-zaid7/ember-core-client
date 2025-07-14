// components/AuthGuard.tsx
import { useAuth } from '@/context/AuthContext';
import { Redirect, usePathname } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSyncTrigger } from '@/hooks/useSyncTrigger';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Initialize sync trigger hook
  useSyncTrigger();

  const publicRoutes = [
    '/',
    '/authentication/login',
    '/authentication/register',
    '/authentication/password-reset/forgot-password',
    '/authentication/password-reset/reset-password',
    '/authentication/password-reset/verify-opt',
  ];

  // Define common routes for all roles
  const commonRoutes = [
    '/home',
    '/register-patients',
    '/register-patients/create',
    '/register-patients/index',
    '/records',
    '/map',
    '/maps',
    '/profile',
    '/inbox',
    '/conflicts',
    '/resolve-conflicts'
  ];

  // Define allowed routes for each role
  const roleRoutes: Record<string, string[]> = {
    volunteer: [...commonRoutes],
    fieldworker: [
      ...commonRoutes, '/medical-supplies', '/tasks/assignedTasks', '/medical-supplies/index',
      '/medical-supplies/create',
    ],
    coordinator: [
      ...commonRoutes,
      '/medical-supplies',
      '/medical-supplies/index',
      '/medical-supplies/create',
      '/tasks/assignedTasks',
      '/tasks',
      '/tasks/create',
      '/tasks/index',
      '/users',
    ],
    // add more roles as needed
  };

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
  if (!user && !isPublic) return <Redirect href="/authentication/login" />;

  // 🔒 Role-based route protection
  if (user && !isPublic) {
    const allowedRoutes = roleRoutes[user.role] || [];
    if (!allowedRoutes.includes(normalizedPath)) {
      // Redirect to home or a "not authorized" page
      return <Redirect href="/home" />;
    }
  }

  return <>{children}</>;
}
