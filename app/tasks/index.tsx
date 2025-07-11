import { Footer, useFooterNavigation } from '@/components/Footer';
import Header from '@/components/Header';
import SettingsComponent from '@/components/SettingsComponent';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getTasksByUserId } from '@/services/models/TaskModel';

export default function TasksList() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Animation state for modal
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(0)).current;

  // Animation state for each task
  const [syncing, setSyncing] = useState<{ [id: string]: boolean }>({});
  const rotationAnims = useRef<{ [id: string]: Animated.Value }>({});

  // Fetch tasks for the logged-in user
  useEffect(() => {
    if (user?.user_id) {
      setLoading(true);
      try {
        const userTasks = getTasksByUserId(user.user_id);
        setTasks(userTasks);
      } catch (err) {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  // Build assignees list from tasks
  const assignees = [
    'All',
    ...Array.from(new Set(tasks.map((t) => t.assignee || t.assignTo || t.user_id || '')))
  ];

  // Filtering logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (task.assignee?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Synced' && task.status === 'synced') ||
      (statusFilter === 'Unsynced' && task.status !== 'synced');
    const matchesAssignee =
      assigneeFilter === 'All' || task.assignee === assigneeFilter || task.assignTo === assigneeFilter;
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  // Dropdown cycling logic
  const cycleStatus = () => {
    setStatusFilter((prev) =>
      prev === 'All' ? 'Synced' : prev === 'Synced' ? 'Unsynced' : 'All'
    );
  };
  const cycleAssignee = () => {
    const idx = assignees.indexOf(assigneeFilter);
    setAssigneeFilter(assignees[(idx + 1) % assignees.length]);
  };

  // Helper to start sync animation for a task
  const startSyncAnimation = (id: string) => {
    if (!rotationAnims.current[id]) {
      rotationAnims.current[id] = new Animated.Value(0);
    }
    setSyncing(prev => ({ ...prev, [id]: true }));
    rotationAnims.current[id].setValue(0);
    Animated.timing(rotationAnims.current[id], {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
      easing: undefined,
    }).start(() => {
      setSyncing(prev => ({ ...prev, [id]: false }));
      rotationAnims.current[id].setValue(0);
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <Header
        title="All Tasks"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color="#6b7280" style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Search by title or assignee"
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
      {/* Filters */}
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 8 }}>
        {/* Status Filter */}
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.7}
          onPress={cycleStatus}
        >
          <Text style={styles.filterButtonText}>Status: {statusFilter}</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>
        {/* Assignee Filter */}
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.7}
          onPress={cycleAssignee}
        >
          <Text style={styles.filterButtonText}>Assignee</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>
      </View>
      {/* Task List */}
      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 32, color: '#9e6b47', fontSize: 16 }}>
          Loading tasks...
        </Text>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.task_id || item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isSynced = item.status === 'synced';
            const isSyncing = syncing[item.task_id];
            if (!rotationAnims.current[item.task_id]) {
              rotationAnims.current[item.task_id] = new Animated.Value(0);
            }
            const spin = rotationAnims.current[item.task_id].interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            });
            return (
              <TouchableOpacity
                style={styles.recordRow}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedTask(item);
                  setModalVisible(true);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.entityType}>{item.title}</Text>
                  <Text style={styles.recordDetails}>
                    <Text style={{ color: '#f97316' }}>Assigned to: </Text>
                    <Text style={{ color: '#bfa58a' }}>{item.assignee || item.assignTo || '-'}</Text>
                  </Text>
                  <Text style={styles.recordDetails}>
                    <Text style={{ color: '#f97316' }}>Assigned by: </Text>
                    <Text style={{ color: '#bfa58a' }}>{item.created_by || '-'}</Text>
                  </Text>
                </View>
                {/* Sync icon or green dot */}
                {isSynced ? (
                  <View style={styles.greenDot} />
                ) : (
                  <TouchableOpacity
                    onPress={e => {
                      if (!isSyncing) startSyncAnimation(item.task_id);
                    }}
                    activeOpacity={isSyncing ? 1 : 0.7}
                    disabled={isSyncing}
                    style={{ marginLeft: 12 }}
                  >
                    <Animated.Image
                      source={require('../../assets/sync.png')}
                      style={{
                        width: 24,
                        height: 24,
                        tintColor: '#f97316',
                        transform: [{ rotate: spin }],
                        opacity: isSyncing ? 1 : 0.85,
                      }}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 32, color: '#9e6b47', fontSize: 16 }}>
              No tasks found.
            </Text>
          }
        />
      )}
      {/* Floating Plus Button */}
      <View style={{ position: 'absolute', right: 24, bottom: 110 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#f97316',
            borderRadius: 999,
            width: 56,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#f97316',
            shadowOpacity: 0.18,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 6,
          }}
          activeOpacity={0.8}
          onPress={() => router.push('/tasks/create' as any)}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
      {/* Task Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalFadeAnim }]}> {/* Fade animation */}
          <Pressable style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
        </Animated.View>
        <Animated.View style={[styles.modalSheet, {
          transform: [
            {
              translateY: modalSlideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            },
          ],
        }]}> {/* Slide up animation */}
          <ScrollView showsVerticalScrollIndicator={true}>
            {/* Drag handle */}
            <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
              <View style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: '#e5ded7' }} />
            </View>
            {/* Title and close */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }} />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#161412', textAlign: 'center', flex: 2 }}>Task Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ flex: 1, alignItems: 'flex-end', paddingRight: 2 }}>
                <MaterialIcons name="close" size={28} color="#161412" />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            {selectedTask && (
              <>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Title</Text>
                    <Text style={styles.infoValue}>{selectedTask.title}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={styles.infoValue}>{selectedTask.status}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Due Date</Text>
                    <Text style={styles.infoValue}>{selectedTask.due_date || '-'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Created By</Text>
                    <Text style={styles.infoValue}>{selectedTask.created_by || '-'}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Created At</Text>
                    <Text style={styles.infoValue}>{selectedTask.created_at || '-'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Task ID</Text>
                    <Text style={styles.infoValue}>
                      {selectedTask && selectedTask.task_id && typeof selectedTask.task_id === 'string' 
                        ? `${selectedTask.task_id.slice(0, 4)}...${selectedTask.task_id.slice(-4)}` 
                        : '-'
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                {/* Description at bottom */}
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={[styles.infoValue, { marginBottom: 16 }]}>{selectedTask.description || '-'}</Text>
              </>
            )}
            {/* Footer Buttons - removed */}
          </ScrollView>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  recordRow: {
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
  entityType: {
    color: '#1c130d',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recordDetails: {
    color: '#81736a',
    fontSize: 13,
    fontWeight: '400',
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    minWidth: 90,
    textAlign: 'right',
  },
  greenDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5ded7',
    marginVertical: 4,
  },
  infoLabel: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    color: '#161412',
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
