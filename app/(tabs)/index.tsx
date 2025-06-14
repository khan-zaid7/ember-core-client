import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-3">
      <Text className="text-2xl font-bold">Home</Text>
      // Create a test component
      <View className="bg-green-500 p-4 rounded-lg">
        <Text className="text-white font-bold">Tailwind Test</Text>
      </View>
      <Button title="Go to Register" onPress={() => router.push('/register')} />
      <Button title="Go to Login" onPress={() => router.push('/login')} />
    </View>
  );
}
