import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';

export default function Index() {
  const router = useRouter();

  const navButtons = [
    { label: 'Register (Online)', path: '/register' },
    { label: 'Login', path: '/login' },
    { label: 'Register People Offline', path: '/register-offline' },
  ];

  return (
    <View style={tw`flex-1 bg-[#f1f5f9] justify-center items-center px-4`}>
      <View style={tw`w-full max-w-sm`}>
        <Text style={tw`text-3xl font-bold text-center text-orange-500 mb-8`}>
          EmberCore App
        </Text>

        {navButtons.map((btn, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(btn.path)}
            style={tw`bg-orange-500 py-4 px-6 rounded-2xl mb-4 shadow-md`}
          >
            <Text style={tw`text-white text-center font-semibold text-base`}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}