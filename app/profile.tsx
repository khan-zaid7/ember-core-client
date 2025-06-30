import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DashboardHeader from '../components/Header';
import { Footer, useFooterNavigation } from '@/components/Footer';

export default function ProfileScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [gender, setGender] = useState('');
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));
  const [photo, setPhoto] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBiKUSy4WSblHPiDW8MZRUm_GKWsTVZq9CmgkSnQQ-xM1_7UtWrSlgQ7eR-lN1vEOqpBzhHI7VYyR3wNNHqKFMshFz_sGWOCZRRqhEYOxHnshI9ha9VEQPeBDosLMfiY5iNsjbQTUe35UQh-0sl_rrVZ71mXttBv8K9S6RUtG3gxKVC-DLbS0cpkZQJ2-NH1dc6iQw7ydhucua_WL8eM1tHFvfeTr8XaGjgBabhi6X5iNa36o08nC03TlkoNeTr8huY5sG_cMMUR40'
  );

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

  const handleSave = () => {
    Alert.alert('Saved', 'Profile has been saved successfully!');
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
              Liam Bennett
            </Text>
            <Text style={{ fontSize: 16, color: '#8a7560' }}>Project Manager</Text>
          </View>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#181411', marginBottom: 4 }}>Email</Text>
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
              onPress={() => Alert.prompt('Enter Email', '', setEmail)}
            >
              <Text style={{ color: email ? '#181411' : '#64748b' }}>
                {email || 'Enter email'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Phone */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#181411', marginBottom: 4 }}>Phone</Text>
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
              onPress={() => Alert.prompt('Enter Phone', '', setPhone)}
            >
              <Text style={{ color: phone ? '#181411' : '#64748b' }}>
                {phone || 'Enter phone'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Gender */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#181411', marginBottom: 4 }}>Gender</Text>
            <TouchableOpacity
              onPress={() => setGenderModalVisible(true)}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 48,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 16, color: gender ? '#181411' : '#64748b' }}>
                {gender || 'Select Gender'}
              </Text>
              <Ionicons name="chevron-down" size={24} color="#64748b" />
            </TouchableOpacity>
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

      {/* Gender Modal */}
      <Modal visible={genderModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPressOut={() => setGenderModalVisible(false)}
        >
          <View style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, width: 260 }}>
            {['Male', 'Female', 'Other'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setGender(option);
                  setGenderModalVisible(false);
                }}
                style={{ paddingVertical: 16, paddingHorizontal: 18, alignItems: 'flex-start' }}
              >
                <Text style={{ fontSize: 18, color: '#1e293b' }}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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
