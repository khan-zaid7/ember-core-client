import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNotification } from '../context/NotificationContext';

const NotificationBanner = () => {
  const { notifications } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((n) => (
        <Animated.View key={n.id} style={[styles.banner, styles[n.type]]}>
          <Text style={styles.text}>{n.message}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  banner: {
    marginVertical: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  info: { backgroundColor: '#2196F3' },
  error: { backgroundColor: '#F44336' },
  success: { backgroundColor: '#4CAF50' },
  warning: { backgroundColor: '#FF9800' },
});

export default NotificationBanner;
