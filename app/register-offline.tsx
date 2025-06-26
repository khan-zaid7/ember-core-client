import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmberLogo from '../components/EmberLogo';
import { FormInput } from '../components/FormInput';

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

export default function RegisterOffline() {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);

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
    <LinearGradient
      colors={["#f97316", "#fde68a"]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      {/* Top Status Bar - fixed and always visible */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: topBarColor, zIndex: 100 }} />
      <SafeAreaView style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 16 }}>
        <View style={{ width: '100%', maxWidth: 420, alignItems: 'center', paddingHorizontal: 8, margin: 12 }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.10,
            shadowRadius: 8,
            elevation: 4,
            paddingHorizontal: 24,
            paddingVertical: 6,
            width: '100%',
            minWidth: 0,
          }}> 
            <View style={{ alignItems: 'center', marginBottom:0}}> 
              <EmberLogo />
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#f97316', marginTop: 0 }}>Register Patient</Text>
              <Text style={{ fontSize: 15, color: '#64748b', marginTop: 4, textAlign: 'center' }}>Let's get started with your registration</Text>
            </View>
            {showSuccess && (
              <Animatable.View
                animation="bounceIn"
                duration={600}
                style={{ backgroundColor: '#bbf7d0', borderColor: '#86efac', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 }}
              >
                <Text style={{ color: '#166534', textAlign: 'center', fontWeight: '600' }}>✅ Saved successfully!</Text>
              </Animatable.View>
            )}
            {/* Personal Info Section */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 4, marginTop: 15 }}>Personal Info</Text>
            <View style={{ marginBottom: 4 }}> 
              <FormInput
                value={form.registrationId}
                onChangeText={text => handleChange('registrationId', text)}
                placeholder="Registration ID"
                theme="light"
              />
              <View style={{ minHeight: 18, marginTop: 2 }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>
                  {errors.registrationId || ' '}
                </Text>
              </View>
            </View>
            <View style={{ marginBottom: 4 }}> 
              <FormInput
                value={form.fullName}
                onChangeText={text => handleChange('fullName', text)}
                placeholder="Person Name"
                theme="light"
              />
              <View style={{ minHeight: 18, marginTop: 2 }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>
                  {errors.fullName || ' '}
                </Text>
              </View>
            </View>
            <View style={{ marginBottom: 4 }}> 
              <FormInput
                value={form.age}
                onChangeText={text => handleChange('age', text)}
                placeholder="Age"
                theme="light"
                keyboardType="numeric"
              />
              <View style={{ minHeight: 18, marginTop: 2 }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>
                  {errors.age || ' '}
                </Text>
              </View>
            </View>
            <View style={{ marginBottom: 6 }}>
              {/* Custom Gender Dropdown */}
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  height: 44,
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
                  <Text style={{ color: form.gender ? '#1e293b' : '#64748b', fontSize: 16 }}>
                    {form.gender || 'Select Gender'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setGenderModalVisible(!genderModalVisible)}
                  activeOpacity={0.7}
                  style={{ paddingLeft: 8, height: '100%', justifyContent: 'center' }}
                >
                  <Ionicons name="chevron-down" size={20} color="#64748b" />
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
                        style={{ paddingVertical: 12, paddingHorizontal: 18, alignItems: 'flex-start' }}
                      >
                        <Text style={{ fontSize: 16, color: '#1e293b' }}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>
              <View style={{ minHeight: 18, marginTop: 2 }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>
                  {errors.gender || ' '}
                </Text>
              </View>
            </View>
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 8 }} />
            {/* Registration Details Section */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 4 }}>Registration Details</Text>
            <View style={{ marginBottom: 4 }}> 
              <FormInput
                value={form.userId}
                onChangeText={text => handleChange('userId', text)}
                placeholder="User ID"
                theme="light"
              />
              <View style={{ minHeight: 18, marginTop: 2 }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>
                  {errors.userId || ' '}
                </Text>
              </View>
            </View>
            <View style={{ marginBottom: 4 }}> 
              <FormInput
                value={form.locationId}
                onChangeText={text => handleChange('locationId', text)}
                placeholder="Location ID"
                theme="light"
              />
              <View style={{ minHeight: 18, marginTop: 2 }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>
                  {errors.locationId || ' '}
                </Text>
              </View>
            </View>
            <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}> 
              <View style={{ flex: 1 }}>
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
                  <Text style={{ color: '#ef4444', fontSize: 12 }}>
                    {errors.timestamp || ' '}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleGetNow}
                style={{ backgroundColor: '#f97316', paddingHorizontal: 14, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Get Now</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                backgroundColor: isFormValid ? '#f97316' : '#fbbf24',
                height: 48,
                borderRadius: 10,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 2,
                marginBottom: 15,
                opacity: isFormValid ? 1 : 0.7,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              disabled={!isFormValid}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16}}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}