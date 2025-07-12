// services/api/apiClient.ts
import axios from 'axios';
import { insertNotification, checkExistingConflictNotification } from '../models/NotificationModel';
import { generateUUID } from '../../utils/generateUUID';
import { showNotification } from '../../utils/notificationManager';

// const API_BASE_URL = 'http://localhost:5000/api/sync'; 
const API_BASE_URL = 'http://172.20.10.4:5000/api/sync'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// Helper function to handle conflict errors and create notifications
const handleConflictError = (error: any, entityType: string, entityData: any) => {
  if (error.response?.status === 409) {
    const errorMessage = `A conflict was detected while syncing ${entityType}: ${error.response.data?.message || 'Data already exists or has been modified'}`;
    
    // Create a unique conflict key based on entity type and ID
    // This helps us avoid duplicate notifications for the same conflict
    const entityId = entityData.id || entityData[`${entityType}_id`] || '';
    const conflictKey = `${entityType}_${entityId}_conflict`;
    
    // Create a notification for the conflict
    const notification = {
      notification_id: generateUUID(),
      user_id: entityData.user_id || '',
      title: 'Sync Conflict',
      message: errorMessage,
      type: 'warning',
      entity_type: entityType,
      entity_id: entityId,
      received_at: new Date().toISOString(),
      read: 0, // Keep as unread
      synced: 1, // This notification doesn't need to be synced as it's about a sync issue
      archived: 0,
      sync_status_message: `UI_SHOWN_${conflictKey}` // Include the conflict key to identify this specific conflict
    };
    
    // Check if we've already notified about this specific conflict in this session
    const hasExistingConflict = checkExistingConflictNotification(
      entityData.user_id || '',
      entityType,
      entityId,
      conflictKey
    );
    
    // Only notify if we haven't seen this exact conflict recently (within a day)
    if (!hasExistingConflict) {
      // Save to database
      insertNotification(notification);
      
      // Show immediate UI notification
      showNotification(errorMessage, 'warning', 'Sync Conflict');
    } else {
      console.log(`Skipping duplicate conflict notification for ${entityType} ${entityId}`);
    }
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
  throw error;
};

export const sendUserToServer = async (user: any) => {
  try {
    

    const response = await axios.post(`${API_BASE_URL}/user`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5s timeout
    });

    console.log('✅ User synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'user', user);
    }
    throw error;
  }
};

// 🧩 REGISTRATION
export const sendRegistrationToServer = async (registration: any) => {
  try {
    
    const response = await axiosInstance.post('/registration', registration);
    console.log('✅ Registration synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'registration', registration);
    }
    throw error;
  }
};

// 🧩 LOCATION
export const sendLocationToServer = async (location: any) => {
  try {
    
    const response = await axiosInstance.post('/location', location);
    console.log('✅ Location synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'location', location);
    }
    throw error;
  }
};

// 🧩 SUPPLY
export const sendSupplyToServer = async (supply: any) => {
  try {
    
    const response = await axiosInstance.post('/supply', supply);
    console.log('✅ Supply synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'supply', supply);
    }
    throw error;
  }
};

// 🧩 TASK
export const sendTaskToServer = async (task: any) => {
  try {
    
    const response = await axiosInstance.post('/task', task);
    console.log('✅ Task synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'task', task);
    }
    throw error;
  }
};

// 🧩 TASK ASSIGNMENT
export const sendTaskAssignmentToServer = async (assignment: any) => {
  try {
    
    const response = await axiosInstance.post('/task-assignment', assignment);
    console.log('✅ Task Assignment synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'task_assignment', assignment);
    }
    throw error;
  }
};

// 🧩 ALERT
export const sendAlertToServer = async (alert: any) => {
  try {
    
    const response = await axiosInstance.post('/alert', alert);
    console.log('✅ Alert synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'alert', alert);
    }
    throw error;
  }
};
// 🧩 NOTIFICATION
export const sendNotificationToServer = async (notification: any) => {
  try {
    
    const response = await axiosInstance.post('/notification', notification);
    console.log('✅ Notification synced:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      handleConflictError(error, 'notification', notification);
    }
    throw error;
  }
};