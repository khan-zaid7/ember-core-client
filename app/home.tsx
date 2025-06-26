import { Entypo, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardCard from '../components/DashboardCard';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFooter from '../components/DashboardFooter';

// Mock user data
const user = {
  name: 'John Doe',
  email: 'john.doe@email.com',
  phone: '+1 234-567-8901',
  role: 'admin',
  lastLogin: '2024-06-01 10:30 AM',
  location: 'Toronto, ON',
  avatar: null,
  verified: true,
};

const stats = {
  totalUsers: 120,
  tasksAssigned: 8,
  tasksCompleted: 5,
  tasksInProgress: 3,
  eventsJoined: 4,
  fieldReports: 12,
  accountStatus: 'Verified',
  newSignups: 7,
};

const upcoming = [
  { title: 'Community Drive', date: '2024-06-10', type: 'event' },
  { title: 'Assigned Task: Survey Area 5', date: '2024-06-12', type: 'task' },
  { title: 'Team Meeting', date: '2024-06-15', type: 'meeting' },
];

const adminControls = [
  { label: ' Manage Users', icon: <FontAwesome5 name="users-cog" size={20} color="#f97316" />, route: '/manage-users' },
  { label: 'Create Event/Task', icon: <MaterialIcons name="event-available" size={22} color="#f97316" />, route: '/admin-dashboard' },
  { label: 'Audit Logs', icon: <MaterialIcons name="history" size={22} color="#f97316" />, route: '/admin-dashboard' },
  { label: 'System Health', icon: <MaterialIcons name="health-and-safety" size={22} color="#f97316" />, route: '/admin-dashboard' },
];

const coordinatorStats = {
  teamOverview: 5,
  pendingApprovals: 2,
  meetingsScheduled: 3,
};
const volunteerStats = {
  volunteerHours: 42,
};

export default function HomeDashboard() {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DashboardHeader title="Ember Core" onSettingsPress={() => setSettingsVisible(true)} />
      {/* Settings Modal */}
      <Modal visible={settingsVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -2 } }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#161412', marginBottom: 18 }}>Settings</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { setSettingsVisible(false); router.push('/profile' as any); }}>
              <MaterialIcons name="person" size={22} color="#f97316" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#161412' }}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { setSettingsVisible(false); router.push('/preferences' as any); }}>
              <MaterialIcons name="tune" size={22} color="#f97316" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#161412' }}>Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }} onPress={() => { setSettingsVisible(false); /* TODO: Add logout logic */ }}>
              <MaterialIcons name="logout" size={22} color="#f97316" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#f97316', fontWeight: 'bold' }}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 18 }} onPress={() => setSettingsVisible(false)}>
              <Text style={{ color: '#f97316', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Quick Access Section */}
        <Text style={{ color: '#161412', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 }}>Quick Access</Text>
        <View style={{ paddingHorizontal: 16 }}>
          {/* Card 1: Offline Registration */}
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
            <View style={{ flex: 2, justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#161412', fontSize: 16, fontWeight: 'bold' }}>Offline Registration</Text>
                <Text style={{ color: '#81736a', fontSize: 14, marginTop: 2 }}>Register new users offline</Text>
              </View>
              <TouchableOpacity style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#f4f2f1', borderRadius: 999, height: 24, paddingHorizontal: 10, marginTop: 7, alignSelf: 'flex-start', minWidth: 0 }} onPress={() => router.push('/screens/RegisterAffectedPerson' as any)}>
                <MaterialIcons name="arrow-forward" size={14} color="#161412" />
                <Text style={{ color: '#161412', fontSize: 12, fontWeight: '500', marginRight: 4, paddingVertical: 0 }}>Go</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#fff', aspectRatio: 16/9, marginLeft: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="person-add-alt-1" size={48} color="#f97316" />
            </View>
          </View>
          {/* Card 2: Medical Supply Management */}
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
            <View style={{ flex: 2, justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#161412', fontSize: 16, fontWeight: 'bold' }}>Medical Supply Management</Text>
                <Text style={{ color: '#81736a', fontSize: 14, marginTop: 2 }}>Manage medical supplies offline</Text>
              </View>
              <TouchableOpacity style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#f4f2f1', borderRadius: 999, height: 24, paddingHorizontal: 10, marginTop: 7, alignSelf: 'flex-start', minWidth: 0 }} onPress={() => {/* TODO: navigate to medical supply */}}>
                <MaterialIcons name="arrow-forward" size={14} color="#161412" />
                <Text style={{ color: '#161412', fontSize: 12, fontWeight: '500', marginRight: 4, paddingVertical: 0 }}>Go</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#fff', aspectRatio: 16/9, marginLeft: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="medical-services" size={48} color="#f97316" />
            </View>
          </View>
          {/* Card 3: View Unsynced Records */}
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
            <View style={{ flex: 2, justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#161412', fontSize: 16, fontWeight: 'bold' }}>View Unsynced Records</Text>
                <Text style={{ color: '#81736a', fontSize: 14, marginTop: 2 }}>View records not yet synced</Text>
              </View>
              <TouchableOpacity style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#f4f2f1', borderRadius: 999, height: 24, paddingHorizontal: 10, marginTop: 7, alignSelf: 'flex-start', minWidth: 0 }} onPress={() => {/* TODO: navigate to unsynced records */}}>
                <MaterialIcons name="arrow-forward" size={14} color="#161412" />
                <Text style={{ color: '#161412', fontSize: 12, fontWeight: '500', marginRight: 4, paddingVertical: 0 }}>Go</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#fff', aspectRatio: 16/9, marginLeft: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="sync-problem" size={48} color="#f97316" />
            </View>
          </View>
          {/* Card 4: Sync Data */}
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
            <View style={{ flex: 2, justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#161412', fontSize: 16, fontWeight: 'bold' }}>Sync Data</Text>
                <Text style={{ color: '#81736a', fontSize: 14, marginTop: 2 }}>Synchronize data with the server</Text>
              </View>
              <TouchableOpacity style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#f4f2f1', borderRadius: 999, height: 24, paddingHorizontal: 10, marginTop: 7, alignSelf: 'flex-start', minWidth: 0 }} onPress={() => {/* TODO: sync data */}}>
                <MaterialIcons name="arrow-forward" size={14} color="#161412" />
                <Text style={{ color: '#161412', fontSize: 12, fontWeight: '500', marginRight: 4, paddingVertical: 0 }}>Go</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#fff', aspectRatio: 16/9, marginLeft: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="sync" size={48} color="#f97316" />
            </View>
          </View>
        </View>
        {/* Role-Based Actions Section */}
        <Text style={{ color: '#161412', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 }}>Role-Based Actions</Text>
        <View style={{ paddingHorizontal: 16 }}>
          {/* Volunteer Actions Card */}
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
            <View style={{ flex: 2, justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#161412', fontSize: 16, fontWeight: 'bold' }}>Volunteer Actions</Text>
                <Text style={{ color: '#81736a', fontSize: 14, marginTop: 2 }}>Actions available for volunteers</Text>
              </View>
              <TouchableOpacity style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#f4f2f1', borderRadius: 999, height: 24, paddingHorizontal: 10, marginTop: 7, alignSelf: 'flex-start', minWidth: 0 }} onPress={() => {/* TODO: volunteer actions */}}>
                <MaterialIcons name="arrow-forward" size={14} color="#161412" />
                <Text style={{ color: '#161412', fontSize: 12, fontWeight: '500', marginRight: 4, paddingVertical: 0 }}>Go</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#fff', aspectRatio: 16/9, marginLeft: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="volunteer-activism" size={48} color="#f97316" />
            </View>
          </View>
          {/* Admin Actions Card */}
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
            <View style={{ flex: 2, justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#161412', fontSize: 16, fontWeight: 'bold' }}>Admin Actions</Text>
                <Text style={{ color: '#81736a', fontSize: 14, marginTop: 2 }}>Actions available for administrators</Text>
              </View>
              <TouchableOpacity style={{ flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#f4f2f1', borderRadius: 999, height: 24, paddingHorizontal: 10, marginTop: 7, alignSelf: 'flex-start', minWidth: 0 }} onPress={() => {/* TODO: admin actions */}}>
                <MaterialIcons name="arrow-forward" size={14} color="#161412" />
                <Text style={{ color: '#161412', fontSize: 12, fontWeight: '500', marginRight: 4, paddingVertical: 0 }}>Go</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#fff', aspectRatio: 16/9, marginLeft: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="admin-panel-settings" size={48} color="#f97316" />
            </View>
          </View>
        </View>
      </ScrollView>
      <DashboardFooter
        activeTab="dashboard"
        onTabPress={(tab) => {
          if (tab === 'dashboard') return;
          if (tab === 'settings') setSettingsVisible(true);
          else if (tab === 'records') {/* TODO: navigate to records */}
          else if (tab === 'map') {/* TODO: navigate to map */}
        }}
      />
    </SafeAreaView>
  );
}