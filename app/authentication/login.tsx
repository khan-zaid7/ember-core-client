import { LinearGradient } from 'expo-linear-gradient';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/src/utils/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import AuthFooter from '@/components/AuthFooter';
import EmberLogo from '@/components/EmberLogo';
import { FormInput } from '@/components/FormInput';
import SuccessAlert from '@/components/SuccessAlert';
import { verticalScale } from '@/src/utils/reponsive';
import { loginUserOffline } from '@/services/models/UserModel';
import { useAuth } from '@/context/AuthContext';


export default function Login() {
  const { login } = useAuth();

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

  // const handleLogin = async () => {
  //   if (!validateForm()) return;
  //   setLoading(true);

  //   try {
  //     const response = await api.post('/login', form);
  //     const { token } = response.data;

  //     await AsyncStorage.setItem('token', token);
  //     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //     router.push({ pathname: '/home', params: { success: 'true' } });
  //   } catch (error: any) {
  //     console.log('FULL ERROR:', JSON.stringify(error, null, 2));
  //     console.log('RESPONSE:', error?.response);
  //     console.log('MESSAGE:', error?.message);
  //     Alert.alert('Error', 'Login failed. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const user = loginUserOffline(form);
      await login(user);


      Alert.alert('Success', `Welcome ${user.name}`);
      router.push('/home');
    } catch (error: any) {
      console.log('❌ Login error:', error);
      Alert.alert('Error', error.message || 'Login failed');
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
              {showSuccess && (
                <View style={{ marginBottom: verticalScale(8) }}>
                  <SuccessAlert message="Registration successful. Please log in." />
                </View>
              )}
              <View style={{ alignItems: 'center', marginBottom: 6 }}>
                <EmberLogo />
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#f97316', marginTop: 2 }}>Login</Text>
              </View>
              <View style={{ marginTop: 8 }}>
                <View style={{ marginBottom: 4 }}>
                  <FormInput
                    value={form.email}
                    onChangeText={(text) => handleChange('email', text)}
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
                <View style={{ marginBottom: 4 }}>
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
                  <View style={{ minHeight: 18, marginTop: 2 }}>
                    <Text style={{ color: '#ef4444', fontSize: 12 }}>
                      {errors.password || ' '}
                    </Text>
                  </View>
                </View>
                <View style={{ marginBottom: 12 }}>
                  <Link
                    href="/authentication/password-reset/forgot-password"
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
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
              <AuthFooter label="Don't have an account?" link="/authentication/register" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}