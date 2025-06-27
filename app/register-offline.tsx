import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

import DashboardFooter from '../components/Footer';
import { FormInput } from '../components/FormInput';
import DashboardHeader from '../components/Header';

// Types for form and errors
interface RegisterForm {
  registrationId: string;
  userId: string;
  fullName: string;
  age: string;
  gender: string;
  locationId: string;
  timestamp: string;
  synced: boolean;
  syncMessage: string;
}

interface FormErrors {
  registrationId?: string;
  userId?: string;
  fullName?: string;
  age?: string;
  gender?: string;
  locationId?: string;
  timestamp?: string;
}

const initialForm: RegisterForm = {
  registrationId: '',
  userId: '',
  fullName: '',
  age: '',
  gender: '',
  locationId: '',
  timestamp: '',
  synced: false,
  syncMessage: '',
};

// Add a helper to get formatted current timestamp
function getCurrentTimestamp() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

const mockLocations = [
  'Toronto',
  'Vancouver',
  'Montreal',
  'Calgary',
  'Ottawa',
];

export default function RegisterOffline() {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [footerTab, setFooterTab] = useState('dashboard');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const router = useRouter();

  const handleChange = (key: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Derive form validity without setting state
  const isAgeValid = /^\d+$/.test(form.age) && Number(form.age) >= 0 && Number(form.age) <= 120;
  const isFormValid =
    form.registrationId.trim() &&
    form.userId.trim() &&
    form.fullName.trim() &&
    isAgeValid &&
    form.gender.trim() &&
    form.locationId.trim() &&
    form.timestamp.trim();

  const validateForm = () => {
    const tempErrors: FormErrors = {};
    if (!form.registrationId.trim()) tempErrors.registrationId = 'Required';
    if (!form.userId.trim()) tempErrors.userId = 'Required';
    if (!form.fullName.trim()) tempErrors.fullName = 'Required';
    if (!form.age.trim()) tempErrors.age = 'Required';
    else if (!/^\d+$/.test(form.age) || Number(form.age) < 0 || Number(form.age) > 120) tempErrors.age = 'Enter a valid age (0-120)';
    if (!form.gender.trim()) tempErrors.gender = 'Required';
    if (!form.locationId.trim()) tempErrors.locationId = 'Required';
    if (!form.timestamp.trim()) tempErrors.timestamp = 'Required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleGetNow = () => {
    setForm(prev => ({ ...prev, timestamp: getCurrentTimestamp() }));
  };

  const handleSave = () => {
    if (!validateForm()) return;
    // MOCK LOGIC: Save form data locally
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setForm(initialForm);
  };

  // Top bar color logic
  const topBarColor = isFormValid ? '#22c55e' : '#ef4444'; // green-500 or red-500

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DashboardHeader 
        title="Ember Core" 
        showSettings={true} 
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.push('/home')}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 40, paddingBottom: 40, minHeight: 600 }}>
          <View style={{ width: '100%', maxWidth: 480, alignItems: 'center', paddingHorizontal: 0, margin: 0 }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 0,
              shadowColor: 'transparent',
              paddingHorizontal: 32,
              paddingVertical: 24,
              width: '100%',
              minWidth: 0,
              minHeight: 600,
            }}>
              {showSuccess && (
                <Animatable.View
                  animation="bounceIn"
                  duration={600}
                  style={{ backgroundColor: '#bbf7d0', borderColor: '#86efac', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 20 }}
                >
                  <Text style={{ color: '#166534', textAlign: 'center', fontWeight: '600' }}>✅ Saved successfully!</Text>
                </Animatable.View>
              )}
              {/* Personal Info Section */}
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#334155', marginBottom: 16, marginTop: 15 }}>Personal Info</Text>
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}> 
                <FormInput
                  value={form.fullName}
                  onChangeText={text => handleChange('fullName', text)}
                  placeholder="Person Name"
                  theme="light"
                />
                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 14 }}>
                    {errors.fullName || ' '}
                  </Text>
                </View>
              </View>
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}> 
                <FormInput
                  value={form.age}
                  onChangeText={text => handleChange('age', text)}
                  placeholder="Age"
                  theme="light"
                  keyboardType="numeric"
                />
                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 14 }}>
                    {errors.age || ' '}
                  </Text>
                </View>
              </View>
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                {/* Custom Gender Dropdown */}
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    height: 47,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setGenderModalVisible(!genderModalVisible)}
                    activeOpacity={0.8}
                    style={{ flex: 1, height: '100%', justifyContent: 'center' }}
                  >
                    <Text style={{ color: form.gender ? '#1e293b' : '#64748b', fontSize: 18 }}>
                      {form.gender || 'Select Gender'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setGenderModalVisible(!genderModalVisible)}
                    activeOpacity={0.7}
                    style={{ paddingLeft: 8, height: '100%', justifyContent: 'center' }}
                  >
                    <Ionicons name="chevron-down" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>
                <Modal
                  visible={genderModalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setGenderModalVisible(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPressOut={() => setGenderModalVisible(false)}
                  >
                    <View style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, width: 260, elevation: 8 }}>
                      {['Male', 'Female', 'Other'].map(option => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => {
                            handleChange('gender', option);
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
                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 14 }}>
                    {errors.gender || ' '}
                  </Text>
                </View>
              </View>
              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 18 }} />
              {/* Location Dropdown Section */}
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#334155', marginBottom: 16 }}>Location</Text>
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    height: 47,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    justifyContent: 'space-between',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setLocationModalVisible(true)}
                    activeOpacity={0.8}
                    style={{ flex: 1, height: '100%', justifyContent: 'center' }}
                  >
                    <Text style={{ color: form.locationId ? '#1e293b' : '#64748b', fontSize: 18 }}>
                      {form.locationId || 'Select Location'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setLocationModalVisible(true)}
                    activeOpacity={0.7}
                    style={{ paddingLeft: 8, height: '100%', justifyContent: 'center' }}
                  >
                    <Ionicons name="chevron-down" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>
                <Modal
                  visible={locationModalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setLocationModalVisible(false)}
                >
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPressOut={() => setLocationModalVisible(false)}
                  >
                    <View style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, width: 260, elevation: 8 }}>
                      {mockLocations.map(option => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => {
                            handleChange('locationId', option);
                            setLocationModalVisible(false);
                          }}
                          style={{ paddingVertical: 16, paddingHorizontal: 18, alignItems: 'flex-start' }}
                        >
                          <Text style={{ fontSize: 18, color: '#1e293b' }}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>
                <View style={{ minHeight: 18, marginTop: 2 }}>
                  <Text style={{ color: '#ef4444', fontSize: 14 }}>
                    {errors.locationId || ' '}
                  </Text>
                </View>
              </View>
              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 18 }} />
              {/* Timestamp Section */}
              <Text style={{ fontSize: 22, fontWeight: '700', color: '#334155', marginBottom: 16 }}>Timestamp</Text>
              <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12, height: 54 }}> 
                <View style={{ flex: 1, height: 54, justifyContent: 'center' }}>
                  <FormInput
                    value={form.timestamp}
                    onChangeText={() => {}}
                    placeholder="Timestamp"
                    theme="light"
                    keyboardType="default"
                    secureTextEntry={false}
                    editable={false}
                  />
                  <View style={{ minHeight: 18, marginTop: 2 }}>
                    <Text style={{ color: '#ef4444', fontSize: 14 }}>
                      {errors.timestamp || ' '}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleGetNow}
                  style={{ backgroundColor: '#f97316', paddingHorizontal: 18, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Get Now</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: isFormValid ? '#f97316' : '#fbbf24',
                  height: 54,
                  borderRadius: 12,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 8,
                  marginBottom: 20,
                  opacity: isFormValid ? 1 : 0.7,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                disabled={!isFormValid}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 18}}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <DashboardFooter
        activeTab={footerTab}
        onTabPress={tab => {
          setFooterTab(tab);
          if (tab === 'settings') setSettingsModalVisible(true);
        }}
      />
      {/* Settings Modal - styled like home.tsx */}
      <Modal visible={settingsModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -2 } }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#161412', marginBottom: 18 }}>Settings</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { setSettingsModalVisible(false); router.push('/profile' as any); }}>
              <MaterialIcons name="person" size={22} color="#f97316" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#161412' }}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { setSettingsModalVisible(false); router.push('/preferences' as any); }}>
              <MaterialIcons name="tune" size={22} color="#f97316" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#161412' }}>Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { setSettingsModalVisible(false); /* TODO: Add logout logic */ }}>
              <MaterialIcons name="logout" size={22} color="#f97316" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#f97316', fontWeight: 'bold' }}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 18 }} onPress={() => setSettingsModalVisible(false)}>
              <Text style={{ color: '#f97316', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}