import { TextInput, TextInputProps } from 'react-native';

export default function Input(props: TextInputProps) {
  return (
    <TextInput
      className="border border-gray-300 rounded-xl p-3 text-base text-black"
      placeholderTextColor="#999"
      {...props}
    />
  );
}
