// services/api/apiClient.ts
import axios from 'axios';
import { insertNotification } from '../models/NotificationModel';
import { generateUUID } from '../../utils/generateUUID';
import { showNotification, checkForNewNotifications } from '../../utils/notificationManager';

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
    
    // Create a notification for the conflict
    const notification = {
      notification_id: generateUUID(),
      user_id: entityData.user_id || '',
      title: 'Sync Conflict',
      message: errorMessage,
      type: 'warning',
      entity_type: entityType,
      entity_id: entityData.id || entityData[`${entityType}_id`] || '',
      received_at: new Date().toISOString(),
      read: 0,
      synced: 1, // This notification doesn't need to be synced as it's about a sync issue
      archived: 0
    };
    
    // Insert the notification into the database
    insertNotification(notification);
    
    // Show the notification in the UI
    showNotification(errorMessage, 'warning', 'Sync Conflict');
    
    // Trigger a check for any new notifications in the database
    checkForNewNotifications();
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
  throw error;
};

export const sendUserToServer = async (user: any) => {
  try {
    console.log("Payload going to /user:", user);

    const response = await axios.post(`${API_BASE_URL}/user`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5s timeout
    });

    console.log('✅ User synced:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to sync user:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      handleConflictError(error, 'user', user);
    }
    throw error;
  }
};

// 🧩 REGISTRATION
export const sendRegistrationToServer = async (registration: any) => {
  try {
    console.log("Payload going to /registration:", registration);
    const response = await axiosInstance.post('/registration', registration);
    console.log('✅ Registration synced:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to sync registration:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      handleConflictError(error, 'registration', registration);
    }
    throw error;
  }
};

// 🧩 LOCATION
export const sendLocationToServer = async (location: any) => {
  try {
    console.log("Payload going to /location:", location);
    const response = await axiosInstance.post('/location', location);
    console.log('✅ Location synced:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to sync location:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      handleConflictError(error, 'location', location);
    }
    throw error;
  }
};

// 🧩 SUPPLY
export const sendSupplyToServer = async (supply: any) => {
  try {
    console.log("Payload going to /supply:", supply);
    const response = await axiosInstance.post('/supply', supply);
    console.log('✅ Supply synced:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to sync supply:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      handleConflictError(error, 'supply', supply);
    }
    throw error;
  }
};

// 🧩 TASK
export const sendTaskToServer = async (task: any) => {
  try {
    console.log("Payload going to /task:", task);
    const response = await axiosInstance.post('/task', task);
    console.log('✅ Task synced:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to sync task:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      handleConflictError(error, 'task', task);
    }
    throw error;
  }
};

// 🧩 TASK ASSIGNMENT
export const sendTaskAssignmentToServer = async (assignment: any) => {
  try {
    console.log("Payload going to /task-assignment:", assignment);
    const response = await axiosInstance.post('/task-assignment', assignment);
    console.log('✅ Task Assignment synced:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to sync task assignment:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      handleConflictError(error, 'task_assignment', assignment);
    }
    throw error;
  }
};

// 🧩 ALERT
export const sendAlertToServer = async (alert: any) => {
  try {
    console.log("Payload going to /alert:", alert);
    const response = await axiosInstance.post('/alert', alert);
    console.log('✅ Alert synced:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to sync alert:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      handleConflictError(error, 'alert', alert);
    }
    throw error;
  }
};
// 🧩 NOTIFICATION
export const sendNotificationToServer = async (notification: any) => {
  try {
    console.log("Payload going to /notification:", notification);
    const response = await axiosInstance.post('/notification', notification);
    console.log('✅ Notification synced:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to sync notification:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      handleConflictError(error, 'notification', notification);
    }
    throw error;
  }
};