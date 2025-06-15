import { useState, useEffect } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import EmberLogo from '../components/EmberLogo';
import { FormInput } from '../components/FormInput';
import AuthFooter from '../components/AuthFooter';
import SuccessAlert from '../components/SuccessAlert';
import { moderateScale, verticalScale } from '../src/utils/reponsive';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    if (params.success) {
      setShowSuccess(true);
      const timeout = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [params.showSuccess]);

  const handleLogin = () => {
    // TODO: implement login logic
  };

  return (
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
            <Text style={tw`text-2xl font-bold text-orange-500 mt-2`}>
              Login
            </Text>
          </View>

          <View style={{ marginTop: 8 }}>
            <View style={{ marginBottom: 12 }}>
              <FormInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                theme="light"
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <FormInput
                value={password}
                onChangeText={setPassword}
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
  );
}
