// services/sync/handlers/syncTaskAssignment.ts
import { getTaskAssignmentById } from '@/services/models/TaskAssignmentModel';
import { sendTaskAssignmentToServer } from '@/services/api/apiClient';

export const syncTaskAssignment = async (assignment_id: string): Promise<{
  success: boolean;
  status?: number;
  conflict_field?: string;
  latest_data?: any;
}> => {
  try {
    const assignment = getTaskAssignmentById(assignment_id);
    if (!assignment) {
      console.warn('❌ Task Assignment not found in local DB:', assignment_id);
      return { success: false };
    }

    console.log('✅ Task Assignment data being sent:', assignment);
    await sendTaskAssignmentToServer(assignment);
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during task assignment sync:', error.response.data);
      return {
        success: false,
        status: 409,
        conflict_field: error.response.data.conflict_field,
        latest_data: error.response.data.latest_data,
      };
    }

    console.error('📛 Task Assignment sync failed:', error.message);
    return { success: false };
  }
};
