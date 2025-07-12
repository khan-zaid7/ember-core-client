import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Footer, useFooterNavigation } from '@/components/Footer';
import DashboardHeader from '@/components/Header';
import SettingsComponent from '@/components/SettingsComponent';

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
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'server' | null>(null);

  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));

  // Get conflict data from params
  const conflictData = params.conflictData ? JSON.parse(params.conflictData as string) as ConflictData : null;

  // If no conflict data is available, show error message
  if (!conflictData) {
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

    const resolvedData = selectedResolution === 'local' ? conflictData.localData : conflictData.serverData;
    
    Alert.alert(
      'Conflict Resolved',
      `The conflict has been resolved using ${selectedResolution === 'local' ? 'your local data' : 'server data'}.`,
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
              {conflictData.entityType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Conflict
            </Text>
            <Text style={styles.entityId}>ID: {conflictData.entityId}</Text>
            <Text style={styles.conflictField}>Field: {conflictData.conflictField}</Text>
          </View>
        </View>

        {/* Data Comparison */}
        <View style={styles.comparisonContainer}>
          <Text style={styles.sectionTitle}>Conflicting Data</Text>
          
          {Object.keys(conflictData.localData).map((field) => {
            const localValue = conflictData.localData[field];
            const serverValue = conflictData.serverData[field];
            const hasConflict = localValue !== serverValue;

            if (!hasConflict) return null;

            return (
              <View key={field} style={styles.conflictItem}>
                <Text style={styles.fieldName}>{field.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</Text>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Your Data:</Text>
                  <Text style={styles.localValue}>{String(localValue)}</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Server Data:</Text>
                  <Text style={styles.serverValue}>{String(serverValue)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Resolution Options */}
        <View style={styles.resolutionContainer}>
          <Text style={styles.sectionTitle}>Choose Resolution</Text>

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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, !selectedResolution && styles.disabledButton]}
            onPress={handleConfirmResolution}
            disabled={!selectedResolution}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
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
});
