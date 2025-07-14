// services/sync/handlers/syncRegistration.ts
import { getRegistrationById } from '@/services/models/RegistrationModel';
import { sendRegistrationToServer } from '@/services/api/apiClient';
import { SyncResponse, ProcessedSyncResult } from '../types';

export const syncRegistration = async (registration_id: string): Promise<ProcessedSyncResult> => {
  try {
    const registration = getRegistrationById(registration_id);
    if (!registration) {
      console.warn('❌ Registration not found in local DB:', registration_id);
      return { success: false };
    }
    
    const response: SyncResponse = await sendRegistrationToServer(registration);
    // Handle successful sync
    if (response.message && response.message.includes('successfully')) {
      // Check for auto-resolved cases with server ID mapping
      if (response.server_registration_id && response.server_registration_id !== registration_id) {
        console.log(`🔄 ID mapping required: ${registration_id} -> ${response.server_registration_id}`);
        return {
          success: true,
          idMappingRequired: true,
          clientId: registration_id,
          serverId: response.server_registration_id,
          entityType: 'registration'
        };
      }
      
      return { success: true };
    }
    
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during registration sync:', error.response.data);
      
      const conflictData: SyncResponse = error.response.data;
      
      return {
        success: false,
        status: 409,
        conflict_field: conflictData.conflict_field,
        latest_data: conflictData.latest_data,
        allowed_strategies: conflictData.allowed_strategies,
        // Include ID mapping info for potential duplicate conflicts
        idMappingRequired: !!(conflictData.client_id && conflictData.server_id && 
                          conflictData.client_id !== conflictData.server_id),
        clientId: conflictData.client_id,
        serverId: conflictData.server_id,
        entityType: 'registration'
      };
    }

    console.error('📛 Registration sync failed:', error.message);
    return { success: false };
  }
};
