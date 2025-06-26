import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSessionFromDB, removeSessionFromDB, saveSessionToDB } from '../services/models/SessionModel';

export type AuthUser = {
  user_id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => { },
  logout: () => { },
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
    console.log("the fucnction reaches here !!!!!")
    await saveSessionToDB(userData);
    setUser(userData);
  };

  const logout = async () => {
    await removeSessionFromDB();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
