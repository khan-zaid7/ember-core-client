import React from 'react';
import { Image, Text, View } from 'react-native';
import tw from 'twrnc';

interface EmberLogoProps {
  title?: string;
}

export default function EmberLogo({ title = '' }: EmberLogoProps) {
  return (
    <View style={tw`items-center mb-2`}>
      <Image
        source={require('../assets/logo_transparent.png')}
        style={tw`w-36 h-36`}
        resizeMode="contain"
      />
      {title ? <Text style={tw`text-orange-400 text-3xl font-bold mt-2`}>{title}</Text> : null}
    </View>
  );
}
