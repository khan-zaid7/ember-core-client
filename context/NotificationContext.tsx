import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { getUnreadNotificationsByUserId } from '../services/models/NotificationModel';
import { useAuth } from './AuthContext';
import { initializeNotificationManager } from '../utils/notificationManager';

export type NotificationType = 'info' | 'error' | 'success' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
}

interface NotificationContextProps {
  notifications: Notification[];
  notify: (message: string, type?: NotificationType, title?: string) => void;
  removeNotification: (id: string) => void;
  checkForNewNotifications: () => void;
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
  const { user } = useAuth();

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

  const notify = useCallback((message: string, type: NotificationType = 'info', title?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type, title }]);
    playSound();
    setTimeout(() => removeNotification(id), 6000); // Match iOS notification duration
  }, [playSound]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Function to check for new database notifications and display them
  const checkForNewNotifications = useCallback(() => {
    if (!user || !user.user_id) return;
    
    try {
      // Get unread notifications from the database
      const unreadNotifications = getUnreadNotificationsByUserId(user.user_id);
      
      // Limit the number of notifications shown at startup to just one summary notification
      if (unreadNotifications.length > 1) {
        // Show a summary notification instead of flooding the UI
        notify(
          `You have ${unreadNotifications.length} unread notifications`, 
          'info',
          'Unread Messages'
        );
      } else if (unreadNotifications.length === 1) {
        // If there's only one notification, show it
        const notification = unreadNotifications[0];
        const type = (notification.type as NotificationType) || 'info';
        notify(
          notification.message || 'New notification', 
          type,
          notification.title
        );
      }
      // We're leaving them unread so they'll show in the inbox
      // This prevents the screen from being hijacked by multiple notifications
    } catch (error) {
      console.error('Error checking for notifications:', error);
    }
  }, [user, notify]);

  // Check for new notifications on mount and when user changes
  useEffect(() => {
    if (user?.user_id) {
      checkForNewNotifications();
    }
  }, [user?.user_id]);

  // Initialize the notification manager so it can be used outside of React components
  useEffect(() => {
    initializeNotificationManager(notify, checkForNewNotifications);
  }, [notify, checkForNewNotifications]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      notify, 
      removeNotification, 
      checkForNewNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
