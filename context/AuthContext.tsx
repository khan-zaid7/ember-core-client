import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getSessionFromDB,
  removeSessionFromDB,
  saveSessionToDB,
} from '../services/models/SessionModel';

export type AuthUser = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  phone_number: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
  updateUserId: (newUserId: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  refresh: async () => {},
  updateUserId: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await getSessionFromDB();
        if (session) setUser(session);
      } catch (err) {
        console.log('🛑 Error loading session:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (userData: AuthUser) => {
    await saveSessionToDB(userData);
    setUser(userData);
  };

  const logout = async () => {
    await removeSessionFromDB();
    setUser(null);
  };

  const refresh = async () => {
    try {
      const session = await getSessionFromDB();
      if (session) setUser(session);
    } catch (err) {
      console.error('⚠️ Failed to refresh session:', err);
    }
  };

  const updateUserId = async (newUserId: string) => {
    try {
      if (user) {
        const updatedUser = { ...user, user_id: newUserId };
        await saveSessionToDB(updatedUser);
        setUser(updatedUser);
        console.log(`✅ User ID updated in AuthContext: ${user.user_id} -> ${newUserId}`);
      }
    } catch (err) {
      console.error('❌ Failed to update user ID in AuthContext:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refresh, updateUserId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
