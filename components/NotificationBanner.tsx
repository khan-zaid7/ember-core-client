import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, Image } from 'react-native';
import { useNotification } from '../context/NotificationContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const NotificationBanner = () => {
  const { notifications, removeNotification } = useNotification();
  const backgroundColor = useThemeColor({ light: '#f7f7f7', dark: '#1c1c1e' }, 'background');
  // Define the app's primary orange color
  const orangeColor = '#FF9500';
  
  if (notifications.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]} pointerEvents="box-none">
      {notifications.map((n) => (
        <NotificationItem 
          key={n.id} 
          notification={n} 
          onDismiss={() => removeNotification(n.id)}
        />
      ))}
    </View>
  );
};

interface NotificationItemProps {
  notification: {
    id: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'warning';
    title?: string;
  };
  onDismiss: () => void;
}

const NotificationItem = ({ notification, onDismiss }: NotificationItemProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const router = useRouter();
  const orangeColor = '#FF9500'; // Orange color for app UI
  
  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Auto dismiss after a timeout
    const timeout = setTimeout(() => {
      dismissNotification();
    }, 6000); // 6 seconds to match iOS style
    
    return () => clearTimeout(timeout);
  }, []);
  
  const dismissNotification = () => {
    // Fade out animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      onDismiss();
    });
  };
  
  // Get notification app name based on type
  const getAppName = () => {
    switch(notification.type) {
      case 'success':
        return "SUCCESS";
      case 'error':
        return "ERROR";
      case 'warning':
        return "WARNING";
      case 'info':
      default:
        return "NOTICE";
    }
  };
  
  // Navigate to inbox when notification is clicked
  const handleNotificationPress = () => {
    // Navigate to inbox page first
    router.push('/inbox');
    
    // Then dismiss the notification after a short delay
    setTimeout(() => {
      dismissNotification();
    }, 100);
  };
  
  // iOS-style notification
  return (
    <TouchableOpacity activeOpacity={0.98} onPress={handleNotificationPress}>
      <Animated.View 
        style={[
          styles.banner,
          { 
            opacity, 
            transform: [{ translateY }]
          }
        ]}
      >
        {/* App icon */}
        <View style={[styles.iconCircle, { backgroundColor: orangeColor }]}>
          <Ionicons 
            name={notification.type === 'success' ? 'checkmark' : 
                 notification.type === 'error' ? 'close' :
                 notification.type === 'warning' ? 'alert' : 'information'}
            size={16} 
            color="#FFFFFF" 
          />
        </View>
        
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.notificationHeader}>
            <Text style={[styles.appName, {color: orangeColor}]}>{getAppName()}</Text>
            <Text style={styles.timeStamp}>now</Text>
          </View>
          
          {/* Title */}
          <Text style={styles.title} numberOfLines={1}>
            {notification.title || "New Notification"}
          </Text>
          
          {/* Message */}
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
          
          {/* Subtitle - Device Info */}
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              Ember Core • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
            <Text style={styles.tapHint}>Tap to view</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 30,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  banner: {
    width: '95%',
    backgroundColor: 'rgba(250, 250, 250, 0.95)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
    marginVertical: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF9500', // Updated to orange
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  appName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500', // Updated to orange
    textTransform: 'uppercase',
  },
  timeStamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 3,
  },
  message: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 3,
    lineHeight: 19,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  tapHint: {
    fontSize: 11,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  info: { backgroundColor: '#FF9500' }, // Updated to orange
  error: { backgroundColor: '#FF3B30' }, // iOS red
  success: { backgroundColor: '#34C759' }, // iOS green
  warning: { backgroundColor: '#FF9500' }, // iOS orange
});

export default NotificationBanner;
