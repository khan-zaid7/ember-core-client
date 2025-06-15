import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-3">
      <Text className="text-2xl font-bold">Home</Text>

      <Button title="Go to Register" onPress={() => router.push('/register')} />
      <Button title="Go to Login" onPress={() => router.push('/login')} />
    </View>
  );
}
