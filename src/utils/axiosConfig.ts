import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const getStoredToken = (): string | null => {
  return null;
};

const api = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: 'http://localhost:5002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;
