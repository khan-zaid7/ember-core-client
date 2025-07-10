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
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DashboardHeader from '../components/Header';
import { Footer, useFooterNavigation } from '@/components/Footer';
import { updateUserOffline, getUserById } from '@/services/models/UserModel';
import { useAuth } from '@/context/AuthContext';
import SettingsComponent from '../components/SettingsComponent';
import { useLocalSearchParams } from 'expo-router';
import { insertLocationOffline, getUserLocation } from '@/services/models/LocationsModel';


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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

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

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (user?.user_id) {
        const loc = await getUserLocation(user.user_id);
        if (loc && loc.latitude && loc.longitude) {
          setLatitude(loc.latitude);
          setLongitude(loc.longitude);
        }
      }
    };
    fetchUserLocation();
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
      // Save user profile
      await updateUserOffline({
        user_id: userId,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role.trim().toLowerCase(),
        phone_number: form.phone_number.trim(),
        image_uri: photo,
      });

      // Save location if available
      if (latitude !== null && longitude !== null) {
        try {
          await insertLocationOffline({
            userId: userId,
            name: form.name.trim() + "'s Location",
            type: 'user',
            latitude,
            longitude,
            addedAt: new Date().toISOString(),
            description: 'Profile location',
          });
        } catch (err: any) {
          // Ignore duplicate error, show others
          if (!String(err.message).includes('already exists')) {
            Alert.alert('Location Error', err.message || 'Failed to save location.');
          }
        }
      }

      const updated = await getUserById(userId);
      applyUserDetails(updated);

      Alert.alert('Success', 'Profile has been saved successfully!');
    } catch (err: any) {
      console.error('❌ Failed to save user:', err);
      Alert.alert('Error', err.message || 'Something went wrong while saving.');
    }
  };


  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    const initials = words.map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
    return initials || 'U';
  };

  const params = useLocalSearchParams();
  useEffect(() => {
    if (params.latitude && params.longitude) {
      setLocation(`${params.latitude},${params.longitude}`);
    }
  }, [params.latitude, params.longitude]);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DashboardHeader
        title="Profile"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />

      <SettingsComponent
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ position: 'relative' }}>
              {photo && photo !== fallbackUrl ? (
                <Image
                  source={{ uri: photo }}
                  style={{ width: 128, height: 128, borderRadius: 64 }}
                />
              ) : (
                <View
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: 64,
                    backgroundColor: '#f97316',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 32, color: '#fff', fontWeight: 'bold' }}>
                    {getInitials(form.name)}
                  </Text>
                </View>
              )}
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
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => {
                router.push({
                  pathname: '/map',
                  params: {
                    picker: 'true',
                    returnTo: '/profile',
                  },
                });
              }}
            >
              <Text style={{ color: location ? '#181411' : '#64748b' }}>
                {location ? location : 'Get My Location'}
              </Text>
              <Ionicons name="location-outline" size={22} color="#f97316" />
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
    </SafeAreaView>
  );
}
