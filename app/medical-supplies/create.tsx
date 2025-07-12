import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Footer, useFooterNavigation } from '@/components/Footer';
import { FormInput } from '../../components/FormInput';
import DashboardHeader from '../../components/Header';
import SettingsComponent from '../../components/SettingsComponent';
import { insertSupplyOffline } from '@/services/models/SuppliesModel';
import { useAuth } from '@/context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SupplyForm {
  itemName: string;
  quantity: string;
  expiryDate: string;
  locationId: string;
  timestamp: string;
  barcode?: string;
  sku?: string;
}

interface FormErrors {
  itemName?: string;
  quantity?: string;
  expiryDate?: string;
  locationId?: string;
  timestamp?: string;
  barcode?: string;
  sku?: string;
}

const initialForm: SupplyForm = {
  itemName: '',
  quantity: '',
  expiryDate: '',
  locationId: '',
  timestamp: '',
  barcode: '',
  sku: '',
};

function getCurrentTimestamp() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

const mockLocations = ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'];

function formatDateTime(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function RegisterSupply() {
  const [form, setForm] = useState<SupplyForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [expiryPickerVisible, setExpiryPickerVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // On mount, check for latitude/longitude in params and update state
  useEffect(() => {
    if (params.latitude && params.longitude) {
      setLocation({
        latitude: parseFloat(params.latitude as string),
        longitude: parseFloat(params.longitude as string),
      });
    }
  }, [params.latitude, params.longitude]);

  // Restore form fields from params if present
  useEffect(() => {
    if (params.itemName || params.quantity || params.expiryDate || params.timestamp) {
      setForm(prev => ({
        ...prev,
        itemName: params.itemName ? String(params.itemName) : prev.itemName,
        quantity: params.quantity ? String(params.quantity) : prev.quantity,
        expiryDate: params.expiryDate ? String(params.expiryDate) : prev.expiryDate,
        timestamp: params.timestamp ? String(params.timestamp) : prev.timestamp,
      }));
    }
  }, [params.itemName, params.quantity, params.expiryDate, params.timestamp]);

  useEffect(() => {
    if (location) {
      setForm(prev => ({
        ...prev,
        locationId: `${location.latitude},${location.longitude}`,
      }));
    }
  }, [location]);

  const handleChange = (key: keyof SupplyForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isQuantityValid = /^\d+$/.test(form.quantity) && Number(form.quantity) > 0;
  const isFormValid =
    form.itemName.trim() &&
    isQuantityValid &&
    form.expiryDate.trim() &&
    form.locationId.trim() &&
    form.timestamp.trim();

  const validateForm = () => {
    const tempErrors: FormErrors = {};
    if (!form.itemName.trim()) tempErrors.itemName = 'Required';
    if (!form.quantity.trim()) tempErrors.quantity = 'Required';
    else if (!/^\d+$/.test(form.quantity) || Number(form.quantity) <= 0) tempErrors.quantity = 'Enter a valid quantity';
    if (!form.expiryDate.trim()) tempErrors.expiryDate = 'Required';
    if (!form.locationId.trim()) tempErrors.locationId = 'Required';
    if (!form.timestamp.trim()) tempErrors.timestamp = 'Required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleGetNow = () => {
    setForm(prev => ({ ...prev, timestamp: getCurrentTimestamp() }));
  };

  const handleExpiryDatePicked = (event: any, selectedDate?: Date) => {
    setExpiryPickerVisible(false);
    if (selectedDate) {
      handleChange('expiryDate', formatDateTime(selectedDate));
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (!user || !user.user_id) {
      Alert.alert('Error', 'No user is logged in');
      return;
    }
    try {
      insertSupplyOffline({
        userId: user.user_id,
        itemName: form.itemName,
        quantity: form.quantity,
        expiryDate: form.expiryDate,
        locationId: location ? `${location.latitude},${location.longitude}` : '',
        timestamp: form.timestamp,
        barcode: form.barcode,
        sku: form.sku
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setForm(initialForm);
      setLocation(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DashboardHeader
        title="Register Supplies"
        showSettings={true}
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, alignItems: 'center', paddingBottom: 40, minHeight: 600 }}>
          <View style={{ width: '100%', maxWidth: 480, paddingHorizontal: 0 }}>
            <View style={{ backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 24, width: '100%' }}>
              {showSuccess && (
                <View style={{ backgroundColor: '#bbf7d0', borderColor: '#86efac', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 20 }}>
                  <Text style={{ color: '#166534', textAlign: 'center', fontWeight: '600' }}>✅ Saved successfully!</Text>
                </View>
              )}

              {/* Item Name */}
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16 }}>Item Info</Text>
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <FormInput
                  value={form.itemName}
                  onChangeText={text => handleChange('itemName', text)}
                  placeholder="Item Name"
                  theme="light"
                  fontSize={16}
                />
                <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 2 }}>{errors.itemName || ' '}</Text>
              </View>

              {/* Quantity */}
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <FormInput
                  value={form.quantity}
                  onChangeText={text => handleChange('quantity', text)}
                  placeholder="Quantity"
                  theme="light"
                  keyboardType="numeric"
                  fontSize={16}
                />
                <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 2 }}>{errors.quantity || ' '}</Text>
              </View>
              
              {/* Barcode */}
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16 }}>Inventory Tracking</Text>
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <FormInput
                  value={form.barcode || ''}
                  onChangeText={text => handleChange('barcode', text)}
                  placeholder="Barcode (Optional)"
                  theme="light"
                  fontSize={16}
                />
                <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 2 }}>{errors.barcode || ' '}</Text>
              </View>
              
              {/* SKU */}
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <FormInput
                  value={form.sku || ''}
                  onChangeText={text => handleChange('sku', text)}
                  placeholder="SKU (Optional)"
                  theme="light"
                  fontSize={16}
                />
                <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 2 }}>{errors.sku || ' '}</Text>
              </View>

              {/* Expiry Date Row */}
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16 }}>Expiry Date</Text>
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', height: 54 }}>
                  <View style={{ flex: 1, height: 54, justifyContent: 'center' }}>
                    <FormInput
                      value={form.expiryDate}
                      onChangeText={() => {}}
                      placeholder="Expiry Date"
                      theme="light"
                      editable={false}
                      fontSize={16}
                      height={44}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setExpiryPickerVisible(true)}
                    style={{ backgroundColor: '#f97316', paddingHorizontal: 18, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Pick Date</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 2 }}>{errors.expiryDate || ' '}</Text>
              </View>
              {/* DateTimePicker: no modal, direct render, Done button below */}
              {expiryPickerVisible && (
                <View style={{ marginBottom: 18, alignItems: 'center' }}>
                  <DateTimePicker
                    value={form.expiryDate && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(form.expiryDate) ? new Date(form.expiryDate.replace(' ', 'T')) : new Date()}
                    mode="date"
                    display={Platform.OS === 'android' ? 'calendar' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setExpiryPickerVisible(false);
                        if (event.type === 'set' && selectedDate) {
                          handleChange('expiryDate', formatDateTime(selectedDate));
                        }
                      } else {
                        if (selectedDate) {
                          handleChange('expiryDate', formatDateTime(selectedDate));
                        }
                      }
                    }}
                    style={{ width: 250 }}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity onPress={() => setExpiryPickerVisible(false)} style={{ marginTop: 8, marginBottom: 18, backgroundColor: '#f97316', borderRadius: 8, paddingHorizontal: 18, height: 44, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Location */}
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16 }}>Location</Text>
              <View style={{ marginBottom: 18, height: 54, justifyContent: 'center' }}>
                <TouchableOpacity
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
                  onPress={() => {
                    router.push({
                      pathname: '/map',
                      params: {
                        picker: 'true',
                        returnTo: '/medical-supplies/create',
                        itemName: form.itemName,
                        quantity: form.quantity,
                        expiryDate: form.expiryDate,
                        timestamp: form.timestamp,
                      },
                    });
                  }}
                >
                  <Text style={{ color: location ? '#1e293b' : '#64748b', fontSize: 16 }}>
                    {location ? `Lat: ${location.latitude.toFixed(5)}, Lng: ${location.longitude.toFixed(5)}` : 'Get My Location'}
                  </Text>
                  <Ionicons name="location-outline" size={22} color="#f97316" />
                </TouchableOpacity>
                <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 2 }}>{errors.locationId || ' '}</Text>
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
                  <View style={{ backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, width: 260 }}>
                    {mockLocations.map(option => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => {
                          handleChange('locationId', option);
                          setLocationModalVisible(false);
                        }}
                        style={{ paddingVertical: 16, paddingHorizontal: 18 }}
                      >
                        <Text style={{ fontSize: 16, color: '#1e293b' }}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>

              {/* Timestamp Row */}
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16 }}>Timestamp</Text>
              <View style={{ marginBottom: 24, height: 54, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', height: 54 }}>
                  <View style={{ flex: 1, height: 54, justifyContent: 'center' }}>
                    <FormInput
                      value={form.timestamp}
                      onChangeText={() => { }}
                      placeholder="Timestamp"
                      theme="light"
                      editable={false}
                      fontSize={16}
                      height={44}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleGetNow}
                    style={{ backgroundColor: '#f97316', paddingHorizontal: 18, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Get Now</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 2 }}>{errors.timestamp || ' '}</Text>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: isFormValid ? '#f97316' : '#fbbf24',
                  height: 54,
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 8,
                  marginBottom: 20,
                  opacity: isFormValid ? 1 : 0.7,
                }}
                disabled={!isFormValid}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
    </SafeAreaView>
  );
}
