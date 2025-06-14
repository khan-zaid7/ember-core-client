import { View, Image, Text } from 'react-native';
import tw from 'twrnc';
import React from 'react';

interface EmberLogoProps {
  title?: string;
}

export default function EmberLogo({ title = '' }: EmberLogoProps) {
  return (
    <View style={tw`items-center mb-10`}>
      <Image
        source={require('../assets/file.jpg')}
        style={tw`w-24 h-24 mb-2`}
        resizeMode="contain"
      />
      {title ? <Text style={tw`text-orange-400 text-3xl font-bold mt-2`}>{title}</Text> : null}
    </View>
  );
}
