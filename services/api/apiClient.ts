// services/api/apiClient.ts
import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api/sync'; 
const API_BASE_URL = 'http://192.168.4.145:5000/api/sync'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});


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
    throw error;
  }
};