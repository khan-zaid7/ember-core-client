import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '@/src/utils/axiosConfig';
import EmberLogo from '../components/EmberLogo';
import { FormInput } from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import SuccessAlert from '../components/SuccessAlert';

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
            <View style={{ alignItems: 'center', marginBottom: 6 }}>
              <EmberLogo />
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#f97316', marginTop: 2, textAlign: 'center' }}>
                Forgot Password
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 12 }}>
              Enter your email and we'll send you a recovery link.
            </Text>
            <View style={{ marginBottom: 4 }}>
              <FormInput
                placeholder="Enter your email"
                value={email}
                onChangeText={(text: string) => setEmail(text)}
                keyboardType="email-address"
                theme="light"
              />
              <View style={{ minHeight: 18, marginTop: 2 }}>
                <Text style={{ color: '#ef4444', fontSize: 12 }}>{error || ' '}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !validateEmail(email)}
              style={{
                backgroundColor: '#f97316',
                borderRadius: 10,
                height: 48,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 8,
                marginBottom: 0,
                opacity: loading || !validateEmail(email) ? 0.7 : 1,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
                  Send Recovery Link
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={{ marginTop: 12 }}
            >
              <Text style={{ color: '#f97316', textAlign: 'center', fontWeight: '600', fontSize: 15 }}>
                Back to Login
              </Text>
            </TouchableOpacity>
            {success && (
              <SuccessAlert
                message="If your email is registered, a recovery link (OTP) has been sent."
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}