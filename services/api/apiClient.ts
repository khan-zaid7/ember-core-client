// services/api/apiClient.ts
import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api/sync'; 
const API_BASE_URL = 'http://172.20.10.4:5000/api/sync'; 

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
  console.log("Payload going to /registration:", registration);
  return axiosInstance.post('/registration', registration);
};

// 🧩 LOCATION
export const sendLocationToServer = async (location: any) => {
  console.log("Payload going to /location:", location);
  return axiosInstance.post('/location', location);
};

// 🧩 SUPPLY
export const sendSupplyToServer = async (supply: any) => {
  console.log("Payload going to /supply:", supply);
  return axiosInstance.post('/supply', supply);
};

// 🧩 TASK
export const sendTaskToServer = async (task: any) => {
  console.log("Payload going to /task:", task);
  return axiosInstance.post('/task', task);
};

// 🧩 TASK ASSIGNMENT
export const sendTaskAssignmentToServer = async (assignment: any) => {
  console.log("Payload going to /task-assignment:", assignment);
  return axiosInstance.post('/task-assignment', assignment);
};

// 🧩 ALERT
export const sendAlertToServer = async (alert: any) => {
  console.log("Payload going to /alert:", alert);
  return axiosInstance.post('/alert', alert);
};