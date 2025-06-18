import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import tw from 'twrnc';

import EmberLogo from '../components/EmberLogo';
import { FormInput } from '../components/FormInput';
import SuccessAlert from '../components/SuccessAlert';
import LoadingSpinner from '../components/LoadingSpinner';

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

    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f1f5f9]`}>
      <ScrollView contentContainerStyle={tw`flex-grow px-6 pt-12`}>
        <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
          <EmberLogo />

          <Text style={tw`text-3xl font-bold text-orange-500 mt-10 mb-2`}>
            Forgot Password
          </Text>
          <Text style={tw`text-base text-gray-600 mb-8`}>
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
                backgroundColor:
                  loading || !validateEmail(email) ? 'gray' : '#f97316',
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
              message="If your email is registered, a recovery link has been sent."
              onDismiss={() => setSuccess(false)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}