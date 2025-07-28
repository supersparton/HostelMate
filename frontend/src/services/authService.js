import axios from 'axios';

// Base URL for API calls
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Login user
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Register student
  register: (userData) => {
    console.log('Sending registration data:', userData); // Debug log
    return api.post('/auth/register', userData).catch(error => {
      console.error('Registration API error:', error.response?.data); // Debug log
      throw error;
    });
  },

  // Get current user
  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  // Refresh token
  refreshToken: (refreshToken) => {
    return api.post('/auth/refresh', { refreshToken });
  },

  // Logout
  logout: () => {
    return api.post('/auth/logout');
  },

  // Change password
  changePassword: (passwordData) => {
    return api.put('/auth/change-password', passwordData);
  },

  // Forgot password
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: (token, password) => {
    return api.post('/auth/reset-password', { token, password });
  },
};

export default authService;
