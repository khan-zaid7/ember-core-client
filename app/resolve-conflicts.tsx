import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Footer, useFooterNavigation } from '@/components/Footer';
import DashboardHeader from '@/components/Header';
import SettingsComponent from '@/components/SettingsComponent';
import { useAuth } from '@/context/AuthContext';
import { getConflictWithEntityDetails } from '@/services/models/SyncQueueModel';

// Interface for conflict data structure
interface ConflictData {
  entityType: string;
  entityId: string;
  conflictField: string;
  localData: Record<string, any>;
  serverData: Record<string, any>;
}

export default function ResolveConflictsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'server' | null>(null);
  const [conflictData, setConflictData] = useState<any>(null);
  const [editableValue, setEditableValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));

  // Check if this is a unique constraint conflict
  // For testing purposes, let's assume email conflicts are unique constraint conflicts
  const isUniqueConstraintConflict = conflictData?.conflict?.conflict_field === 'email' || 
                                   conflictData?.conflict?.status === 'unique_constraint_violation';

  useEffect(() => {
    const syncId = params.syncId as string;
    if (syncId && user?.user_id) {
      const data = getConflictWithEntityDetails(user.user_id, syncId);
      setConflictData(data);
      console.log(data);
      
      // Initialize editable value with local data for the conflicting field
      if (data?.conflict?.conflict_field && data?.clientData) {
        setEditableValue(String(data.clientData[data.conflict.conflict_field] || ''));
      }
    }
  }, [params.syncId, user]);

  // Get conflict data from params - keep for backward compatibility
  const legacyConflictData = params.conflictData ? JSON.parse(params.conflictData as string) as ConflictData : null;

  // If no conflict data is available, show error message
  if (!conflictData && !legacyConflictData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <DashboardHeader
          title="Resolve Conflict"
          showSettings
          onSettingsPress={() => setSettingsModalVisible(true)}
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#f97316" />
          <Text style={styles.errorTitle}>No Conflict Data Available</Text>
          <Text style={styles.errorMessage}>
            The conflict data could not be loaded. Please try again or contact support.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <Footer activeTab={activeTab} onTabPress={handleTabPress} />
        <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
      </SafeAreaView>
    );
  }

  const handleConfirmResolution = () => {
    if (!selectedResolution) {
      Alert.alert('Error', 'Please select a resolution method');
      return;
    }

    const resolvedData = selectedResolution === 'local' ? conflictData?.clientData : conflictData?.serverData;
    
    Alert.alert(
      'Conflict Resolved',
      `The conflict has been resolved using ${selectedResolution === 'local' ? 'your local data' : 'server data'}.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleUniqueConstraintResolution = () => {
    if (!editableValue.trim()) {
      Alert.alert('Error', 'Please enter a valid value');
      return;
    }

    // Here you would make the API call to resolve the unique constraint conflict
    // For now, we'll just show a success message
    Alert.alert(
      'Conflict Resolved',
      `The unique constraint conflict has been resolved with the new value: ${editableValue}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DashboardHeader
        title="Resolve Conflict"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.container}>
        {/* Entity Info */}
        <View style={styles.entityInfo}>
          <MaterialIcons name="warning" size={24} color="#f97316" />
          <View style={styles.entityDetails}>
            <Text style={styles.entityType}>
              {conflictData?.conflict?.entity_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown'} Conflict
            </Text>
            <Text style={styles.entityId}>ID: {conflictData?.conflict?.entity_id || 'Unknown'}</Text>
            <Text style={styles.conflictField}>Field: {conflictData?.conflict?.conflict_field || 'Unknown'}</Text>
          </View>
        </View>

        {/* Data Comparison */}
        <View style={styles.comparisonContainer}>
          <Text style={styles.sectionTitle}>Conflicting Fields</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Field</Text>
            <Text style={styles.tableHeaderText}>Your Data{'\n'}(Local)</Text>
            <Text style={styles.tableHeaderText}>Server Data</Text>
          </View>

          {/* Table Rows */}
          {Object.keys(conflictData?.clientData || {}).map((field) => {
            const localValue = conflictData?.clientData?.[field];
            const serverValue = conflictData?.serverData?.[field];
            const isConflictingField = field === conflictData?.conflict?.conflict_field;

            // Skip fields that don't exist in server data or are null/undefined in both
            if (serverValue === undefined || (localValue == null && serverValue == null)) return null;

            return (
              <View key={field} style={[styles.tableRow, isConflictingField && styles.conflictRow]}>
                <Text style={[styles.fieldCell, isConflictingField && styles.conflictText]}>
                  {field.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Text>
                <Text style={[styles.dataCell, isConflictingField && styles.conflictText]}>
                  {String(localValue || 'N/A')}
                </Text>
                <Text style={[styles.dataCell, isConflictingField && styles.conflictText]}>
                  {String(serverValue || 'N/A')}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Resolution Options */}
        <View style={styles.resolutionContainer}>
          <Text style={styles.sectionTitle}>Choose Resolution</Text>

          {isUniqueConstraintConflict ? (
            // Unique constraint conflict - show editable form
            <View>
              <Text style={styles.uniqueConstraintText}>
                This field has a unique constraint violation. Please enter a new unique value:
              </Text>
              
              <View style={styles.editableContainer}>
                <Text style={styles.editableLabel}>
                  New {conflictData?.conflict?.conflict_field?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}:
                </Text>
                <TextInput
                  style={styles.editableInput}
                  value={editableValue}
                  onChangeText={setEditableValue}
                  placeholder={`Enter new ${conflictData?.conflict?.conflict_field?.replace(/_/g, ' ')}`}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          ) : (
            // Normal conflict - show resolution buttons
            <View>
              <TouchableOpacity
                style={[styles.resolutionOption, selectedResolution === 'local' && styles.selectedOption]}
                onPress={() => setSelectedResolution('local')}
              >
                <MaterialIcons name="arrow-forward" size={24} color={selectedResolution === 'local' ? '#f97316' : '#6b7280'} />
                <Text style={[styles.optionTitle, selectedResolution === 'local' && styles.selectedOptionTitle]}>
                  Use My Data
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resolutionOption, selectedResolution === 'server' && styles.selectedOption]}
                onPress={() => setSelectedResolution('server')}
              >
                <MaterialIcons name="arrow-back" size={24} color={selectedResolution === 'server' ? '#f97316' : '#6b7280'} />
                <Text style={[styles.optionTitle, selectedResolution === 'server' && styles.selectedOptionTitle]}>
                  Use Server Data
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {isUniqueConstraintConflict ? (
            <TouchableOpacity
              style={[styles.confirmButton, !editableValue.trim() && styles.disabledButton]}
              onPress={() => handleUniqueConstraintResolution()}
              disabled={!editableValue.trim()}
            >
              <Text style={styles.confirmButtonText}>Send</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.confirmButton, !selectedResolution && styles.disabledButton]}
              onPress={handleConfirmResolution}
              disabled={!selectedResolution}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#9e6b47',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  entityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f4ece6',
  },
  entityDetails: {
    marginLeft: 12,
    flex: 1,
  },
  entityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c130d',
  },
  entityId: {
    fontSize: 14,
    color: '#81736a',
    marginTop: 2,
  },
  conflictField: {
    fontSize: 14,
    color: '#f97316',
    marginTop: 2,
  },
  comparisonContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c130d',
    marginBottom: 16,
  },
  conflictItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f4ece6',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  conflictRow: {
    backgroundColor: '#fef2f2',
    borderBottomColor: '#fecaca',
  },
  fieldCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'left',
    paddingRight: 8,
  },
  dataCell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  conflictText: {
    color: '#f97316',
    fontWeight: '600',
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c130d',
    marginBottom: 8,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f97316',
    width: 100,
  },
  localValue: {
    fontSize: 14,
    color: '#161412',
    fontWeight: '400',
    flex: 1,
  },
  serverValue: {
    fontSize: 14,
    color: '#161412',
    fontWeight: '400',
    flex: 1,
  },
  resolutionContainer: {
    marginBottom: 24,
  },
  resolutionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f2f1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  selectedOption: {
    backgroundColor: '#ffffff',
    borderColor: '#f97316',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c130d',
    marginLeft: 12,
  },
  selectedOptionTitle: {
    color: '#f97316',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f4f2f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#f97316',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  uniqueConstraintText: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  editableContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f4ece6',
  },
  editableLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c130d',
    marginBottom: 8,
  },
  editableInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
});
