// services/sync/handlers/syncLocation.ts
import { getLocationById } from '@/services/models/LocationsModel';
import { sendLocationToServer } from '@/services/api/apiClient';
import { SyncResponse, ProcessedSyncResult } from '../types';

export const syncLocation = async (location_id: string): Promise<ProcessedSyncResult> => {
  try {
    const location = getLocationById(location_id);
    if (!location) {
      console.warn('❌ Location not found in local DB:', location_id);
      return { success: false };
    }

    const response: SyncResponse = await sendLocationToServer(location);
    
    // Handle successful sync
    if (response.message && response.message.includes('successfully')) {
      // Check for auto-resolved cases with server ID mapping
      if (response.server_location_id && response.server_location_id !== location_id) {
        console.log(`🔄 ID mapping required: ${location_id} -> ${response.server_location_id}`);
        return {
          success: true,
          idMappingRequired: true,
          clientId: location_id,
          serverId: response.server_location_id,
          entityType: 'location'
        };
      }
      
      return { success: true };
    }
    
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during location sync:', error.response.data);
      
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
        entityType: 'location'
      };
    }

    console.error('📛 Location sync failed:', error.message);
    return { success: false };
  }
};
