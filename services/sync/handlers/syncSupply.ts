// services/sync/handlers/syncSupply.ts
import { getSupplyById } from '@/services/models/SuppliesModel';
import { sendSupplyToServer } from '@/services/api/apiClient';
import { SyncResponse, ProcessedSyncResult } from '../types';

export const syncSupply = async (supply_id: string): Promise<ProcessedSyncResult> => {
  try {
    const supply = getSupplyById(supply_id);
    if (!supply) {
      console.warn('❌ Supply not found in local DB:', supply_id);
      return { success: false };
    }

    const response: SyncResponse = await sendSupplyToServer(supply);
    
    // Handle successful sync
    if (response.message && response.message.includes('successfully')) {
      // Check for auto-resolved cases with server ID mapping
      if (response.server_supply_id && response.server_supply_id !== supply_id) {
        console.log(`🔄 ID mapping required: ${supply_id} -> ${response.server_supply_id}`);
        return {
          success: true,
          idMappingRequired: true,
          clientId: supply_id,
          serverId: response.server_supply_id,
          entityType: 'supply'
        };
      }
      
      return { success: true };
    }
    
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during supply sync:', error.response.data);
      
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
        entityType: 'supply'
      };
    }

    console.error('📛 Supply sync failed:', error.message);
    return { success: false };
  }
};
