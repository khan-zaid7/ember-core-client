import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { ScrollView, GestureHandlerRootView, RectButton, Swipeable } from 'react-native-gesture-handler';
import DashboardHeader from '../components/Header';
import { Footer, useFooterNavigation } from '../components/Footer';
import SettingsComponent from '../components/SettingsComponent';

// Define notification item structure
type NotificationItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  time: string;
};

export default function InboxScreen() {
  const router = useRouter();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('inbox', () => setSettingsModalVisible(true));
  
  // Track open swipeable to close any previously opened one
  const swipeableRefs = useRef<Array<Swipeable | null>>([]);
  
  // State to manage notification list
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      icon: 'notifications-outline',
      title: 'Task Reminder',
      message: "Your task 'Project Alpha' is due today.",
      time: '1h'
    },
    {
      id: '2',
      icon: 'chatbubble-ellipses-outline',
      title: 'Comment Received',
      message: "New comment on 'Team Meeting Prep'.",
      time: '2h'
    },
    {
      id: '3',
      icon: 'people-outline',
      title: 'Project Invitation',
      message: "You've been added to the 'Marketing Campaign' project.",
      time: '3h'
    },
    {
      id: '4',
      icon: 'checkmark-circle-outline',
      title: 'Request Approved',
      message: "Your request for 'Vacation Leave' has been approved.",
      time: '4h'
    },
    {
      id: '5',
      icon: 'time-outline',
      title: 'Task Overdue',
      message: "Your task 'Client Presentation' is overdue.",
      time: '5h'
    },
    {
      id: '6',
      icon: 'document-outline',
      title: 'File Uploaded',
      message: "New file uploaded to 'Project Beta'.",
      time: '6h'
    }
  ]);
  
  // Handle archiving notification
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
            setNotifications(current => 
              current.filter(notification => notification.id !== id)
            );
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
            setNotifications(current => 
              current.filter(notification => notification.id !== id)
            );
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
        renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, notification.id)}
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
        <View 
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            minHeight: 72,
            backgroundColor: '#fcfaf8'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
            <View 
              style={{ 
                backgroundColor: '#f4eee7', 
                width: 48, 
                height: 48, 
                borderRadius: 8, 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Ionicons name={notification.icon} size={24} color="#1c150d" />
            </View>
            <View style={{ flex: 1 }}>
              <Text 
                style={{ 
                  fontSize: 16, 
                  fontWeight: '500', 
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
                  color: '#9c7649' 
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
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfaf8' }}>
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
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => renderNotificationItem(notification, index))
            ) : (
              <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Ionicons name="mail-open-outline" size={48} color="#9c7649" />
                <Text style={{ color: '#9c7649', marginTop: 10, fontSize: 16 }}>No notifications</Text>
              </View>
            )}
          </ScrollView>

          <Footer activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
