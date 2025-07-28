import axios from 'axios';

// Base URL for API calls
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth
const createAuthApi = () => {
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

const studentApplicationService = {
  // Get pending applications
  getPendingApplications: () => {
    const api = createAuthApi();
    return api.get('/admin/admissions/pending');
  },

  // Get all applications
  getAllApplications: () => {
    const api = createAuthApi();
    return api.get('/admin/admissions/all');
  },

  // Create test application
  createTestApplication: () => {
    const api = createAuthApi();
    return api.post('/admin/admissions/create-simple-test');
  },

  // Force all to pending
  forceAllPending: () => {
    const api = createAuthApi();
    return api.post('/admin/admissions/force-all-pending');
  },

  // Get dashboard stats
  getDashboardStats: () => {
    const api = createAuthApi();
    return api.get('/admin/dashboard');
  },

  // Create sample rooms
  createSampleRooms: () => {
    const api = createAuthApi();
    return api.post('/admin/admissions/create-sample-rooms');
  },

  // Get available beds
  getAvailableBeds: () => {
    const api = createAuthApi();
    return api.get('/admin/admissions/available-beds');
  },

  // Approve application
  approveApplication: (id, roomNumber, bedLetter) => {
    const api = createAuthApi();
    return api.post(`/admin/admissions/${id}/accept`, { roomNumber, bedLetter });
  },

  // Reject application
  rejectApplication: (id, reason) => {
    const api = createAuthApi();
    return api.post(`/admin/admissions/${id}/reject`, { reason });
  }
};

export default studentApplicationService;
