// app/reset-password.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import EmberLogo from '../components/EmberLogo';
import { FormInput } from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '@/src/utils/axiosConfig';


export default function ResetPassword() {
  const { email: passedEmail } = useLocalSearchParams();
  const email = Array.isArray(passedEmail) ? passedEmail[0] : passedEmail || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string) => pwd.length >= 6;

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/reset-password', {
        "email":email,
        "password":newPassword,
        "confirm_password": confirmPassword,
      });

      if (response.status === 200) {
        router.replace('/login');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error resetting password.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f1f5f9]`}>
      <ScrollView contentContainerStyle={tw`flex-grow px-6 pt-12`}>
        <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
          <EmberLogo />
          <Text style={tw`text-xl font-bold text-orange-500 text-center mt-10 mb-2`}>
            Set New Password
          </Text>

          <FormInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            showToggle
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            theme="light"
          />

          <FormInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            theme="light"
          />

          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading}
            style={tw`bg-orange-500 rounded-xl py-4 mt-6`}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <Text style={tw`text-white text-center font-bold text-lg`}>
                Update Password
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
