// services/sync/handlers/syncUser.ts
import { getUserById } from '@/services/models/UserModel';
import { sendUserToServer } from '@/services/api/apiClient';

export const syncUser = async (user_id: string): Promise<{
  success: boolean;
  status?: number;
  conflict_field?: string;
  latest_data?: any;
}> => {
  try {
    const user = getUserById(user_id);
    if (!user) {
      console.warn('❌ User not found in local DB:', user_id);
      return { success: false };
    }

    await sendUserToServer(user);
    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during user sync:', error.response.data);
      return {
        success: false,
        status: 409,
        conflict_field: error.response.data.conflict_field,
        latest_data: error.response.data.latest_data,
      };
    }

    console.error('📛 User sync failed:', error.message);
    return { success: false };
  }
};
