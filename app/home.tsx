import { Footer, useFooterNavigation } from '@/components/Footer';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../components/Header';
import SettingsComponent from '../components/SettingsComponent';
import { useAuth } from '@/context/AuthContext';


const commonRoutes = [
  {
    path: '/register-patients',
    title: 'Offline Registration',
    description: 'Register new users offline',
    icon: <MaterialIcons name="person-add-alt-1" size={48} color="#f97316" />,
  },
  {
    path: '/records',
    title: 'View Unsynced Records',
    description: 'View records not yet synced',
    icon: <MaterialIcons name="sync-problem" size={48} color="#f97316" />,
  },
  {
    path: '/maps',
    title: 'Maps',
    description: 'View and navigate maps',
    icon: <MaterialIcons name="map" size={48} color="#f97316" />,
  },
  {
    path: '/profile',
    title: 'Profile',
    description: 'View your profile',
    icon: <MaterialIcons name="person" size={48} color="#f97316" />,
  },
  {
    path: '/conflicts',
    title: 'Conflicts',
    description: 'View all conflicts',
    icon: <MaterialIcons name="person" size={48} color="#f97316" />,
  },
];

const roleActions: Record<string, Array<{ path: string; title: string; description: string; icon: React.ReactElement }>> = {
  fieldworker: [
    {
      path: '/medical-supplies',
      title: 'Medical Supply Management',
      description: 'Manage medical supplies offline',
      icon: <MaterialIcons name="medical-services" size={48} color="#f97316" />,
    },
    {
      path: '/tasks/assignedTasks',
      title: 'Assigned Tasks',
      description: 'View your assigned tasks',
      icon: <MaterialIcons name="assignment-ind" size={48} color="#f97316" />,
    },
  ],
  coordinator: [
    {
      path: '/medical-supplies',
      title: 'Medical Supply Management',
      description: 'Manage medical supplies offline',
      icon: <MaterialIcons name="medical-services" size={48} color="#f97316" />,
    },
    {
      path: '/tasks',
      title: 'Task Management',
      description: 'Manage all tasks and create new ones',
      icon: <MaterialIcons name="dashboard" size={48} color="#f97316" />,
    },
    {
      path: '/users',
      title: 'Manage Users',
      description: 'View and manage users',
      icon: <MaterialIcons name="group" size={48} color="#f97316" />,
    },
  ],
};

export default function HomeDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsVisible(true));

  // Get role-based actions (empty for volunteer)
  const actions = user?.role && roleActions[user.role] ? roleActions[user.role] : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DashboardHeader title="Ember Core" onSettingsPress={() => setSettingsVisible(true)} />
      {/* Settings Modal */}
      <SettingsComponent visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Quick Access Section */}
        <Text style={{ color: '#161412', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 }}>Quick Access</Text>
        <View style={{ paddingHorizontal: 16 }}>
          {commonRoutes.map(card => (
            <View key={card.path} style={{ flexDirection: 'row', alignItems: 'stretch', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
              <View style={{ flex: 2, justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ color: '#161412', fontSize: 16, fontWeight: 'bold' }}>{card.title}</Text>
                  <Text style={{ color: '#81736a', fontSize: 14, marginTop: 2 }}>{card.description}</Text>
                </View>
                <TouchableOpacity style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#f4f2f1', borderRadius: 999, height: 24, paddingHorizontal: 10, marginTop: 7, alignSelf: 'flex-start', minWidth: 0 }} onPress={() => router.push(card.path as any)}>
                  <MaterialIcons name="arrow-forward" size={14} color="#161412" />
                  <Text style={{ color: '#161412', fontSize: 12, fontWeight: '500', marginRight: 4, paddingVertical: 0 }}>Go</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#fff', aspectRatio: 16 / 9, marginLeft: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                {card.icon}
              </View>
            </View>
          ))}
        </View>
        {/* Role-Based Actions Section */}
        {actions.length > 0 && (
          <>
            <Text style={{ color: '#161412', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 }}>Role-Based Actions</Text>
            <View style={{ paddingHorizontal: 16 }}>
              {actions.map(card => (
                <View key={card.path} style={{ flexDirection: 'row', alignItems: 'stretch', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
                  <View style={{ flex: 2, justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ color: '#161412', fontSize: 16, fontWeight: 'bold' }}>{card.title}</Text>
                      <Text style={{ color: '#81736a', fontSize: 14, marginTop: 2 }}>{card.description}</Text>
                    </View>
                    <TouchableOpacity style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#f4f2f1', borderRadius: 999, height: 24, paddingHorizontal: 10, marginTop: 7, alignSelf: 'flex-start', minWidth: 0 }} onPress={() => router.push(card.path as any)}>
                      <MaterialIcons name="arrow-forward" size={14} color="#161412" />
                      <Text style={{ color: '#161412', fontSize: 12, fontWeight: '500', marginRight: 4, paddingVertical: 0 }}>Go</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#fff', aspectRatio: 16 / 9, marginLeft: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                    {card.icon}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}