import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Footer, useFooterNavigation } from '@/components/Footer';
import DashboardHeader from '@/components/Header';
import SettingsComponent from '@/components/SettingsComponent';
import { useAuth } from '@/context/AuthContext';
import { getConflictWithEntityDetails, markSyncSuccess } from '@/services/models/SyncQueueModel';
import { markEntitySynced } from '@/services/models/GenericModel';
import { resolveEntityConflict } from '@/services/api/apiClient';

// Components
import { 
  EntityInfo, 
  DataComparisonTable, 
  StandardResolutionOptions, 
  UniqueConstraintForm, 
  ActionButtons,
  styles as conflictStyles,
  ConflictData,
  ResolveStatus
} from '@/components/resolve-conflicts';

// Utilities
import { 
  getDisplayFields, 
  getUniqueConstraintFields, 
  getConflictFields,
  validateFieldValue, 
  formatFieldName 
} from '@/utils';

export default function ResolveConflictsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'server' | null>(null);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const [editableValues, setEditableValues] = useState<Record<string, string>>({});
  const [isResolving, setIsResolving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [allowedStrategies, setAllowedStrategies] = useState<string[]>([]);

  const { activeTab, handleTabPress } = useFooterNavigation('home', () => setSettingsModalVisible(true));

  // Get unique constraint fields and conflict data
  const uniqueConstraintFields = getUniqueConstraintFields(
    conflictData?.conflict?.conflict_field || '', 
    conflictData?.conflict?.status || ''
  );
  const isUniqueConstraintConflict = uniqueConstraintFields.length > 0;
  const isUpdateDataAllowed = allowedStrategies.includes('update_data');
  const isClientWinsAllowed = allowedStrategies.includes('client_wins');
  const shouldShowUniqueConstraintForm = isUniqueConstraintConflict && (isUpdateDataAllowed || isClientWinsAllowed);

  // Fetch conflict data & initialize values
  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      let rawData: any = null;
      const syncId = typeof params.syncId === "string" ? params.syncId : undefined;
      if (syncId && user?.user_id) {
        rawData = await getConflictWithEntityDetails(user.user_id, syncId);
      } else if (params.conflictData) {
        try {
          rawData = JSON.parse(params.conflictData as string);
        } catch (e) {
          Alert.alert('Error', 'Failed to load conflict data from parameters.');
        }
      }
      if (rawData && rawData.conflict) {
        setConflictData({
          entityType: rawData.conflict.entity_type ?? "",
          entityId: rawData.conflict.entity_id ?? "",
          conflictField: rawData.conflict.conflict_field ?? "",
          localData: rawData.clientData ?? {},
          serverData: rawData.serverData ?? {},
          conflict: rawData.conflict,
          clientData: rawData.clientData ?? {},
        });
        
        // Parse allowed strategies from the conflict data
        try {
          const strategiesData = rawData.conflict.allowed_strategies;
          if (strategiesData) {
            const strategies = typeof strategiesData === 'string' 
              ? JSON.parse(strategiesData) 
              : strategiesData;
            setAllowedStrategies(Array.isArray(strategies) ? strategies : []);
          } else {
            // Fallback to default strategies if none specified
            setAllowedStrategies(['client_wins', 'server_wins', 'merge', 'update_data']);
          }
        } catch (e) {
          console.warn('Failed to parse allowed strategies, using defaults:', e);
          setAllowedStrategies(['client_wins', 'server_wins', 'merge', 'update_data']);
        }
        
        // Initialize editable values for unique constraint fields
        if (rawData.conflict.conflict_field && rawData.clientData) {
          const fields = getUniqueConstraintFields(
            rawData.conflict.conflict_field,
            rawData.conflict.status || ''
          );
          const initialValues: Record<string, string> = {};
          fields.forEach((field: string) => {
            initialValues[field] = String(rawData.clientData[field] || '');
          });
          setEditableValues(initialValues);
        }
      } else {
        setConflictData(null);
        setAllowedStrategies([]);
      }
      setFetching(false);
    }
    fetchData();
  }, [params.syncId, user, params.conflictData]);

  // Reset selected resolution if it's not in allowed strategies
  useEffect(() => {
    if (selectedResolution && allowedStrategies.length > 0) {
      const strategy = selectedResolution === 'local' ? 'client_wins' : 'server_wins';
      if (!allowedStrategies.includes(strategy)) {
        setSelectedResolution(null);
      }
    }
  }, [allowedStrategies, selectedResolution]);

  // Get display fields and conflict fields for UI
  const allFields = getDisplayFields(
    conflictData?.conflict?.entity_type || '',
    conflictData?.clientData || {},
    conflictData?.serverData || {}
  );
  
  const conflictFields = getConflictFields(
    conflictData?.conflict?.conflict_field || '',
    uniqueConstraintFields
  );

  // Handle normal resolution
  const handleConfirmResolution = async () => {
    if (!selectedResolution || !conflictData) {
      Alert.alert('Error', 'Please select a resolution method');
      return;
    }
    
    // Validate that the selected strategy is allowed
    const strategy = selectedResolution === 'local' ? 'client_wins' : 'server_wins';
    if (!allowedStrategies.includes(strategy)) {
      Alert.alert('Error', `The "${strategy}" strategy is not allowed for this conflict`);
      return;
    }
    
    setIsResolving(true);
    try {
      const entityType = conflictData.conflict?.entity_type ?? "";
      const entityId = conflictData.conflict?.entity_id ?? "";
      const clientData = conflictData.clientData;

      const response: { success: boolean; status?: ResolveStatus; message?: string } = await resolveEntityConflict(entityType, entityId, strategy, clientData);
      if (response.success) {
        markSyncSuccess(conflictData.conflict?.sync_id ?? "");
        markEntitySynced(entityType, entityId); // Universal fix: mark entity as synced
        Alert.alert(
          'Success',
          `The conflict has been resolved using ${selectedResolution === 'local' ? 'your local data' : 'server data'}.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else if (response.status === 'already_resolved') {
        Alert.alert(
          'Conflict Already Resolved',
          'This conflict was already resolved elsewhere. Please refresh your data.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to resolve conflict');
      }
    } catch (error) {
      console.error('❌ Conflict resolution failed:', error);
      Alert.alert('Error', 'Failed to resolve conflict. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  // Handle unique constraint resolution
  const handleUniqueConstraintResolution = async () => {
    if (!conflictData) {
      Alert.alert('Error', 'No conflict data available');
      return;
    }
    
    // Determine which strategy to use for unique constraint resolution
    const strategy = isUpdateDataAllowed ? 'update_data' : 'client_wins';
    
    // Validate that the strategy is allowed
    if (!allowedStrategies.includes(strategy)) {
      Alert.alert('Error', `The "${strategy}" strategy is not allowed for this conflict`);
      return;
    }
    
    // Validate all required fields
    for (const field of uniqueConstraintFields) {
      const value = editableValues[field]?.trim();
      const error = validateFieldValue(field, value || '');
      if (error) {
        Alert.alert('Error', error);
        return;
      }
    }
    setIsResolving(true);
    try {
      const entityType = conflictData.conflict?.entity_type ?? "";
      const entityId = conflictData.conflict?.entity_id ?? "";
      const updatedClientData = {
        ...conflictData.clientData,
        ...editableValues,
      };

      const response: { success: boolean; status?: ResolveStatus; message?: string } = await resolveEntityConflict(entityType, entityId, strategy, updatedClientData);
      if (response.success) {
        markSyncSuccess(conflictData.conflict?.sync_id ?? "");
        markEntitySynced(entityType, entityId); // Universal fix: mark entity as synced
        const changedFields = uniqueConstraintFields.map(field =>
          `${formatFieldName(field)}: ${editableValues[field]}`
        ).join(', ');
        Alert.alert(
          'Success',
          `The unique constraint conflict has been resolved with new values: ${changedFields}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else if (response.status === 'already_resolved') {
        Alert.alert(
          'Conflict Already Resolved',
          'This conflict was already resolved elsewhere. Please refresh your data.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to resolve unique constraint conflict');
      }
    } catch (error) {
      console.error('❌ Unique constraint resolution failed:', error);
      Alert.alert('Error', 'Failed to resolve unique constraint conflict. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  // Error state (if conflictData never loads)
  if (!fetching && !conflictData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <DashboardHeader
          title="Resolve Conflict"
          showSettings
          onSettingsPress={() => setSettingsModalVisible(true)}
          onBackPress={() => router.back()}
        />
        <View style={conflictStyles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#f97316" />
          <Text style={conflictStyles.errorTitle}>No Conflict Data Available</Text>
          <Text style={conflictStyles.errorMessage}>
            The conflict data could not be loaded. Please try again or contact support.
          </Text>
          <TouchableOpacity style={conflictStyles.backButton} onPress={() => router.back()}>
            <Text style={conflictStyles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <Footer activeTab={activeTab} onTabPress={handleTabPress} />
        <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
      </SafeAreaView>
    );
  }

  if (fetching) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ marginTop: 16, color: '#6b7280' }}>Loading conflict data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DashboardHeader
        title="Resolve Conflict"
        showSettings
        onSettingsPress={() => setSettingsModalVisible(true)}
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            ref={scrollViewRef}
            style={conflictStyles.container}
            contentContainerStyle={conflictStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            <EntityInfo
              entityType={conflictData?.conflict?.entity_type || 'Unknown'}
              entityId={conflictData?.conflict?.entity_id || 'Unknown'}
              conflictFields={conflictFields}
            />

            <DataComparisonTable
              allFields={allFields}
              clientData={conflictData?.clientData || {}}
              serverData={conflictData?.serverData || {}}
              conflictFields={conflictFields}
            />

            <View style={conflictStyles.resolutionContainer}>
              <Text style={conflictStyles.sectionTitle}>Choose Resolution</Text>

              {shouldShowUniqueConstraintForm ? (
                <UniqueConstraintForm
                  uniqueConstraintFields={uniqueConstraintFields}
                  editableValues={editableValues}
                  onUpdateValue={(field: string, value: string) => 
                    setEditableValues(prev => ({ ...prev, [field]: value }))
                  }
                  scrollViewRef={scrollViewRef}
                />
              ) : (
                <StandardResolutionOptions
                  selectedResolution={selectedResolution}
                  onSelectResolution={setSelectedResolution}
                  allowedStrategies={allowedStrategies}
                />
              )}
              
              {/* Show message if unique constraint conflict but neither update_data nor client_wins are allowed */}
              {isUniqueConstraintConflict && !isUpdateDataAllowed && !isClientWinsAllowed && (
                <View style={conflictStyles.warningContainer}>
                  <MaterialIcons name="warning" size={24} color="#f59e0b" />
                  <Text style={conflictStyles.warningText}>
                    This is a unique constraint conflict, but neither "Update Data" nor "Use My Data" strategies are allowed. 
                    Please choose from the available standard resolution options.
                  </Text>
                </View>
              )}
            </View>

            <ActionButtons
              onCancel={() => router.back()}
              onConfirm={shouldShowUniqueConstraintForm ? handleUniqueConstraintResolution : handleConfirmResolution}
              isResolving={isResolving}
              isUniqueConstraint={shouldShowUniqueConstraintForm}
              isDisabled={
                shouldShowUniqueConstraintForm
                  ? uniqueConstraintFields.some(field => !editableValues[field]?.trim()) || isResolving
                  : !selectedResolution || isResolving || 
                    (selectedResolution === 'local' && !allowedStrategies.includes('client_wins')) ||
                    (selectedResolution === 'server' && !allowedStrategies.includes('server_wins'))
              }
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
      <SettingsComponent visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
    </SafeAreaView>
  );
}