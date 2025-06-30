import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DashboardHeader from '../components/Header';
import { Footer, useFooterNavigation } from '@/components/Footer';
import { updateUserOffline, getUserById } from '@/services/models/UserModel';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    role: '',
  });

  const [onlineStatus, setOnlineStatus] = useState(false);
  const [location, setLocation] = useState('');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));

  const fallbackUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AX...'; // shortened

  const [photo, setPhoto] = useState(fallbackUrl);
  const [userId, setUserId] = useState<string | null>(null);
  const { user } = useAuth();

  // 🔁 DRY utility
  const applyUserDetails = (details: any) => {
    setForm({
      name: details.name || '',
      email: details.email || '',
      phone_number: details.phone_number || '',
      role: details.role || '',
    });
    setPhoto(details.image_url || fallbackUrl);
  };

  useEffect(() => {
    const loadUserDetails = async () => {
      if (user?.user_id) {
        setUserId(user.user_id);
        const details = await getUserById(user.user_id);
        applyUserDetails(details);
      }
    };
    loadUserDetails();
  }, [user?.user_id]);

  const handleAddPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!pickerResult.canceled) {
      setPhoto(pickerResult.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'User session not found.');
      return;
    }

    try {
      await updateUserOffline({
        user_id: userId,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role.trim().toLowerCase(),
        phone_number: form.phone_number.trim(),
        image_uri: photo,
      });

      const updated = await getUserById(userId);
      applyUserDetails(updated);

      Alert.alert('Success', 'Profile has been saved successfully!');
    } catch (err: any) {
      console.error('❌ Failed to save user:', err);
      Alert.alert('Error', err.message || 'Something went wrong while saving.');
    }
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DashboardHeader
        title="Profile"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: photo }}
                style={{ width: 128, height: 128, borderRadius: 64 }}
              />
              <TouchableOpacity
                onPress={handleAddPhoto}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#f97316',
                  padding: 6,
                  borderRadius: 16,
                }}
              >
                <MaterialIcons name="add-a-photo" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 8, color: '#181411' }}>
              {form.name}
            </Text>
            <Text style={{ fontSize: 16, color: '#8a7560' }}>
              {form.role ? form.role.charAt(0).toUpperCase() + form.role.slice(1).toLowerCase() : ''}
            </Text>

          </View>

          {/* Name */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#181411', marginBottom: 4 }}>Name</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 48,
                justifyContent: 'center',
                paddingHorizontal: 12,
              }}
            >
              <TextInput
                value={form.name}
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                placeholder="Enter name"
                placeholderTextColor="#9ca3af"
                style={{ fontSize: 16, color: '#181411' }}
              />
            </View>
          </View>


          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#181411', marginBottom: 4 }}>Email</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 48,
                justifyContent: 'center',
                paddingHorizontal: 12,
              }}
            >
              <TextInput
                value={form.email}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                placeholder="Enter email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                style={{ fontSize: 16, color: '#181411' }}
              />
            </View>
          </View>


          {/* Phone */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#181411', marginBottom: 4 }}>Phone</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 48,
                justifyContent: 'center',
                paddingHorizontal: 12,
              }}
            >
              <TextInput
                value={form.phone_number}
                onChangeText={(text) => setForm((prev) => ({ ...prev, phone_number: text }))}
                placeholder="Enter phone number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                style={{ fontSize: 16, color: '#181411' }}
              />
            </View>
          </View>

          {/* Location */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#181411', marginBottom: 4 }}>Location</Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 48,
                justifyContent: 'center',
                paddingHorizontal: 12,
              }}
              onPress={() => Alert.prompt('Enter Location', '', setLocation)}
            >
              <Text style={{ color: location ? '#181411' : '#64748b' }}>
                {location || 'Enter location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sync Status */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#181411' }}>Sync Status</Text>
              <Text style={{ fontSize: 14, color: '#8a7560' }}>Last Synced: 2024-07-26 10:30 AM</Text>
            </View>
            <Text style={{ fontSize: 16, color: '#181411' }}>Synced</Text>
          </View>

          {/* Online Status */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 16, color: '#181411' }}>Online Status</Text>
            <Switch
              trackColor={{ false: '#f5f2f0', true: '#22c55e' }}
              thumbColor="#ffffff"
              ios_backgroundColor="#f5f2f0"
              onValueChange={setOnlineStatus}
              value={onlineStatus}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: '#f97316',
              height: 48,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>

        <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      </View>

      {/* Settings Modal */}
      <Modal visible={settingsModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.18)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 18 }}>Settings</Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
              onPress={() => {
                setSettingsModalVisible(false);
                router.push('/profile');
              }}
            >
              <MaterialIcons name="person" size={22} color="#f97316" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16 }}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
              onPress={() => {
                setSettingsModalVisible(false);
                router.push('/preferences');
              }}
            >
              <MaterialIcons name="tune" size={22} color="#f97316" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16 }}>Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
            >
              <MaterialIcons name="logout" size={22} color="#f97316" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#f97316' }}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSettingsModalVisible(false)}
              style={{ alignSelf: 'center', marginTop: 18 }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#f97316' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
