import { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import tw from 'twrnc';

import EmberLogo from '../components/EmberLogo';
import AuthFooter from '../components/AuthFooter';
import { FormInput } from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';

import {
  screenSize,
  moderateScale,
  verticalScale,
} from '../src/utils/reponsive';
import { useRouter } from 'expo-router';
import api from '@/src/utils/axiosConfig';
import React from 'react';

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
  });

  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('');
  const [roleItems, setRoleItems] = useState([
    { label: 'admin', value: 'admin' },
    { label: 'fieldworker', value: 'fieldworker' },
    { label: 'volunteer', value: 'volunteer' },
    { label: 'coordinator', value: 'coordinator' },
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
    if (key === 'password' && value.length < 6) error = 'Password too short.';
    if (key === 'phone_number' && value && !/^[0-9\-\+]{9,15}$/.test(value))
      error = 'Invalid phone number.';

    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const validateForm = () => {
    const { name, email, password, role, phone_number } = form;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
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

    setLoading(true); // show loader

    try {
      const response = await api.post('/register', form);
      console.log('Registration successful:', response.data);
      router.push({ pathname: '/login', params: { success: 'true' } });
    } catch (error: any) {
      console.log('FULL ERROR:', JSON.stringify(error, null, 2));
      console.log('RESPONSE:', error?.response);
      console.log('MESSAGE:', error?.message);
      Alert.alert('Error', 'Registration failed. See logs.');
    }
    finally {
      setLoading(false); // hide loader
    }
  };

  return (
    <>
      {loading && <LoadingSpinner />}

      <KeyboardAwareScrollView
        style={tw`bg-white`}
        contentContainerStyle={[
          tw`bg-[#f1f5f9]`,
          {
            paddingHorizontal: moderateScale(16),
            paddingBottom: verticalScale(32),
            minHeight: '100%',
            justifyContent: 'center',
          },
        ]}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <EmberLogo />
            <Text style={tw`text-2xl font-bold text-orange-500 mt-2`}>
              Register
            </Text>
          </View>

          <View style={{ marginTop: 8 }}>
            {/* Name */}
            <View style={{ marginBottom: 12 }}>
              <FormInput
                value={form.name}
                onChangeText={(val) => handleChange('name', val)}
                placeholder="Name"
                theme="light"
              />
              {errors.name ? <Text style={tw`text-red-500 text-sm ml-1`}>{errors.name}</Text> : null}
            </View>

            {/* Email */}
            <View style={{ marginBottom: 12 }}>
              <FormInput
                value={form.email}
                onChangeText={(val) => handleChange('email', val)}
                placeholder="Email"
                keyboardType="email-address"
                theme="light"
              />
              {errors.email ? <Text style={tw`text-red-500 text-sm ml-1`}>{errors.email}</Text> : null}
            </View>

            {/* Password */}
            <View style={{ marginBottom: 12 }}>
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
              {errors.password ? (
                <Text style={tw`text-red-500 text-sm ml-1`}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Role Dropdown */}
            <View style={{ zIndex: 1000, marginBottom: 12 }}>
              <DropDownPicker
                open={open}
                value={role}
                items={roleItems}
                setOpen={setOpen}
                setValue={setRole}
                setItems={setRoleItems}
                placeholder="Select Role"
                placeholderStyle={{ color: '#555' }}
                style={{
                  backgroundColor: '#f3f4f6',
                  borderColor: '#f97316',
                  borderRadius: 10,
                  height: 48,
                }}
                textStyle={{ color: '#111827', fontSize: 14 }}
                dropDownContainerStyle={{
                  backgroundColor: '#f3f4f6',
                  borderColor: '#f97316',
                }}
                ArrowUpIconComponent={() => <Text style={tw`text-black`}>▲</Text>}
                ArrowDownIconComponent={() => <Text style={tw`text-black`}>▼</Text>}
                showArrowIcon
                listMode="SCROLLVIEW" // ✅ THIS LINE fixes the FlatList warning
              />

            </View>


            {/* Phone Number */}
            <View style={{ marginBottom: 16 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#f97316',
                  backgroundColor: '#f3f4f6',
                  color: '#111827',
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  fontSize: 14,
                }}
                placeholder="Phone Number (Optional)"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                value={form.phone_number}
                onChangeText={(val) => handleChange('phone_number', val)}
              />
              {errors.phone_number ? (
                <Text style={tw`text-red-500 text-sm ml-1`}>{errors.phone_number}</Text>
              ) : null}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleRegister}
              style={{
                backgroundColor: '#f97316',
                borderRadius: 10,
                paddingVertical: 14,
                marginBottom: 20,
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

          <AuthFooter label="Already have an account?" link="/login" />
        </View>
      </KeyboardAwareScrollView>
    </>

  );



}
