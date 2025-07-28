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

const studentService = {
  // Dashboard data
  getDashboard: () => {
    const api = createAuthApi();
    return api.get('/student/dashboard');
  },

  // Profile management
  getProfile: () => {
    const api = createAuthApi();
    return api.get('/student/profile');
  },

  updateProfile: (profileData) => {
    const api = createAuthApi();
    return api.put('/student/profile', profileData);
  },

  // QR Code
  getQRCode: () => {
    const api = createAuthApi();
    return api.get('/student/qr-code');
  },

  // Meal booking
  bookMeal: (mealData) => {
    const api = createAuthApi();
    return api.post('/student/meal-booking', mealData);
  },

  cancelMealBooking: (bookingId) => {
    const api = createAuthApi();
    return api.delete(`/student/meal-booking/${bookingId}`);
  },

  getMealBookings: (params = {}) => {
    const api = createAuthApi();
    return api.get('/student/meal-bookings', { params });
  },

  // Attendance
  getAttendance: (params = {}) => {
    const api = createAuthApi();
    return api.get('/student/attendance', { params });
  },

  // Leave applications
  getLeaveApplications: () => {
    const api = createAuthApi();
    return api.get('/student/leave-applications');
  },

  applyLeave: (leaveData) => {
    const api = createAuthApi();
    return api.post('/student/leave-applications', leaveData);
  },

  cancelLeave: (leaveId) => {
    const api = createAuthApi();
    return api.delete(`/student/leave-applications/${leaveId}`);
  },

  // Complaints
  getComplaints: () => {
    const api = createAuthApi();
    return api.get('/student/complaints');
  },

  submitComplaint: (complaintData) => {
    const api = createAuthApi();
    return api.post('/student/complaints', complaintData);
  },

  // Community posts
  getCommunityPosts: () => {
    const api = createAuthApi();
    return api.get('/student/community-posts');
  },

  createPost: (postData) => {
    const api = createAuthApi();
    return api.post('/student/community-posts', postData);
  },

  likePost: (postId) => {
    const api = createAuthApi();
    return api.post(`/student/community-posts/${postId}/like`);
  },

  addComment: (postId, comment) => {
    const api = createAuthApi();
    return api.post(`/student/community-posts/${postId}/comment`, { comment });
  },

  // Room information
  getRoomInfo: () => {
    const api = createAuthApi();
    return api.get('/student/room');
  },

  getRoommates: () => {
    const api = createAuthApi();
    return api.get('/student/roommates');
  },

  // Menu
  getMenu: (date) => {
    const api = createAuthApi();
    return api.get('/student/menu', { params: { date } });
  },

  // Fees and payments
  getFeeStructure: () => {
    const api = createAuthApi();
    return api.get('/student/fees');
  },

  getPaymentHistory: () => {
    const api = createAuthApi();
    return api.get('/student/payments');
  },

  // Notifications
  getNotifications: () => {
    const api = createAuthApi();
    return api.get('/student/notifications');
  },

  markNotificationRead: (notificationId) => {
    const api = createAuthApi();
    return api.put(`/student/notifications/${notificationId}/read`);
  },
};

export default studentService;
