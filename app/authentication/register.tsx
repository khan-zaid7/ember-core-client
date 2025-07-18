import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import tw from 'twrnc';

import AuthFooter from '@/components/AuthFooter';
import EmberLogo from '@/components/EmberLogo';
import { FormInput } from '@/components/FormInput';
import LoadingSpinner from '@/components/LoadingSpinner';

import { useRouter } from 'expo-router';
import React from 'react';
import { screenSize } from '@/src/utils/reponsive';
import { insertUserOffline } from '@/services/models/UserModel';

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone_number: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    role: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('');
  const [roleItems, setRoleItems] = useState([
    { label: 'Field Worker', value: 'fieldworker' },
    { label: 'Volunteer', value: 'volunteer' },
    { label: 'Coordinator', value: 'coordinator' },
  ]);
  const [loading, setLoading] = useState(false);

  const isTablet = screenSize.isTablet;

  useEffect(() => {
    setForm((prev) => ({ ...prev, role }));
  }, [role]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    let error = '';
    if (key === 'name' && !value.trim()) error = 'Name is required.';
    if (key === 'email') {
      if (!value.trim()) error = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email.';
    }
    if (key === 'password') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!value) error = 'Password is required.';
      else if (!passwordRegex.test(value))
        error = 'Password must be at least 6 characters, include uppercase, lowercase, and a number.';
    }
    if (key === 'phone_number' && value && !/^[0-9\-\+]{9,15}$/.test(value))
      error = 'Invalid phone number.';

    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const validateForm = () => {
    const { name, email, password, role, phone_number } = form;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    const phoneRegex = /^[0-9\-\+]{9,15}$/;
    const allowedRoles = ['admin', 'fieldworker', 'volunteer', 'coordinator'];

    if (!name.trim() || !email.trim() || !password || !role) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return false;
    }

    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validation Error', 'Invalid email format.');
      return false;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert('Validation Error', 'Password must include uppercase, lowercase, number and be at least 6 characters.');
      return false;
    }

    if (!allowedRoles.includes(role.toLowerCase())) {
      Alert.alert('Validation Error', 'Invalid role selected.');
      return false;
    }

    if (phone_number && !phoneRegex.test(phone_number.trim())) {
      Alert.alert('Validation Error', 'Invalid phone number format.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const user_id = await insertUserOffline(form);
      Alert.alert('Saved Offline', `User stored locally with ID:\n${user_id}`);
      router.push('/authentication/login');
    } catch (error: any) {
      console.log('❌ Error saving user:', error);
      Alert.alert('Error', error.message || 'Failed to save user offline');
    }
  };

  return (
    <>
      {loading && <LoadingSpinner />}

      <LinearGradient
        colors={["#f97316", "#fde68a"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          style={{ width: '100%' }}
        >
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
              <View style={{ alignItems: 'center', marginBottom: 6 }}>
                <EmberLogo />
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#f97316', marginTop: 2 }}>Register</Text>
              </View>
              <View style={{ marginTop: 8 }}>
                {/* Name */}
                <View style={{ marginBottom: 4 }}>
                  <FormInput
                    value={form.name}
                    onChangeText={(val) => handleChange('name', val)}
                    placeholder="Name"
                    theme="light"
                  />
                  <View style={{ minHeight: 18, marginTop: 2 }}>
                    <Text style={{ color: '#ef4444', fontSize: 12 }}>
                      {errors.name || ' '}
                    </Text>
                  </View>
                </View>
                {/* Email */}
                <View style={{ marginBottom: 4 }}>
                  <FormInput
                    value={form.email}
                    onChangeText={(val) => handleChange('email', val)}
                    placeholder="Email"
                    keyboardType="email-address"
                    theme="light"
                  />
                  <View style={{ minHeight: 18, marginTop: 2 }}>
                    <Text style={{ color: '#ef4444', fontSize: 12 }}>
                      {errors.email || ' '}
                    </Text>
                  </View>
                </View>
                {/* Password */}
                <View style={{ marginBottom: 4 }}>
                  <FormInput
                    value={form.password}
                    onChangeText={(val) => handleChange('password', val)}
                    placeholder="Password"
                    secureTextEntry
                    showToggle
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    theme="light"
                  />
                  <View style={{ minHeight: 18, marginTop: 2 }}>
                    <Text style={{ color: '#ef4444', fontSize: 12 }}>
                      {errors.password || ' '}
                    </Text>
                  </View>
                </View>
                {/* Role Dropdown */}
                <View style={{ marginBottom: 4 }}>
                  <DropDownPicker
                    open={open}
                    value={role}
                    items={roleItems}
                    setOpen={setOpen}
                    setValue={setRole}
                    setItems={setRoleItems}
                    placeholder="Select Role"
                    placeholderStyle={{ color: '#555', fontSize: 14 }}
                    style={{
                      backgroundColor: '#fff',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      height: 48,
                    }}
                    textStyle={{ color: '#1c130d', fontSize: 14 }}
                    dropDownContainerStyle={{
                      backgroundColor: '#fff',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                    ArrowUpIconComponent={() => <Text style={{ color: '#1c130d' }}>▲</Text>}
                    ArrowDownIconComponent={() => <Text style={{ color: '#1c130d' }}>▼</Text>}
                    showArrowIcon
                    listMode="SCROLLVIEW"
                    zIndex={1000}
                  />
                  <View style={{ minHeight: 18, marginTop: 2 }}>
                    <Text style={{ color: '#ef4444', fontSize: 12 }}>
                      {errors.role || ' '}
                    </Text>
                  </View>
                </View>
                {/* Phone Number */}
                <View style={{ marginBottom: 4 }}>
                  <FormInput
                    value={form.phone_number}
                    onChangeText={(val) => handleChange('phone_number', val)}
                    placeholder="Phone Number (Optional)"
                    keyboardType="phone-pad"
                    theme="light"
                  />
                  <View style={{ minHeight: 18, marginTop: 2 }}>
                    <Text style={{ color: '#ef4444', fontSize: 12 }}>
                      {errors.phone_number || ' '}
                    </Text>
                  </View>
                </View>
                {/* Sign Up Button */}
                <TouchableOpacity
                  onPress={handleRegister}
                  style={{
                    backgroundColor: '#f97316',
                    borderRadius: 10,
                    height: 48,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 2,
                    marginBottom: 0,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
              <AuthFooter label="Already have an account?" link="/authentication/login" />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </LinearGradient>
    </>
  );
}
