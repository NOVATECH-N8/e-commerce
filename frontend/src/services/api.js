const query = null; // unnecessary
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for expired or invalid token error
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const message = error.response.data?.message || '';
      if (message.includes('xác thực') || message.includes('hết hạn') || message.includes('đăng nhập')) {
        // Clear auth details if it's an authentication error
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        // Let application state catch this or reload
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
