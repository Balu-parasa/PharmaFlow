import axios from 'axios';

// In production on Vercel, requests default to same-origin '/api' (handled by vercel.json rewrite or direct proxy)
// In local development, defaults to 'http://localhost:5000/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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

// Flag & queue to avoid infinite retry loops when refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercept responses for auth expiration and silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not on login, refresh, or logout endpoints
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
                           originalRequest?.url?.includes('/auth/refresh') ||
                           originalRequest?.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshRes.data.success && refreshRes.data.data.token) {
          const newToken = refreshRes.data.data.token;
          const user = refreshRes.data.data.user;
          localStorage.setItem('pharmaflow_token', newToken);
          if (user) {
            localStorage.setItem('pharmaflow_user', JSON.stringify(user));
          }
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('pharmaflow_token');
        localStorage.removeItem('pharmaflow_user');
        window.dispatchEvent(new Event('capsulix_session_expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
