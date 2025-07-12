import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // ✅ added
import DashboardHeader from '@/components/Header';
import { Footer, useFooterNavigation } from '@/components/Footer';
import { getAllRegistrations } from '@/services/models/RegistrationModel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import SettingsComponent from '@/components/SettingsComponent';
import { useAuth } from '@/context/AuthContext';

type RegistrationItem = {
  id: string;
  name: string;
  status: string;
  ago: string;
  gender: string;
};

export default function UsersList() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [syncFilter, setSyncFilter] = useState('');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));

  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);

  // ✅ Refetch on focus
  useFocusEffect(
    useCallback(() => {
      if (!user?.user_id) return;
      try {
        const data = getAllRegistrations(user.user_id).map((item) => ({
          id: item.registration_id,
          name: item.person_name,
          status: item.synced === 1 ? 'Synced' : 'Unsynced',
          gender: item.gender,
          ago: dayjs(item.timestamp).fromNow(),
        }));
        setRegistrations(data);
      } catch (err) {
        console.error('Failed to load registrations:', err);
      }
    }, [user?.user_id])
  );

  const filteredUsers = registrations.filter(u =>
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search)) &&
    (!syncFilter || u.status === syncFilter) &&
    (!genderFilter || u.gender === genderFilter)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <DashboardHeader
        title="Patients"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />

      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 24,
          height: 48,
          borderColor: '#D1D5DB',
          borderWidth: 1
        }}>
          <MaterialIcons name="search" size={24} color="#6b7280" style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Search by name or ID"
            placeholderTextColor="#6b7280"
            style={{ flex: 1, color: '#6b7280', fontSize: 16, paddingHorizontal: 8 }}
            value={search}
            onChangeText={setSearch}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>

      <Text style={{ color: '#1c130d', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>Filter by</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 12, marginBottom: 8 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f4f2f1',
            borderRadius: 999,
            paddingLeft: 16,
            paddingRight: 8,
            height: 32,
            marginRight: 8,
            borderColor: '#6b7280',
          }}
          activeOpacity={0.7}
          onPress={() => {
            setGenderFilter(prev =>
              prev === '' ? 'Male'
                : prev === 'Male' ? 'Female'
                  : ''
            );
          }}
        >
          <Text style={{ color: '#1c130d', fontSize: 14, fontWeight: '500', marginRight: 4 }}>
            Gender: {genderFilter || 'All'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f4f2f1',
            borderRadius: 999,
            paddingLeft: 16,
            paddingRight: 8,
            height: 32,
            borderColor: '#6b7280',
          }}
          activeOpacity={0.7}
          onPress={() => {
            setSyncFilter(prev =>
              prev === '' ? 'Synced'
                : prev === 'Synced' ? 'Unsynced'
                  : ''
            );
          }}
        >
          <Text style={{ color: '#1c130d', fontSize: 14, fontWeight: '500', marginRight: 4 }}>
            Sync: {syncFilter || 'All'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={{ flex: 1, maxWidth: '75%' }}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userId} numberOfLines={1} ellipsizeMode="middle">
                Registration ID: {item.id}
              </Text>
            </View>
            <Text style={[styles.userStatus, { color: item.status === 'Synced' ? '#1c130d' : '#f97316', textAlign: 'right' }]}>
              {item.status} • {item.ago}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 32, color: '#9e6b47', fontSize: 16 }}>
            No registrations found.
          </Text>
        }
      />

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
      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
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
