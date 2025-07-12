import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isInternetReachable: boolean;
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isInternetReachable: true,
  isConnected: true,
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
      setIsInternetReachable(!!state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isInternetReachable, isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};
