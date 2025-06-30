// app/verify-otp.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import EmberLogo from '@/components/EmberLogo';
import { FormInput } from '@/components/FormInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/src/utils/axiosConfig';

export default function VerifyOtp() {
  const { email: passedEmail } = useLocalSearchParams();
  const email = Array.isArray(passedEmail) ? passedEmail[0] : passedEmail || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Validation Error', 'OTP is required.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/verify-otp', { email, otp });

      Alert.alert('OTP Verified', 'Redirecting to reset password...', [
        {
          text: 'OK',
          onPress: () => {
            router.replace({ pathname: '/authentication/password-reset/reset-password', params: { email } });
          },
        },
      ]);
      if (response.status === 200) {
        router.replace({
          pathname: '/authentication/password-reset/reset-password', params: { email }});
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'OTP verification failed.';
      Alert.alert('Error', message);
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
            Enter OTP
          </Text>
          <FormInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            theme="light"
          />
          <TouchableOpacity
            onPress={handleVerifyOtp}
            disabled={loading}
            style={tw`bg-orange-500 rounded-xl py-4 mt-6`}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <Text style={tw`text-white text-center font-bold text-lg`}>
                Verify OTP
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}