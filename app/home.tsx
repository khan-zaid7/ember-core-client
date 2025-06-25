import { Entypo, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import DashboardCard from '../components/DashboardCard';

// Mock user data
const user = {
  name: 'John Doe',
  email: 'john.doe@email.com',
  phone: '+1 234-567-8901',
  role: 'admin', // Change to 'admin', 'volunteer', 'fieldworker', 'coordinator' to test
  lastLogin: '2024-06-01 10:30 AM',
  location: 'Toronto, ON',
  avatar: null, // Add avatar URL if available
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

// Add coordinator and volunteer specific stats
const coordinatorStats = {
  teamOverview: 5, // e.g., 5 team members
  pendingApprovals: 2,
  meetingsScheduled: 3,
};
const volunteerStats = {
  volunteerHours: 42,
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function HomeDashboard() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 32,
          minHeight: '100%',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dashboard Role Heading/Badge with role-specific color and inline logout */}
        <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: user.role === 'admin' ? '#FFF7ED' : user.role === 'coordinator' ? '#E0F2FE' : user.role === 'volunteer' ? '#F0FDF4' : '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={[tw`text-lg font-bold`, { color: user.role === 'admin' ? '#f97316' : user.role === 'coordinator' ? '#0284c7' : user.role === 'volunteer' ? '#22c55e' : '#64748b' }]}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</Text>
          </View>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f97316', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#fff', zIndex: 10, marginLeft: 12 }} onPress={() => {/* TODO: Add logout logic */}}>
            <MaterialIcons name="logout" size={18} color="#f97316" />
            <Text style={{ color: '#f97316', marginLeft: 4, fontWeight: 'bold', fontSize: 14 }}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section - responsive for mobile */}
        {(() => {
          const screenWidth = Dimensions.get('window').width;
          const isMobile = screenWidth < 400;
          return (
            <View
              style={{
                width: '100%',
                maxWidth: 480,
                alignSelf: 'center',
                marginBottom: 24,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                position: 'relative',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexWrap: 'wrap',
              }}
            >
              <View style={{ marginRight: isMobile ? 0 : 16, marginBottom: isMobile ? 12 : 0, alignSelf: isMobile ? 'center' : 'flex-start' }}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={{ width: 72, height: 72, borderRadius: 36 }} />
                ) : (
                  <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>{getInitials(user.name)}</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text style={tw`text-2xl font-bold text-gray-900`} numberOfLines={1} ellipsizeMode="tail">Welcome back, {user.name.split(' ')[0]} 👋</Text>
                <Text style={tw`text-base text-gray-500 mt-1`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
                <Text style={tw`text-base text-gray-500`}>{user.email || user.phone}</Text>
                <Text style={tw`text-xs text-gray-400 mt-1`}>Last login: {user.lastLogin}</Text>
              </View>
            </View>
          );
        })()}

        {/* Stats/Metrics Section - modern grid layout */}
        <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', marginBottom: 16 }}>
          <Text style={tw`text-base font-semibold text-gray-700 mb-2`}>Your Stats</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {/* Each card gets more margin and width for a modern look */}
            {user.role === 'admin' && (
              <View style={{ width: '100%', marginBottom: 12 }}>
                <DashboardCard icon={<FontAwesome5 name="users" size={24} color="#f97316" style={{ marginRight: 14 }} />} title="Total Users" value={stats.totalUsers} style={{ minHeight: 90, ...tw`w-full` }} />
              </View>
            )}
            {user.role !== 'admin' && (
              <View style={{ width: '48%', marginBottom: 12 }}>
                <DashboardCard icon={<Ionicons name="clipboard-outline" size={24} color="#f97316" style={{ marginRight: 14 }} />} title="Tasks Assigned to You" value={stats.tasksAssigned} style={{ minHeight: 90, ...tw`w-full` }} />
              </View>
            )}
            {user.role !== 'admin' && (
              <View style={{ width: '48%', marginBottom: 12 }}>
                <DashboardCard icon={<MaterialIcons name="check-circle" size={24} color="#22c55e" style={{ marginRight: 14 }} />} title="Tasks Completed" value={stats.tasksCompleted} subtitle={`In Progress: ${stats.tasksInProgress}`} style={{ minHeight: 90, ...tw`w-full` }} />
              </View>
            )}
            {user.role === 'volunteer' && (
              <>
                <View style={{ width: '48%', marginBottom: 12 }}>
                  <DashboardCard icon={<Entypo name="calendar" size={24} color="#f97316" style={{ marginRight: 14 }} />} title="Events Joined" value={stats.eventsJoined} style={{ minHeight: 90, ...tw`w-full` }} />
                </View>
                <View style={{ width: '48%', marginBottom: 12 }}>
                  <DashboardCard icon={<MaterialIcons name="access-time" size={24} color="#22c55e" style={{ marginRight: 14 }} />} title="Volunteer Hours" value={volunteerStats.volunteerHours} style={{ minHeight: 90, ...tw`w-full` }} />
                </View>
              </>
            )}
            {user.role === 'fieldworker' && (
              <View style={{ width: '48%', marginBottom: 12 }}>
                <DashboardCard icon={<MaterialIcons name="assignment-turned-in" size={24} color="#f97316" style={{ marginRight: 14 }} />} title="Field Reports Submitted" value={stats.fieldReports} style={{ minHeight: 90, ...tw`w-full` }} />
              </View>
            )}
            {user.role === 'coordinator' && (
              <>
                <View style={{ width: '48%', marginBottom: 12 }}>
                  <DashboardCard icon={<FontAwesome5 name="users" size={24} color="#0284c7" style={{ marginRight: 14 }} />} title="Team Overview" value={coordinatorStats.teamOverview} style={{ minHeight: 90, ...tw`w-full` }} />
                </View>
                <View style={{ width: '48%', marginBottom: 12 }}>
                  <DashboardCard icon={<MaterialIcons name="pending-actions" size={24} color="#0284c7" style={{ marginRight: 14 }} />} title="Pending Approvals" value={coordinatorStats.pendingApprovals} style={{ minHeight: 90, ...tw`w-full` }} />
                </View>
                <View style={{ width: '48%', marginBottom: 12 }}>
                  <DashboardCard icon={<MaterialIcons name="meeting-room" size={24} color="#0284c7" style={{ marginRight: 14 }} />} title="Meetings Scheduled" value={coordinatorStats.meetingsScheduled} style={{ minHeight: 90, ...tw`w-full` }} />
                </View>
              </>
            )}
            <View style={{ width: '48%', marginBottom: 12 }}>
              <DashboardCard icon={<MaterialIcons name="verified-user" size={24} color={user.verified ? '#22c55e' : '#f97316'} style={{ marginRight: 14 }} />} title="Account Status" value={user.verified ? 'Verified' : 'Unverified'} status={user.verified ? <MaterialIcons name="check-circle" size={18} color="#22c55e" /> : <MaterialIcons name="error" size={18} color="#f97316" />} style={{ minHeight: 90, ...tw`w-full` }} />
            </View>
            {user.role === 'admin' && (
              <View style={{ width: '48%', marginBottom: 12 }}>
                <DashboardCard icon={<MaterialIcons name="person-add" size={24} color="#f97316" style={{ marginRight: 14 }} />} title="New Signups This Week" value={stats.newSignups} style={{ minHeight: 90, ...tw`w-full` }} />
              </View>
            )}
          </View>
        </View>

        {/* Admin Controls Section - move above Upcoming Events/Tasks for admin */}
        {user.role === 'admin' && (
          <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', marginBottom: 16 }}>
            <Text style={tw`text-base font-semibold text-gray-700 mb-2`}>Admin Controls</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
              {adminControls.map((ctrl, idx) => (
                <View key={idx} style={{ width: '48%' }}>
                  <DashboardCard
                    icon={ctrl.icon}
                    title={ctrl.label}
                    value=""
                    style={tw`w-full`}
                    onPress={() => router.push({ pathname: ctrl.route as any })}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Events/Tasks Section */}
        <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', marginBottom: 16 }}>
          <Text style={tw`text-base font-semibold text-gray-700 mb-2`}>Upcoming Events & Tasks</Text>
          {upcoming.map((item, idx) => (
            <DashboardCard
              key={idx}
              icon={item.type === 'event' ? <Entypo name="calendar" size={20} color="#f97316" style={{ marginRight: 10 }} /> : item.type === 'task' ? <Ionicons name="clipboard-outline" size={20} color="#f97316" style={{ marginRight: 10 }} /> : <MaterialIcons name="meeting-room" size={20} color="#f97316" style={{ marginRight: 10 }} />}
              title={item.title}
              value={item.date}
              style={tw`w-full`}
            />
          ))}
        </View>

        {/* Location-based Section */}
        {(user.role === 'fieldworker' || user.role === 'volunteer') && (
          <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', marginBottom: 16 }}>
            <Text style={tw`text-base font-semibold text-gray-700 mb-2`}>Location Info</Text>
            <DashboardCard
              icon={<Ionicons name="location-outline" size={20} color="#f97316" style={{ marginRight: 10 }} />}
              title={user.role === 'fieldworker' ? "Assigned Region" : "Nearby Events"}
              value={user.location}
              style={tw`w-full`}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}