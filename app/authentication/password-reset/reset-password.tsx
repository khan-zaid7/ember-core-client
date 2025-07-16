// app/reset-password.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '@/src/utils/axiosConfig';
import EmberLogo from '@/components/EmberLogo';
import { FormInput } from '@/components/FormInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import { updateUserPassword } from '@/services/models/UserModel';


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
        // Update password locally after successful server update
        try {
          updateUserPassword(email, newPassword);
          console.log('✅ Password updated locally for user:', email);
        } catch (localError) {
          console.warn('⚠️ Failed to update password locally:', localError);
          // Don't fail the entire process if local update fails
        }

        Alert.alert(
          'Success!', 
          'Your password has been reset successfully. You can now log in with your new password.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/authentication/login')
            }
          ]
        );
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error resetting password.';
      Alert.alert('Error', msg);
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
                Set New Password
              </Text>
            </View>
            <View style={{ marginBottom: 4 }}>
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
            </View>
            <View style={{ marginBottom: 8 }}>
              <FormInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                theme="light"
              />
            </View>
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading}
              style={{
                backgroundColor: '#f97316',
                borderRadius: 10,
                height: 48,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 8,
                marginBottom: 0,
                opacity: loading ? 0.7 : 1,
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
                  Update Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
