import { View, TextInput, Pressable, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import React from 'react';

interface FormInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  showPassword?: boolean;
  setShowPassword?: (val: boolean) => void;
  keyboardType?: KeyboardTypeOptions;
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
}) => {
  return (
    <View style={tw`relative`}>
      <TextInput
        style={tw`border border-orange-500 bg-[#111827] text-white rounded-xl px-4 py-3.5 pr-12`}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
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
            color="#aaa"
          />
        </Pressable>
      )}
    </View>
  );
};
