import { Footer, useFooterNavigation } from '@/components/Footer';
import DashboardHeader from '@/components/Header';
import SettingsComponent from '@/components/SettingsComponent';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getAllSyncItems, SyncQueueItem, getEntityDetails } from '@/services/models/SyncQueueModel'; // adjust path as needed
import dayjs from 'dayjs';
import { entityFieldMap } from '@/utils/displayFields';
import { getUserById } from '@/services/models/UserModel';

export default function SyncQueueRecords() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  // Entity type options (adjust as per your data)
  const entityTypeOptions = ['', 'user', 'patient', 'supply', 'task', 'location'];
  const syncStatusOptions = ['', 'success', 'pending', 'failed'];

  const [entityTypeIndex, setEntityTypeIndex] = useState(0);
  const [syncStatusIndex, setSyncStatusIndex] = useState(0);

  const entityTypeFilter = entityTypeOptions[entityTypeIndex];
  const syncStatusFilter = syncStatusOptions[syncStatusIndex];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SyncQueueItem | null>(null);
  const [showEntityDetails, setShowEntityDetails] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [pendingScroll, setPendingScroll] = useState(false);
  const [isEntityDetailsExpanded, setIsEntityDetailsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [modalContentReady, setModalContentReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  // Animation state for each record
  const [syncing, setSyncing] = useState<{ [id: string]: boolean }>({});
  const rotationAnims = useRef<{ [id: string]: Animated.Value }>({});

  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));
  const { user } = useAuth();
  const [records, setRecords] = useState<SyncQueueItem[]>([]);
  const [entityDetails, setEntityDetails] = useState<any>(null);



  // Filter logic
  const filteredRecords = records.filter(r => {
    // Normalize fields for search
    const entityId = r.entity_id?.toLowerCase() ?? '';
    const createdBy = r.created_by?.toLowerCase() ?? '';
    const syncId = r.sync_id?.toLowerCase() ?? '';
    const entityType = r.entity_type?.toLowerCase() ?? '';
    const status = r.status?.toLowerCase() ?? '';

    const searchTerm = search.trim().toLowerCase();

    // Search logic: match any field
    const matchesSearch =
      !searchTerm ||
      entityId.includes(searchTerm) ||
      createdBy.includes(searchTerm) ||
      syncId.includes(searchTerm) ||
      entityType.includes(searchTerm) ||
      status.includes(searchTerm);

    // Entity type filter (case-insensitive)
    const matchesEntityType =
      !entityTypeFilter || r.entity_type?.toLowerCase() === entityTypeFilter.toLowerCase();

    // Sync status filter (case-insensitive)
    const matchesSyncStatus =
      !syncStatusFilter || r.status?.toLowerCase() === syncStatusFilter.toLowerCase();

    return matchesSearch && matchesEntityType && matchesSyncStatus;
  });

  const formatLabel = (key: string) =>
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

  // useEffect(() => {
  //   const loadUserDetails = async () => {
  //     if (user?.user_id) {

  //     }
  //   };
  //   loadUserDetails();
  // }, [user?.user_id]);

  useEffect(() => {
    const loadRecords = () => {
      if (user?.user_id) {
        const data = getAllSyncItems(user.user_id);
        setRecords(data);
      } else {
        setRecords([]);
      }
    };
    loadRecords();
  }, [user?.user_id]);


  // Optimized openModal function
  const openModal = useCallback((record: SyncQueueItem) => {
    setSelectedRecord(record);
    setModalVisible(true);
    setIsEntityDetailsExpanded(false);
    setPendingScroll(true);
    // Fetch dynamic entity data
    const details = getEntityDetails(record.entity_type, record.entity_id);
    setEntityDetails(details);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedRecord(null);
    setIsEntityDetailsExpanded(false);
    setPendingScroll(false);
  }, []);

  // Toggle Entity Details expansion
  const toggleEntityDetails = useCallback(() => {
    setIsEntityDetailsExpanded(prev => !prev);
  }, []);

  // Animate Entity Details visibility
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isEntityDetailsExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isEntityDetailsExpanded, fadeAnim]);

  // Handle modal content layout
  const handleModalContentLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
    setModalContentReady(true);
  }, []);

  // Scroll to bottom when modal opens
  useEffect(() => {
    if (modalVisible && pendingScroll && scrollRef.current && modalContentReady) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollToEnd({ animated: true });
          setPendingScroll(false);
          setIsEntityDetailsExpanded(false);
        }
      }, 400); // Increased timeout for better modal rendering
    }
  }, [modalVisible, pendingScroll, modalContentReady]);

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
        // Reset animation values after close animation completes
        modalFadeAnim.setValue(0);
        modalSlideAnim.setValue(0);
      });
    }
  }, [modalVisible, modalFadeAnim, modalSlideAnim]);

  // Helper to start sync animation for a record
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
      <DashboardHeader
        title="Sync Queue Records"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color="#6b7280" style={{ marginLeft: 12 }} />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
      {/* Filters */}
      <Text style={{ color: '#1c130d', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>Filter by</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 12, marginBottom: 8 }}>
        {/* Entity Type Filter */}
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.7}
          onPress={() => setEntityTypeIndex((prev) => (prev + 1) % entityTypeOptions.length)}
        >
          <Text style={styles.filterButtonText}>
            Entity Type: {entityTypeFilter ? entityTypeFilter.charAt(0).toUpperCase() + entityTypeFilter.slice(1) : 'All'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>
        {/* Sync Status Filter */}
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.7}
          onPress={() => setSyncStatusIndex((prev) => (prev + 1) % syncStatusOptions.length)}
        >
          <Text style={styles.filterButtonText}>
            Sync Status: {
              syncStatusFilter === ''
                ? 'All'
                : syncStatusFilter === 'success'
                  ? 'Synced'
                  : syncStatusFilter.charAt(0).toUpperCase() + syncStatusFilter.slice(1)
            }
          </Text>
          <MaterialIcons name="arrow-drop-down" size={20} color="#1c130d" />
        </TouchableOpacity>
      </View>
      {/* Records List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.sync_id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {
          const isSynced = item.status === 'success';
          const isSyncing = syncing[item.sync_id];

          // Initialize rotation animation if it doesn't exist yet
          if (!rotationAnims.current[item.sync_id]) {
            rotationAnims.current[item.sync_id] = new Animated.Value(0);
          }

          const spin = rotationAnims.current[item.sync_id].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          });

          return (
            <View style={styles.recordRow}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => openModal(item)}
                activeOpacity={0.8}
              >
                {/* Display entity type and short sync_id */}
                <Text style={styles.entityType}>
                  {item.entity_type} ({item.sync_id.slice(0, 6)})
                </Text>

                {/* Additional details */}
                <Text style={styles.recordDetails} numberOfLines={1} ellipsizeMode="tail">
                  Last Attempt: {item.last_attempt_at ? dayjs(item.last_attempt_at).fromNow() : 'N/A'} ·
                  Created by: {item.created_by || 'N/A'} · Retry Count: {item.retry_count}
                </Text>

                {/* Truncated Entity ID */}
                <Text style={styles.entityId} numberOfLines={1} ellipsizeMode="middle">
                  Entity ID: …{item.entity_id.slice(-8)}
                </Text>
              </TouchableOpacity>

              {/* Sync Icon or Green Dot */}
              {isSynced ? (
                <View style={styles.greenDot} />
              ) : (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    if (!isSyncing) startSyncAnimation(item.sync_id);
                  }}
                  activeOpacity={isSyncing ? 1 : 0.7}
                  disabled={isSyncing}
                  style={{ marginLeft: 12 }}
                >
                  <Animated.Image
                    source={require('../assets/sync.png')}
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
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 32, color: '#9e6b47', fontSize: 16 }}>
            No records found.
          </Text>
        }
      />

      {/* Sync Record Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            { opacity: modalFadeAnim }
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={closeModal} />
        </Animated.View>
        <Animated.View
          style={[
            styles.modalSheet,
            {
              transform: [
                {
                  translateY: modalSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={true}
            onLayout={handleModalContentLayout}
          >
            {/* Drag handle */}
            <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
              <View style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: '#e5ded7' }} />
            </View>
            {/* Title and close */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }} />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#161412', textAlign: 'center', flex: 2 }}>Sync Record Details</Text>
              <TouchableOpacity onPress={closeModal} style={{ flex: 1, alignItems: 'flex-end', paddingRight: 2 }}>
                <MaterialIcons name="close" size={28} color="#161412" />
              </TouchableOpacity>
            </View>
            {/* Sync Info Section */}
            <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#161412', marginBottom: 8 }}>Sync Info</Text>
            <View style={styles.divider} />
            {/* Info grid */}
            {selectedRecord && (
              <>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Entity Type</Text>
                    <Text style={styles.infoValue}>{selectedRecord.entity_type}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Sync Status</Text>
                    <Text style={styles.infoValue}>
                      {selectedRecord.status === 'success'
                        ? 'Synced'
                        : selectedRecord.status === 'pending'
                        ? 'Pending'
                        : selectedRecord.status === 'failed'
                        ? 'Failed'
                        : selectedRecord.status || 'Unknown'}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Retry Count</Text>
                    <Text style={styles.infoValue}>{selectedRecord.retry_count}</Text>
                  </View>
                    <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Created By</Text>
                    <Text style={styles.infoValue}>
                      {
                      (() => {
                        const user = getUserById(selectedRecord.created_by);
                        return user?.name || selectedRecord.created_by || 'N/A';
                      })()
                      }
                    </Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Last Attempt At</Text>
                    <Text style={styles.infoValue}>
                      {selectedRecord.last_attempt_at
                        ? dayjs(selectedRecord.last_attempt_at).fromNow()
                        : 'N/A'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Sync ID</Text>
                    <Text style={styles.infoValue}>
                      {selectedRecord.sync_id.length > 10
                        ? `${selectedRecord.sync_id.slice(0, 4)}...${selectedRecord.sync_id.slice(-3)}`
                        : selectedRecord.sync_id}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={{ marginTop: 8, marginBottom: 8 }}>
                  <Text style={styles.infoLabel}>Entity ID</Text>
                  <Text style={styles.infoValue}>
                    {selectedRecord.entity_id.length > 10
                      ? `${selectedRecord.entity_id.slice(0, 4)}...${selectedRecord.entity_id.slice(-3)}`
                      : selectedRecord.entity_id}
                  </Text>
                </View>
              </>
            )}
            {/* Clickable Entity Details Bar */}
            <TouchableOpacity
              style={styles.entityDetailsBar}
              onPress={toggleEntityDetails}
              activeOpacity={0.7}
            >
              <Text style={styles.entityDetailsBarText}>View Entity Details</Text>
              <MaterialIcons
                name={isEntityDetailsExpanded ? "expand-less" : "expand-more"}
                size={24}
                color="#161412"
              />
            </TouchableOpacity>

            {/* Entity Details Section */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
                display: isEntityDetailsExpanded ? 'flex' : 'none',
              }}
            >
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#161412', marginTop: 18, marginBottom: 8 }}>
                  Entity Details
                </Text>
                <View style={styles.divider} />

                {entityDetails ? (
                  <>
                    {
                      // Break fields into row pairs
                      (entityFieldMap[selectedRecord?.entity_type.toLowerCase() || ''] || [])
                        .reduce((pairs: [string, string][], key, i, all) => {
                          if (i % 2 === 0) {
                            pairs.push([key, all[i + 1] || '']);
                          }
                          return pairs;
                        }, [])
                        .map(([leftKey, rightKey], idx, allPairs) => (
                          <React.Fragment key={leftKey}>
                            <View style={{ flexDirection: 'row', marginBottom: 12, marginTop: 8 }}>
                              {/* Left column */}
                              <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>{formatLabel(leftKey)}</Text>
                                <Text style={styles.infoValue}>{entityDetails[leftKey] ?? '—'}</Text>
                              </View>
                              {/* Right column (if available) */}
                              {rightKey ? (
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.infoLabel}>{formatLabel(rightKey)}</Text>
                                  <Text style={styles.infoValue}>{entityDetails[rightKey] ?? '—'}</Text>
                                </View>
                              ) : (
                                <View style={{ flex: 1 }} /> // spacer if odd
                              )}
                            </View>
                            <View style={styles.divider} />
                          </React.Fragment>
                        ))
                    }
                  </>
                ) : (
                  <Text style={{ fontSize: 15, color: '#999', marginVertical: 12 }}>
                    No details available for this entity.
                  </Text>
                )}
              </View>





            </Animated.View>
          </ScrollView>
        </Animated.View>
      </Modal>
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
  entityId: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '400',
  },
  greenDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    marginLeft: 12,
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
  entityDetailsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  entityDetailsBarText: {
    color: '#1c130d',
    fontSize: 16,
    fontWeight: '600',
  },
});
