import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = () => {
    if (!fullname || !email || !phone || !password || !confirmPassword) {
      setMessage("All fields are required.");
    } else if (!email.includes('@')) {
      setMessage("Invalid email address.");
    } else if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
    } else if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
    } else {
      setMessage("Registration successful! 🎉");
      setFullname('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ padding: 20, flex: 1, justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, shadowColor: '#000', elevation: 5 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1f2937' }}>Register</Text>
            {message ? <Text style={{ marginBottom: 10, color: message.includes('successful') ? 'green' : 'red' }}>{message}</Text> : null}
            <Text>Full Name</Text>
            <TextInput value={fullname} onChangeText={setFullname} style={inputStyle} />
            <Text>Email Address</Text>
            <TextInput value={email} onChangeText={setEmail} style={inputStyle} keyboardType="email-address" />
            <Text>Phone Number</Text>
            <TextInput value={phone} onChangeText={setPhone} style={inputStyle} keyboardType="phone-pad" />
            <Text>Password</Text>
            <TextInput value={password} onChangeText={setPassword} style={inputStyle} secureTextEntry />
            <Text>Confirm Password</Text>
            <TextInput value={confirmPassword} onChangeText={setConfirmPassword} style={inputStyle} secureTextEntry />
            <TouchableOpacity onPress={handleRegister} style={buttonStyle}>
              <Text style={{ color: 'white', textAlign: 'center' }}>Register</Text>
            </TouchableOpacity>
            <Text style={centerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={linkStyle}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={linkStyle}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const inputStyle = { marginBottom: 10, padding: 10, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 5 };
const buttonStyle = { marginTop: 10, padding: 15, backgroundColor: '#dc2626', borderRadius: 5 };
const centerText = { marginTop: 20, textAlign: 'center', color: '#4b5563' };
const linkStyle = { color: '#dc2626', textAlign: 'center' as 'center', marginTop: 5 };