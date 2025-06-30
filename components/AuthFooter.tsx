import { Text } from 'react-native';
import { Link } from 'expo-router';
import tw from 'twrnc';
import React from 'react';
interface AuthFooterProps {
  link: '/authentication/login' | '/authentication/register'; // ✅ fixed
  label: string;
}

export default function AuthFooter({ link, label }: AuthFooterProps) {
  return (
    <Text style={tw`text-center mt-8 text-gray-400`}>
      {label}{' '}
      <Link href={link} style={tw`text-orange-400 font-semibold`}>
        {link === '/authentication/login' ? 'Login' : 'Register'}
      </Link>
    </Text>
  );
}
