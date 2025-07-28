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

const adminService = {
  // Dashboard data
  getDashboard: () => {
    const api = createAuthApi();
    return api.get('/admin/dashboard');
  },

  // Student management
  getPendingAdmissions: () => {
    const api = createAuthApi();
    return api.get('/admin/admissions/pending');
  },

  getAllAdmissions: () => {
    const api = createAuthApi();
    return api.get('/admin/admissions/all');
  },

  createTestApplications: () => {
    const api = createAuthApi();
    return api.post('/admin/admissions/create-test');
  },

  createSimpleTestApplication: () => {
    const api = createAuthApi();
    return api.post('/admin/admissions/create-simple-test');
  },

  createTestData: () => {
    const api = createAuthApi();
    return api.post('/admin/create-test-data');
  },

  fixApplicationStatus: () => {
    const api = createAuthApi();
    return api.post('/admin/admissions/fix-status');
  },

  forceAllPending: () => {
    const api = createAuthApi();
    return api.post('/admin/admissions/force-all-pending');
  },

  getApprovedStudents: () => {
    const api = createAuthApi();
    return api.get('/admin/students');
  },

  acceptAdmission: (applicationId, roomData) => {
    const api = createAuthApi();
    return api.post(`/admin/admissions/${applicationId}/accept`, roomData);
  },

  rejectAdmission: (applicationId, reason) => {
    const api = createAuthApi();
    return api.post(`/admin/admissions/${applicationId}/reject`, { reason });
  },

  updateStudent: (studentId, updateData) => {
    const api = createAuthApi();
    return api.put(`/admin/students/${studentId}`, updateData);
  },

  deactivateStudent: (studentId) => {
    const api = createAuthApi();
    return api.put(`/admin/students/${studentId}/deactivate`);
  },

  // Room management
  getRooms: (params = {}) => {
    const api = createAuthApi();
    return api.get('/admin/rooms', { params });
  },

  getAvailableRooms: () => {
    const api = createAuthApi();
    return api.get('/admin/rooms/available');
  },

  updateRoom: (roomId, updateData) => {
    const api = createAuthApi();
    return api.put(`/admin/rooms/${roomId}`, updateData);
  },

  // Menu management
  getMenus: () => {
    const api = createAuthApi();
    return api.get('/admin/menus');
  },

  createMenu: (menuData) => {
    const api = createAuthApi();
    return api.post('/admin/menus', menuData);
  },

  updateMenu: (menuId, menuData) => {
    const api = createAuthApi();
    return api.put(`/admin/menus/${menuId}`, menuData);
  },

  deleteMenu: (menuId) => {
    const api = createAuthApi();
    return api.delete(`/admin/menus/${menuId}`);
  },

  // Attendance management
  getAttendanceReport: (params = {}) => {
    const api = createAuthApi();
    return api.get('/admin/attendance', { params });
  },

  markAttendance: (studentId, mealType) => {
    const api = createAuthApi();
    return api.post('/admin/attendance/mark', { studentId, mealType });
  },

  // Meal booking management
  getMealBookings: (params = {}) => {
    const api = createAuthApi();
    return api.get('/admin/meal-bookings', { params });
  },

  // Leave applications
  getLeaveApplications: (status = 'all') => {
    const api = createAuthApi();
    return api.get('/admin/leave-applications', { params: { status } });
  },

  approveLeave: (leaveId) => {
    const api = createAuthApi();
    return api.put(`/admin/leave-applications/${leaveId}/approve`);
  },

  rejectLeave: (leaveId, reason) => {
    const api = createAuthApi();
    return api.put(`/admin/leave-applications/${leaveId}/reject`, { reason });
  },

  // Complaints management
  getComplaints: (status = 'all') => {
    const api = createAuthApi();
    return api.get('/admin/complaints', { params: { status } });
  },

  updateComplaintStatus: (complaintId, status, response) => {
    const api = createAuthApi();
    return api.put(`/admin/complaints/${complaintId}`, { status, response });
  },

  // Community posts
  getCommunityPosts: () => {
    const api = createAuthApi();
    return api.get('/admin/community-posts');
  },

  deletePost: (postId) => {
    const api = createAuthApi();
    return api.delete(`/admin/community-posts/${postId}`);
  },

  // Reports
  getStudentReport: (studentId) => {
    const api = createAuthApi();
    return api.get(`/admin/reports/student/${studentId}`);
  },

  getMonthlyReport: (month, year) => {
    const api = createAuthApi();
    return api.get(`/admin/reports/monthly`, { params: { month, year } });
  },

  getFinancialReport: (startDate, endDate) => {
    const api = createAuthApi();
    return api.get('/admin/reports/financial', { params: { startDate, endDate } });
  },
};

export default adminService;
