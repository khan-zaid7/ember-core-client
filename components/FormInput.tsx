import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface FormInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  showPassword?: boolean;
  setShowPassword?: (val: boolean) => void;
  keyboardType?: KeyboardTypeOptions;
  theme?: 'light' | 'dark';
}

export const FormInput: React.FC<FormInputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  showToggle = false,
  showPassword,
  setShowPassword,
  keyboardType = 'default',
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <View style={tw`relative`}>
      <TextInput
        style={tw.style(
          'rounded-xl px-4 py-3.5 pr-12 border',
          isLight
            ? 'bg-gray-100 text-black border-orange-500'
            : 'bg-[#111827] text-white border-orange-500'
        )}
        placeholder={placeholder}
        placeholderTextColor={isLight ? '#555' : '#aaa'}
        secureTextEntry={showToggle ? !showPassword : secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />

      {showToggle && setShowPassword && (
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          style={tw`absolute right-4 top-3.5`}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={isLight ? '#333' : '#aaa'}
          />
        </Pressable>
      )}
    </View>
  );
};
