import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pharmaflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear session on 401 if it's NOT the login request itself
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('pharmaflow_token');
      localStorage.removeItem('pharmaflow_user');
    }
    return Promise.reject(error);
  }
);

export default api;
