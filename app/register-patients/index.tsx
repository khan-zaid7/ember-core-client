import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import DashboardHeader from '@/components/Header';
import DashboardFooter from '@/components/Footer';

const mockUsers = [
  { name: 'Ethan Bennett', id: '123456', status: 'Synced', ago: '2d ago' },
  { name: 'Sophia Carter', id: '789012', status: 'Unsynced', ago: '1d ago' },
  { name: 'Liam Thompson', id: '345678', status: 'Synced', ago: '3d ago' },
  { name: 'Olivia Harper', id: '901234', status: 'Unsynced', ago: '2d ago' },
  { name: 'Noah Foster', id: '567890', status: 'Synced', ago: '1d ago' },
  { name: 'Ava Hayes', id: '234567', status: 'Unsynced', ago: '3d ago' },
];

export default function UsersList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [syncFilter, setSyncFilter] = useState('');
  const [footerTab, setFooterTab] = useState('dashboard');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const filteredUsers = mockUsers.filter(u =>
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search)) &&
    (!syncFilter || u.status === syncFilter)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <DashboardHeader
        title="Patients"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4ece6', borderRadius: 12, height: 48 }}>
          <MaterialIcons name="search" size={24} color="#9e6b47" style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Search by name or ID"
            placeholderTextColor="#9e6b47"
            style={{ flex: 1, color: '#1c130d', fontSize: 16, paddingHorizontal: 8 }}
            value={search}
            onChangeText={setSearch}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
      {/* Filters */}
      <Text style={{ color: '#1c130d', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>Filter by</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 12, marginBottom: 8 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4ece6', borderRadius: 999, paddingLeft: 16, paddingRight: 8, height: 32, marginRight: 8 }}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <Text style={{ color: '#1c130d', fontSize: 14, fontWeight: '500', marginRight: 4 }}>Gender</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4ece6', borderRadius: 999, paddingLeft: 16, paddingRight: 8, height: 32 }}
          activeOpacity={0.7}
          onPress={() => setSyncFilter(syncFilter === 'Synced' ? '' : 'Synced')}
        >
          <Text style={{ color: '#1c130d', fontSize: 14, fontWeight: '500', marginRight: 4 }}>Sync Status</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>
      </View>
      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userId}>Registration ID: {item.id}</Text>
            </View>
            <Text style={[styles.userStatus, { color: item.status === 'Synced' ? '#1c130d' : '#f97316' }]}>
              {item.status} • {item.ago}
            </Text>
          </View>
        )}
      />
      {/* Floating Plus Button */}
      <View style={{ position: 'absolute', right: 24, bottom: 110 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row', alignItems: 'center', backgroundColor: '#f97316', borderRadius: 999, height: 56, paddingHorizontal: 20, shadowColor: '#f97316', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 6,
          }}
          activeOpacity={0.8}
          onPress={() => router.push('/register-patients/create' as any)}
        >
          <MaterialIcons name="add" size={28} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>Add</Text>
        </TouchableOpacity>
      </View>
      <DashboardFooter
          activeTab={footerTab}
          onTabPress={(tab) => {
            setFooterTab(tab);
            if (tab === 'settings') setSettingsModalVisible(true);
          }}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    minHeight: 72,
    paddingVertical: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#f4ece6',
  },
  userName: {
    color: '#1c130d',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userId: {
    color: '#9e6b47',
    fontSize: 13,
    fontWeight: '400',
  },
  userStatus: {
    fontSize: 15,
    fontWeight: '500',
  },
}); 