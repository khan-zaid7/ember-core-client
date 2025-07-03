import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    KeyboardTypeOptions,
    Pressable,
    TextInput,
    View,
} from 'react-native';
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
  editable?: boolean;
  fontSize?: number;
  height?: number;
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
  editable = true,
  fontSize,
  height,
}) => {
  const isLight = theme === 'light';

  return (
    <View style={tw`relative`}>
      <TextInput
        style={tw.style(
          'rounded-xl px-4 pr-12 border',
          isLight
            ? 'bg-white text-black border-gray-300'
            : 'bg-[#111827] text-white border-orange-500',
          fontSize ? { fontSize } : {},
          height ? { height, paddingVertical: 0 } : { paddingVertical: 14 }
        )}
        placeholder={placeholder}
        placeholderTextColor={isLight ? '#555' : '#aaa'}
        secureTextEntry={showToggle ? !showPassword : secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
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
