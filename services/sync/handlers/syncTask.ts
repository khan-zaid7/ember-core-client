// services/sync/handlers/syncTask.ts
import { getTaskById } from '@/services/models/TaskModel';
import { sendTaskToServer } from '@/services/api/apiClient';
import { SyncResponse, ProcessedSyncResult } from '../types';

export const syncTask = async (task_id: string): Promise<ProcessedSyncResult> => {
  try {
    const task = getTaskById(task_id);
    if (!task) {
      console.warn('❌ Task not found in local DB:', task_id);
      return { success: false };
    }

    const response: SyncResponse = await sendTaskToServer(task);
    
    // Handle successful sync
    if (response.message && response.message.includes('successfully')) {
      // Check for auto-resolved cases with server ID mapping
      if (response.server_task_id && response.server_task_id !== task_id) {
        console.log(`🔄 ID mapping required: ${task_id} -> ${response.server_task_id}`);
        return {
          success: true,
          idMappingRequired: true,
          clientId: task_id,
          serverId: response.server_task_id,
          entityType: 'task'
        };
      }
      
      return { success: true };
    }
    
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during task sync:', error.response.data);
      
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
        entityType: 'task'
      };
    }

    console.error('📛 Task sync failed:', error.message);
    return { success: false };
  }
};
