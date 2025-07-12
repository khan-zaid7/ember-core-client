import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Footer, useFooterNavigation } from '@/components/Footer';
import DashboardHeader from '@/components/Header';
import SettingsComponent from '@/components/SettingsComponent';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const staticConflicts = [
  {
    id: 1,
    type: 'Patient',
    description: 'Duplicate patient registration for John Doe.',
    date: '2025-07-10',
    status: 'pending',
    conflictField: 'email',
  },
  {
    id: 2,
    type: 'Medical Supply',
    description: 'Conflicting supply count for Paracetamol.',
    date: '2025-07-09',
    status: 'pending',
    conflictField: 'quantity',
  },
  {
    id: 3,
    type: 'Task',
    description: 'Task assignment conflict for fieldworker.',
    date: '2025-07-08',
    status: 'resolved',
    conflictField: 'assigned_to',
  },
  {
    id: 4,
    type: 'User',
    description: 'User role mismatch detected.',
    date: '2025-07-07',
    status: 'pending',
    conflictField: 'role',
  },
  {
    id: 5,
    type: 'Record',
    description: 'Conflicting record update for patient Jane Smith.',
    date: '2025-07-06',
    status: 'pending',
    conflictField: 'medical_history',
  },
  {
    id: 6,
    type: 'Location',
    description: 'GPS coordinates mismatch for clinic location.',
    date: '2025-07-05',
    status: 'resolved',
    conflictField: 'coordinates',
  },
  {
    id: 7,
    type: 'Alert',
    description: 'Duplicate emergency alert for same incident.',
    date: '2025-07-04',
    status: 'pending',
    conflictField: 'alert_id',
  },
  {
    id: 8,
    type: 'Task Assignment',
    description: 'Multiple assignments for same volunteer.',
    date: '2025-07-03',
    status: 'resolved',
    conflictField: 'volunteer_id',
  },
];

export default function ConflictsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));

  const statusOptions = ['', 'pending', 'resolved'];
  const typeOptions = ['', 'Patient', 'Medical Supply', 'Task', 'User', 'Record', 'Location', 'Alert', 'Task Assignment'];

  const filteredConflicts = staticConflicts.filter(conflict => {
    const matchesSearch = !search || 
      conflict.type.toLowerCase().includes(search.toLowerCase()) ||
      conflict.description.toLowerCase().includes(search.toLowerCase()) ||
      conflict.conflictField.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !statusFilter || conflict.status === statusFilter;
    const matchesType = !typeFilter || conflict.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const renderConflictItem = ({ item }: { item: typeof staticConflicts[0] }) => {
    const isResolved = item.status === 'resolved';
    
    return (
      <View style={styles.conflictRow}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            // Navigate to conflict details - for now just show alert
            console.log('Conflict details:', item);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.conflictType}>
            {item.type} Conflict
          </Text>
          
          <Text style={styles.conflictDescription} numberOfLines={2} ellipsizeMode="tail">
            {item.description}
          </Text>
          
          <Text style={styles.conflictDetails}>
            Field: {item.conflictField} · {dayjs(item.date).fromNow()}
          </Text>
        </TouchableOpacity>

        {/* Status indicator */}
        {isResolved ? (
          <View style={styles.resolvedDot} />
        ) : (
          <View style={styles.pendingDot} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DashboardHeader
        title="Conflicts"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />
      
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color="#6b7280" style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Search conflicts..."
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filters */}
      <Text style={styles.filterTitle}>Filter by</Text>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            const currentIndex = statusOptions.indexOf(statusFilter);
            const nextIndex = (currentIndex + 1) % statusOptions.length;
            setStatusFilter(statusOptions[nextIndex]);
          }}
        >
          <Text style={styles.filterButtonText}>
            Status: {statusFilter || 'All'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            const currentIndex = typeOptions.indexOf(typeFilter);
            const nextIndex = (currentIndex + 1) % typeOptions.length;
            setTypeFilter(typeOptions[nextIndex]);
          }}
        >
          <Text style={styles.filterButtonText}>
            Type: {typeFilter || 'All'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <MaterialIcons name="info" size={20} color="#3b82f6" />
        <Text style={styles.infoText}>
          Conflicts occur when local data changes conflict with server data. Resolve them to ensure data consistency.
        </Text>
      </View>

      {/* Conflicts List */}
      <FlatList
        data={filteredConflicts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConflictItem}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="check-circle" size={64} color="#4ade80" />
            <Text style={styles.emptyText}>
              {search.trim() !== '' ? "No conflicts match your search" : "No conflicts found"}
            </Text>
            <Text style={styles.emptySubtext}>
              {search.trim() !== '' ? "Try a different search term" : "All your data is in sync!"}
            </Text>
          </View>
        }
      />

      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    height: 48,
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    color: '#6b7280',
    fontSize: 16,
    paddingHorizontal: 8,
  },
  filterTitle: {
    color: '#1c130d',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f2f1',
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 8,
    height: 32,
    borderColor: '#6b7280',
    marginRight: 8,
  },
  filterButtonText: {
    color: '#1c130d',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0369a1',
    flex: 1,
  },
  conflictRow: {
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
  conflictType: {
    color: '#1c130d',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  conflictDescription: {
    color: '#81736a',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
  },
  conflictDetails: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '400',
  },
  resolvedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    marginLeft: 12,
  },
  pendingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f59e0b',
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
