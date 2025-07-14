// services/sync/handlers/syncTaskAssignment.ts
import { getTaskAssignmentById } from '@/services/models/TaskAssignmentModel';
import { sendTaskAssignmentToServer } from '@/services/api/apiClient';
import { SyncResponse, ProcessedSyncResult } from '../types';

export const syncTaskAssignment = async (assignment_id: string): Promise<ProcessedSyncResult> => {
  try {
    const assignment = getTaskAssignmentById(assignment_id);
    if (!assignment) {
      console.warn('❌ Task Assignment not found in local DB:', assignment_id);
      return { success: false };
    }

    const response: SyncResponse = await sendTaskAssignmentToServer(assignment);
    
    // Handle successful sync
    if (response.message && response.message.includes('successfully')) {
      // Check for auto-resolved cases with server ID mapping
      if (response.server_assignment_id && response.server_assignment_id !== assignment_id) {
        console.log(`🔄 ID mapping required: ${assignment_id} -> ${response.server_assignment_id}`);
        return {
          success: true,
          idMappingRequired: true,
          clientId: assignment_id,
          serverId: response.server_assignment_id,
          entityType: 'task_assignment'
        };
      }
      
      return { success: true };
    }
    
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during task assignment sync:', error.response.data);
      
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
        entityType: 'task_assignment'
      };
    }

    console.error('📛 Task Assignment sync failed:', error.message);
    return { success: false };
  }
};
