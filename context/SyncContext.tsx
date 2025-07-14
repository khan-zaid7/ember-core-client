import React, { createContext, useContext, useEffect } from 'react';
import { useSyncTrigger } from '@/hooks/useSyncTrigger';
import { useAuth } from './AuthContext';

interface SyncContextType {
  triggerSync: () => Promise<void>;
  triggerPullSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { triggerSync, triggerPullSync } = useSyncTrigger();

  const wrappedTriggerSync = async () => {
    await triggerSync();
  };

  const wrappedTriggerPullSync = async () => {
    await triggerPullSync();
  };

  return (
    <SyncContext.Provider value={{ triggerSync: wrappedTriggerSync, triggerPullSync: wrappedTriggerPullSync }}>
      {children}
    </SyncContext.Provider>
  );
};
