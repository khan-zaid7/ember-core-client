import { router } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import EmberLogo from '../components/EmberLogo';
import { FormInput } from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import SuccessAlert from '../components/SuccessAlert';
import api from '@/src/utils/axiosConfig';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (value: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(value);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/forgot-password', { email });

      console.log('✅ OTP sent for email:', email);
      setSuccess(true);

      // Optional: navigate after delay
      setTimeout(() => {
        router.push({ pathname: '/verify-otp', params: { email } });
      }, 1500);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Something went wrong while sending OTP.';
      setError(message);
      console.log('❌ OTP error:', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f1f5f9]`}>
      <ScrollView contentContainerStyle={tw`flex-grow px-6 pt-12`}>
        <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
          <EmberLogo />

          <Text style={tw`text-base font-bold text-orange-500 text-center mt-10 mb-2`}>
            Forgot Password
          </Text>
          <Text style={tw`text-base text-center text-gray-600 mb-8`}>
            Enter your email and we’ll send you a recovery link.
          </Text>

          <FormInput
            label=""
            placeholder="Enter your email"
            value={email}
            onChangeText={(text: string) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
            theme="light"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !validateEmail(email)}
            style={tw.style(
              `py-3 rounded-xl mt-6`,
              {
                backgroundColor: '#f97316',
              }
            )}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <Text style={tw`text-white text-center text-base font-semibold`}>
                Send Recovery Link
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={tw`mt-6`}
          >
            <Text style={tw`text-sm text-orange-400 text-center font-semibold`}>
              Back to Login
            </Text>
          </TouchableOpacity>

          {success && (
            <SuccessAlert
              message="If your email is registered, a recovery link (OTP) has been sent."
              onDismiss={() => setSuccess(false)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}