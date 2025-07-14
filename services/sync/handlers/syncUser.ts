// services/sync/handlers/syncUser.ts
import { getUserById } from '@/services/models/UserModel';
import { sendUserToServer } from '@/services/api/apiClient';
import { SyncResponse, ProcessedSyncResult } from '../types';

export const syncUser = async (user_id: string): Promise<ProcessedSyncResult> => {
  try {
    const user = getUserById(user_id);
    if (!user) {
      console.warn('❌ User not found in local DB:', user_id);
      return { success: false };
    }

    const response: SyncResponse = await sendUserToServer(user);
    
    // Handle successful sync
    if (response.message && response.message.includes('successfully')) {
      // Check for auto-resolved cases with server ID mapping
      if (response.server_user_id && response.server_user_id !== user_id) {
        console.log(`🔄 ID mapping required: ${user_id} -> ${response.server_user_id}`);
        return {
          success: true,
          idMappingRequired: true,
          clientId: user_id,
          serverId: response.server_user_id,
          entityType: 'user'
        };
      }
      
      return { success: true };
    }
    
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during user sync:', error.response.data);
      
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
        entityType: 'user'
      };
    }

    console.error('📛 User sync failed:', error.message);
    return { success: false };
  }
};
