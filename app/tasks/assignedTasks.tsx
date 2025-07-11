import { Footer, useFooterNavigation } from '@/components/Footer';
import Header from '@/components/Header';
import SettingsComponent from '@/components/SettingsComponent';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getTasksByUserId } from '@/services/models/TaskModel';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Task {
  task_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_by: string;
  created_by_name: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  synced: number;
  assignment_status: string;
  assignment_feedback: string;
  assigned_at: string;
}

export default function TasksList() {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Animation state for each task
  const [syncing, setSyncing] = useState<{ [id: string]: boolean }>({});
  const rotationAnims = useRef<{ [id: string]: Animated.Value }>({});

  // Animation state for modal
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(0)).current;

  // Load tasks when component mounts or user changes
  useEffect(() => {
    if (user?.user_id) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      if (user?.user_id) {
        const userTasks = getTasksByUserId(user.user_id);
        setTasks(userTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique assignees for filter (since all tasks are assigned to current user, this would be their name)
  const assignees = [
    'All',
    user?.name || 'Current User'
  ];

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  // Helper function to get sync status display
  const getSyncStatus = (synced: number) => {
    return synced === 1 ? 'Synced' : 'Unsynced';
  };

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return '1d ago';
      return `${diffInDays}d ago`;
    } catch {
      return '-';
    }
  };

  // Animate modal open/close
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(modalFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(modalSlideAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalFadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(modalSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        modalFadeAnim.setValue(0);
        modalSlideAnim.setValue(0);
      });
    }
  }, [modalVisible, modalFadeAnim, modalSlideAnim]);

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return '#ef4444'; // red
      case 'high':
        return '#f97316'; // orange
      case 'normal':
        return '#3b82f6'; // blue
      case 'low':
        return '#22c55e'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  // Helper function to get priority display text
  const getPriorityDisplay = (priority: string) => {
    return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Normal';
  };

  // Filtering logic
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.created_by_name && task.created_by_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Synced' && task.synced === 1) ||
      (statusFilter === 'Unsynced' && task.synced === 0);
    const matchesPriority =
      priorityFilter === 'All' || task.priority?.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Dropdown cycling logic
  const cycleStatus = () => {
    setStatusFilter((prev) =>
      prev === 'All' ? 'Synced' : prev === 'Synced' ? 'Unsynced' : 'All'
    );
  };
  const priorities = ['All', 'Low', 'Normal', 'High', 'Urgent'];
  const cyclePriority = () => {
    const idx = priorities.findIndex(p => p.toLowerCase() === priorityFilter.toLowerCase());
    setPriorityFilter(priorities[(idx + 1) % priorities.length]);
  };

  // Helper to start sync animation for a task
  const startSyncAnimation = (taskId: string) => {
    if (!rotationAnims.current[taskId]) {
      rotationAnims.current[taskId] = new Animated.Value(0);
    }
    setSyncing(prev => ({ ...prev, [taskId]: true }));
    rotationAnims.current[taskId].setValue(0);
    Animated.timing(rotationAnims.current[taskId], {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setSyncing(prev => ({ ...prev, [taskId]: false }));
      rotationAnims.current[taskId].setValue(0);
      // Refresh tasks after sync animation completes
      loadTasks();
    });
  };

  return (
    <AuthGuard>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Header */}
        <Header
          title="All Tasks"
          showSettings
          onSettingsPress={() => setSettingsModalVisible(true)}
          onBackPress={() => router.back()}
        />

        {/* Refresh indicator and stats */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#81736a', fontSize: 14 }}>
              {tasks.length} tasks total
            </Text>
            <TouchableOpacity
              onPress={loadTasks}
              style={{ flexDirection: 'row', alignItems: 'center' }}
              disabled={loading}
            >
              <MaterialIcons
                name="refresh"
                size={20}
                color={loading ? '#ccc' : '#f97316'}
                style={{ marginRight: 4 }}
              />
              <Text style={{ color: loading ? '#ccc' : '#f97316', fontSize: 14 }}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
          {/* Priority Filter */}
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.7}
            onPress={cyclePriority}
          >
            <Text style={styles.filterButtonText}>Priority: {priorityFilter}</Text>
            <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
          </TouchableOpacity>
        </View>
        {/* Task List */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#9e6b47', fontSize: 16 }}>Loading tasks...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.task_id}
            contentContainerStyle={{ paddingBottom: 100 }}
            // Add extraData to force re-render on modal open/close
            extraData={modalVisible}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recordRow}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedTask(item);
                  setModalVisible(true);
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={styles.entityType}>{item.title}</Text>
                    <View style={{
                      backgroundColor: getPriorityColor(item.priority),
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      marginLeft: 8,
                      alignSelf: 'flex-start',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{getPriorityDisplay(item.priority)}</Text>
                    </View>
                  </View>
                  <Text style={styles.recordDetails}>
                    <Text style={{ color: '#f97316' }}>Assigned to: </Text>
                    <Text style={{ color: '#bfa58a' }}>{user?.name || 'You'}</Text>
                  </Text>
                  <Text style={styles.recordDetails}>
                    <Text style={{ color: '#f97316' }}>Assigned by: </Text>
                    <Text style={{ color: '#bfa58a' }}>{item.created_by_name || 'Unknown'}</Text>
                  </Text>
                  <Text style={styles.recordDetails}>
                    <Text style={{ color: '#f97316' }}>Status: </Text>
                    <Text style={{ color: getSyncStatus(item.synced) === 'Synced' ? '#22c55e' : '#f97316' }}>
                      {getSyncStatus(item.synced)}
                    </Text>
                    <Text style={{ color: '#81736a', marginLeft: 8 }}>• {getTimeAgo(item.created_at)}</Text>
                  </Text>
                </View>
                <MaterialIcons name="keyboard-arrow-down" size={28} color="#f97316" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 32, color: '#9e6b47', fontSize: 16 }}>
                No tasks found.
              </Text>
            }
          />
        )}
        {/* Task Details Modal */}
        {/* Replace your entire Modal with this simplified version */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide" // Keep this as "slide" instead of "none"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <ScrollView showsVerticalScrollIndicator={true}>
                {/* Drag handle */}
                <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
                  <View style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: '#e5ded7' }} />
                </View>

                {/* Title and close - FIXED by replacing MaterialIcons */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <View style={{ flex: 1 }} />
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#161412', textAlign: 'center', flex: 2 }}>Task Details</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{ flex: 1, alignItems: 'flex-end', paddingRight: 2 }}>
                    <Text style={{ fontSize: 24, color: '#161412' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {selectedTask && (
                  <>
                    {/* First row */}
                    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>Title</Text>
                        <Text style={styles.infoValue}>{selectedTask.title}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <Text style={styles.infoValue}>{getSyncStatus(selectedTask.synced)}</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Second row */}
                    <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>Due Date</Text>
                        <Text style={styles.infoValue}>{selectedTask.due_date ? formatDate(selectedTask.due_date) : '-'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>Created By</Text>
                        <Text style={styles.infoValue}>{selectedTask.created_by_name || 'Unknown'}</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Third row */}
                    <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>Created At</Text>
                        <Text style={styles.infoValue}>{formatDate(selectedTask.created_at)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>Task ID</Text>
                        <Text style={styles.infoValue}>
                          {selectedTask.task_id ? `${selectedTask.task_id.slice(0, 4)}...${selectedTask.task_id.slice(-4)}` : '-'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Fourth row - Priority row (fixed version) */}
                    <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>Priority</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {/* Priority badge */}
                          <View style={{
                            backgroundColor: getPriorityColor(selectedTask.priority),
                            borderRadius: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginRight: 6,
                            alignSelf: 'flex-start',
                          }}>
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                              {getPriorityDisplay(selectedTask.priority)}
                            </Text>
                          </View>

                          {/* Priority text */}
                          {typeof selectedTask.priority === 'string' ? (
                            <Text style={styles.infoValue}>{selectedTask.priority || '-'}</Text>
                          ) : (
                            <Text style={styles.infoValue}>-</Text>
                          )}
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>Assignment Status</Text>
                        <Text style={styles.infoValue}>{selectedTask.assignment_status || '-'}</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Description at bottom */}
                    <Text style={styles.infoLabel}>Description</Text>
                    <Text style={[styles.infoValue, { marginBottom: 16 }]}>{selectedTask.description || '-'}</Text>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Footer activeTab={activeTab} onTabPress={handleTabPress} />
        <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
      </SafeAreaView>
    </AuthGuard>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',  // This ensures modal appears from bottom
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',  // Limit height to 80% of screen
  },
});
