import { TouchableOpacity, Text } from 'react-native';

export default function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="bg-blue-600 py-3 rounded-xl">
      <Text className="text-center text-white text-base font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
