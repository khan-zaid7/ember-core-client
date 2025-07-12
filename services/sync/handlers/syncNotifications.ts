import { getNotificationById } from '@/services/models/NotificationModel';
import { sendNotificationToServer } from '@/services/api/apiClient';

export const syncNotification = async (notification_id: string): Promise<{
  success: boolean;
  status?: number;
  conflict_field?: string;
  latest_data?: any;
}> => {
  try {
    const notification = await getNotificationById(notification_id);
    if (!notification) {
      console.warn('❌ Notification not found in local DB:', notification_id);
      return { success: false };
    }

    console.log('✅ Notification data being sent:', notification);
    // Ensure entity_type and entity_id are present in the payload
    await sendNotificationToServer({
      ...notification,
      entity_type: notification.entity_type ?? '',
      entity_id: notification.entity_id ?? ''
    });

    return { success: true };

  } catch (error: any) {
    if (error.response?.status === 409) {
      console.warn('⚠️ Conflict during notification sync:', error.response.data);
      return {
        success: false,
        status: 409,
        conflict_field: error.response.data.conflict_field,
        latest_data: error.response.data.latest_data,
      };
    }

    console.error('📛 Notification sync failed:', error.message);
    return { success: false };
  }
};
