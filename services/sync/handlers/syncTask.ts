// services/sync/handlers/syncTask.ts
import { getTaskById } from '@/services/models/TaskModel';
import { sendTaskToServer } from '@/services/api/apiClient';

export const syncTask = async (task_id: string): Promise<{
  success: boolean;
  status?: number;
  conflict_field?: string;
  latest_data?: any;
}> => {
  try {
    const task = getTaskById(task_id);
    if (!task) {
      console.warn('❌ Task not found in local DB:', task_id);
      return { success: false };
    }

    console.log('✅ Task data being sent:', task);
    await sendTaskToServer(task);
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during task sync:', error.response.data);
      return {
        success: false,
        status: 409,
        conflict_field: error.response.data.conflict_field,
        latest_data: error.response.data.latest_data,
      };
    }

    console.error('📛 Task sync failed:', error.message);
    return { success: false };
  }
};
