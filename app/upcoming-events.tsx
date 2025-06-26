import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

export default function UpcomingEvents() {
  return (
    <SafeAreaView style={tw`flex-1 bg-[#f1f5f9] justify-center items-center`}>
      <Text style={tw`text-2xl font-bold text-orange-500`}>Upcoming Events</Text>
      <Text style={tw`text-base text-gray-600 mt-2`}>This is a placeholder for upcoming events.</Text>
    </SafeAreaView>
  );
} 