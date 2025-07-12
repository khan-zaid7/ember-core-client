import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Audio } from 'expo-av';

export type NotificationType = 'info' | 'error' | 'success' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextProps {
  notifications: Notification[];
  notify: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

const NOTIFICATION_SOUND = require('../assets/notification.mp3'); // Replace with a notification sound file

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const playSound = useCallback(async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        NOTIFICATION_SOUND,
        { shouldPlay: true }
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch (e) {
      // fallback: no sound
    }
  }, []);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    playSound();
    setTimeout(() => removeNotification(id), 4000);
  }, [playSound]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notify, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
