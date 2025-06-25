import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import tw from 'twrnc';

import EmberLogo from '../components/EmberLogo';

export default function HomeDashboard() {
  return (
    <SafeAreaView style={tw`flex-1 bg-[#f1f5f9]`}>
      <ScrollView contentContainerStyle={tw`px-6 pt-6 pb-12`}>
        {/* Header */}
        <View style={tw`mb-6`}>
          <EmberLogo />
          <Text style={tw`text-2xl font-bold text-orange-500 mt-4 text-center`}>
            Welcome to the Dashboard
          </Text>
          <Text style={tw`text-base text-center text-gray-600 mt-1`}>
            Manage your tasks, updates and users here.
          </Text>
        </View>

        {/* Sample Stats or Cards */}
        <View style={tw`flex-row flex-wrap justify-between gap-4 mt-6`}>
          <View style={tw`bg-white w-[48%] rounded-xl p-4 shadow`}>
            <Text style={tw`text-gray-500 text-sm`}>Active Users</Text>
            <Text style={tw`text-xl font-bold text-orange-500`}>42</Text>
          </View>

          <View style={tw`bg-white w-[48%] rounded-xl p-4 shadow`}>
            <Text style={tw`text-gray-500 text-sm`}>Tasks Completed</Text>
            <Text style={tw`text-xl font-bold text-orange-500`}>128</Text>
          </View>

          <View style={tw`bg-white w-full rounded-xl p-4 shadow mt-4`}>
            <Text style={tw`text-gray-500 text-sm`}>Your Role</Text>
            <Text style={tw`text-lg font-bold text-orange-500`}>Coordinator</Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={tw`mt-10`}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={tw`bg-orange-500 rounded-xl py-4 mb-4`}
          >
            <Text style={tw`text-white text-center text-lg font-semibold`}>
              View Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/')}
            style={tw`bg-white border border-orange-500 rounded-xl py-4`}
          >
            <Text style={tw`text-orange-500 text-center text-lg font-semibold`}>
              Profile Settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}