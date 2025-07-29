import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Public Pages
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import RulesPage from '../pages/public/RulesPage';
import FeesPage from '../pages/public/FeesPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentManagement from '../pages/admin/StudentManagement';
import ApplicationsManager from '../pages/admin/ApplicationsManager';
import SimpleApplicationTest from '../pages/admin/SimpleApplicationTest';
import { 
  RoomManagement, 
  MenuManagementPage, 
  AttendanceReport, 
  LeaveManagementPage, 
  ComplaintManagement, 
  Reports 
} from '../pages/admin';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import QRCodeView from '../pages/student/QRCodeView';
import { 
  StudentProfile, 
  MenuViewPage, 
  MealBooking, 
  AttendanceView, 
  LeaveApplicationPage, 
  ComplaintSubmission, 
  CommunityForum 
} from '../pages/student';

// Shared Components
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Redirect based on role
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/fees" element={<FeesPage />} />
      
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <StudentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ApplicationsManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/test-apps"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <SimpleApplicationTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <RoomManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <MenuManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AttendanceReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leave"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <LeaveManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ComplaintManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/menu"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <MenuViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/meals"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <MealBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <AttendanceView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/leave"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <LeaveApplicationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/complaints"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <ComplaintSubmission />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/community"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <CommunityForum />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/qr-code"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <QRCodeView />
          </ProtectedRoute>
        }
      />

      {/* Error Routes */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">403</h1>
              <p className="text-xl text-gray-600 mt-4">Access Denied</p>
              <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
            </div>
          </div>
        }
      />
      
      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">404</h1>
              <p className="text-xl text-gray-600 mt-4">Page Not Found</p>
              <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
