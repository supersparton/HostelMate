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
  getCurrentMenu: () => {
    const api = createAuthApi();
    return api.get('/admin/menu/current');
  },

  createOrUpdateMenu: (menuData) => {
    const api = createAuthApi();
    return api.post('/admin/menu', menuData);
  },

  debugMenus: () => {
    const api = createAuthApi();
    return api.get('/admin/menu/debug');
  },

  cleanupMenus: () => {
    const api = createAuthApi();
    return api.delete('/admin/menu/cleanup');
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
  // Leave management
  getLeaveApplications: (filters = {}) => {
    const api = createAuthApi();
    const params = {
      // Remove pagination completely
      // page: filters.page || 1,
      // limit: filters.limit || 20,
      status: filters.status !== 'ALL' ? filters.status : undefined,
      leaveType: filters.leaveType !== 'ALL' ? filters.leaveType : undefined,
      search: filters.search || undefined,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc'
    };
    
    // Remove undefined values
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    
    return api.get('/admin/leave-applications', { params });
  },

  getLeaveApplication: (leaveId) => {
    const api = createAuthApi();
    return api.get(`/admin/leave-applications/${leaveId}`);
  },

  getLeaveStatistics: () => {
    const api = createAuthApi();
    return api.get('/admin/leave-statistics');
  },

  approveLeaveApplication: (leaveId, adminComments = '') => {
    const api = createAuthApi();
    return api.patch(`/admin/leave-applications/${leaveId}/approve`, { adminComments });
  },

  rejectLeaveApplication: (leaveId, adminComments = '', rejectionReason = '') => {
    const api = createAuthApi();
    return api.patch(`/admin/leave-applications/${leaveId}/reject`, { 
      adminComments, 
      rejectionReason 
    });
  },

  verifyLeaveQR: (token) => {
    const api = createAuthApi();
    return api.post('/admin/leave-qr/verify', { token });
  },

  // Legacy leave methods (kept for backward compatibility)
  getLeaveApplications_old: (status = 'all') => {
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
    const params = {};
    if (status !== 'all') {
      params.status = status;
    }
    return api.get('/admin/complaints', { params });
  },

  updateComplaintStatus: (complaintId, status, response) => {
    const api = createAuthApi();
    return api.patch(`/admin/complaints/${complaintId}`, { status, adminResponse: response });
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

export { adminService };
export default adminService;
