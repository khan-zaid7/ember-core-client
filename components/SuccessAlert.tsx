// components/SuccessAlert.tsx
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

const SuccessAlert = ({ message }: { message: string }) => {
  return (
    <View style={tw`flex-row items-center bg-green-100 border border-green-400 rounded-xl px-4 py-3 mb-4`}>
      <Ionicons name="checkmark-circle" size={20} color="#166534" style={tw`mr-2`} />
      <Text style={tw`text-green-800 text-sm font-medium`}>
        {message}
      </Text>
    </View>
  );
};

export default SuccessAlert;
