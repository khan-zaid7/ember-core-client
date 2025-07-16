import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView, RectButton, ScrollView, Swipeable } from 'react-native-gesture-handler';
import { Footer, useFooterNavigation } from '../components/Footer';
import DashboardHeader from '../components/Header';
import SettingsComponent from '../components/SettingsComponent';
import { useAuth } from '../context/AuthContext';
import {
  NotificationModel,
  archiveNotification as archiveNotificationModel,
  deleteNotification as deleteNotificationModel,
  getNotificationsByUserId,
  getUnreadNotificationsByUserId,
  markNotificationAsRead
} from '../services/models/NotificationModel';

// Define notification item structure for UI representation
type NotificationItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  time: string;
  read: number;
  model: NotificationModel;
};

export default function InboxScreen() {
  const router = useRouter();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('inbox', () => setSettingsModalVisible(true));
  const { user } = useAuth();
  
  // Track open swipeable to close any previously opened one
  const swipeableRefs = useRef<Array<Swipeable | null>>([]);
  
  // State to manage notification list
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return diffMins === 1 ? '1m' : `${diffMins}m`;
    }
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) {
      return diffHours === 1 ? '1h' : `${diffHours}h`;
    }
    
    const diffDays = Math.round(diffHours / 24);
    return diffDays === 1 ? '1d' : `${diffDays}d`;
  };

  // Helper function to determine appropriate icon based on notification type
  const getNotificationIcon = (type?: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'task':
        return 'checkmark-circle-outline';
      case 'message':
        return 'chatbubble-ellipses-outline';
      case 'alert':
        return 'alert-circle-outline';
      case 'reminder':
        return 'time-outline';
      case 'update':
        return 'refresh-outline';
      default:
        return 'notifications-outline';
    }
  };

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    try {
      if (!user) {
        console.log('No user found, skipping notification fetch');
        return;
      }

      setLoading(true);
      // Get notifications for the current user based on filter
      const notificationsFromDB = showOnlyUnread 
        ? getUnreadNotificationsByUserId(user.user_id)
        : getNotificationsByUserId(user.user_id);
      
      // Transform notifications to UI format
      const notificationItems: NotificationItem[] = notificationsFromDB.map(notification => ({
        id: notification.notification_id,
        icon: getNotificationIcon(notification.type),
        title: notification.title || 'Notification',
        message: notification.message,
        time: formatRelativeTime(notification.received_at),
        read: notification.read || 0,
        model: notification,
      }));
      
      setNotifications(notificationItems);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on component mount and when filter changes
  useEffect(() => {
    fetchNotifications();
  }, [showOnlyUnread]);
  
  // Refresh notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user?.user_id]);
  
  // Handle marking a notification as read when viewed
  const handleReadNotification = (id: string) => {
    try {
      markNotificationAsRead(id);
      setNotifications(current =>
        current.map(item => 
          item.id === id ? { ...item, read: 1 } : item
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle archiving notification - Archive is implemented as setting a special flag
  const archiveNotification = (id: string) => {
    Alert.alert(
      "Archive Notification",
      "This notification will be archived",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Archive", 
          onPress: () => {
            try {
              // Archive notification in database using the model function
              archiveNotificationModel(id);
              
              // Remove from current view
              setNotifications(current => 
                current.filter(notification => notification.id !== id)
              );
            } catch (error) {
              console.error('Failed to archive notification:', error);
              Alert.alert('Error', 'Failed to archive notification');
            }
          }
        }
      ]
    );
  };
  
  // Handle deleting notification
  const deleteNotification = (id: string) => {
    Alert.alert(
      "Delete Notification",
      "This notification will be permanently deleted",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            try {
              // Delete notification from database using the model function
              deleteNotificationModel(id);
              
              // Remove from current view
              setNotifications(current => 
                current.filter(notification => notification.id !== id)
              );
            } catch (error) {
              console.error('Failed to delete notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          }
        }
      ]
    );
  };

  // Render left action - Archive button
  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, id: string) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <RectButton 
        style={{
          backgroundColor: '#22c55e', // Green for archive
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          height: '100%'
        }}
        onPress={() => archiveNotification(id)}
      >
        <Animated.View
          style={[{
            transform: [{ translateX: trans }],
            justifyContent: 'center',
            alignItems: 'center',
          }]}
        >
          <MaterialIcons name="archive" size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Archive</Text>
        </Animated.View>
      </RectButton>
    );
  };

  // Render right action - Delete button
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, id: string) => {
    const trans = dragX.interpolate({
      inputRange: [-101, -100, -50, 0],
      outputRange: [1, 0, 0, -20],
      extrapolate: 'clamp',
    });
    
    return (
      <RectButton 
        style={{
          backgroundColor: '#ef4444', // Red for delete
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          height: '100%'
        }}
        onPress={() => deleteNotification(id)}
      >
        <Animated.View
          style={[{
            transform: [{ translateX: trans }],
            justifyContent: 'center',
            alignItems: 'center',
          }]}
        >
          <MaterialIcons name="delete" size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Delete</Text>
        </Animated.View>
      </RectButton>
    );
  };

  // Render a single notification item with swipe actions
  const renderNotificationItem = (notification: NotificationItem, index: number) => {
    return (
      <Swipeable
        key={notification.id}
        ref={ref => {
          if (ref) {
            swipeableRefs.current[index] = ref;
          }
        }}
        friction={2}
        leftThreshold={40}
        rightThreshold={40}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, notification.id)}
        onSwipeableOpen={() => {
          // Close any other open swipeables
          swipeableRefs.current.forEach((ref, idx) => {
            if (ref && idx !== index) {
              ref.close();
            }
          });
        }}
      >
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => {
            if (notification.read === 0) {
              handleReadNotification(notification.id);
            }
          }}
        >
          <View 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              minHeight: 72,
              backgroundColor: notification.read === 0 ? '#f8f4ed' : 'white'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <View 
                style={{ 
                  backgroundColor: notification.read === 0 ? '#f0e6d8' : '#f4eee7', 
                  width: 48, 
                  height: 48, 
                  borderRadius: 8, 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Ionicons name={notification.icon} size={24} color="#1c150d" />
                {notification.read === 0 && (
                  <View 
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#ef4444'
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text 
                  style={{ 
                    fontSize: 16, 
                    fontWeight: notification.read === 0 ? '600' : '500', 
                    color: '#1c150d',
                    marginBottom: 4
                  }}
                  numberOfLines={1}
                >
                  {notification.title}
                </Text>
                <Text 
                  style={{ 
                    fontSize: 14, 
                    color: notification.read === 0 ? '#604020' : '#9c7649'
                  }}
                  numberOfLines={2}
                >
                  {notification.message}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: '#9c7649', marginLeft: 8 }}>
              {notification.time}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Filter notifications to show only unread ones
  const filteredNotifications = showOnlyUnread 
    ? notifications.filter(notification => notification.read === 0) 
    : notifications;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <DashboardHeader
          title="Inbox"
          showSettings
          onSettingsPress={() => setSettingsModalVisible(true)}
          onBackPress={() => router.back()}
        />

        <SettingsComponent
          visible={settingsModalVisible}
          onClose={() => setSettingsModalVisible(false)}
        />

        <View style={{ flex: 1 }}>
          {/* Filter toggle */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center', 
            paddingVertical: 8, 
            paddingHorizontal: 16, 
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#f4eee7'
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: showOnlyUnread ? '#f4eee7' : 'transparent',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
              }}
              onPress={() => setShowOnlyUnread(!showOnlyUnread)}
            >
              <Ionicons 
                name={showOnlyUnread ? 'filter' : 'filter-outline'} 
                size={18} 
                color="#9c7649" 
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: '#9c7649', fontSize: 14 }}>
                {showOnlyUnread ? 'Showing unread only' : 'Show all notifications'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl 
                refreshing={loading}
                onRefresh={fetchNotifications}
                colors={['#9c7649']}
                tintColor="#9c7649"
              />
            }
          >
            {loading ? (
              <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Text style={{ color: '#9c7649', marginTop: 10, fontSize: 16 }}>Loading notifications...</Text>
              </View>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => renderNotificationItem(notification, index))
            ) : (
              <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Ionicons name="mail-open-outline" size={48} color="#9c7649" />
                <Text style={{ color: '#9c7649', marginTop: 10, fontSize: 16 }}>
                  {showOnlyUnread ? 'No unread notifications' : 'No notifications'}
                </Text>
              </View>
            )}
          </ScrollView>

          <Footer activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
