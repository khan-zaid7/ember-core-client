import { useState, useEffect } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import EmberLogo from '../components/EmberLogo';
import { FormInput } from '../components/FormInput';
import AuthFooter from '../components/AuthFooter';
import SuccessAlert from '../components/SuccessAlert';
import { moderateScale, verticalScale } from '../src/utils/reponsive';
import api from '@/src/utils/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    if (params.success) {
      setShowSuccess(true);
      const timeout = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [params.success]);

  const validateForm = () => {
    const { email, password } = form;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    let tempErrors: any = { email: '', password: '' };

    if (!email.trim()) {
      tempErrors.email = 'Email is required.';
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      tempErrors.email = 'Invalid email format.';
      valid = false;
    }

    if (!password) {
      tempErrors.password = 'Password is required.';
      valid = false;
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
      valid = false;
    }

    setErrors(tempErrors);

    if (!valid) {
      Alert.alert('Validation Error', Object.values(tempErrors).filter(Boolean).join('\n'));
    }

    return valid;
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    let error = '';
    if (key === 'email') {
      if (!value.trim()) error = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email.';
    }
    if (key === 'password') {
      if (!value) error = 'Password is required.';
      else if (value.length < 6) error = 'Password too short.';
    }

    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await api.post('/login', form);
      const { token } = response.data;

      await AsyncStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      router.push({ pathname: '/index', params: { success: 'true' } });
    } catch (error: any) {
      console.log('FULL ERROR:', JSON.stringify(error, null, 2));
      console.log('RESPONSE:', error?.response);
      console.log('MESSAGE:', error?.message);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (

    <>
    {loading && <LoadingSpinner />}
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <ScrollView
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
          {showSuccess && (
            <View style={{ marginBottom: verticalScale(16) }}>
              <SuccessAlert message="Registration successful. Please log in." />
            </View>
          )}

          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <EmberLogo />
            <Text style={tw`text-2xl font-bold text-orange-500 mt-2`}>Login</Text>
          </View>

          <View style={{ marginTop: 8 }}>
            <View style={{ marginBottom: 12 }}>
              <FormInput
                value={form.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Email"
                keyboardType="email-address"
                theme="light"
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <FormInput
                value={form.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder="Password"
                secureTextEntry
                showToggle
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                theme="light"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Link
                href="/forgot-password"
                style={tw`text-orange-500 text-right text-sm`}
              >
                Forgot Password?
              </Link>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
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
                Login
              </Text>
            </TouchableOpacity>
          </View>

          <AuthFooter label="Don’t have an account?" link="/register" />
        </View>
      </ScrollView>
    </SafeAreaView>
    
    </>
  );
}
