// Admin pages
import React from 'react';
import Navigation from '../../components/layout/Navigation.jsx';
import LeaveManagement from './LeaveManagement';
import MenuManagement from './MenuManagement';
import AdminComplaintManagement from './AdminComplaintManagement';

export const RoomManagement = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
      <p className="text-gray-600 mt-2">Manage hostel rooms and bed allocations</p>
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <p className="text-gray-500">Room management features coming soon...</p>
      </div>
    </div>
  </div>
);

export const MenuManagementPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <MenuManagement />
    </div>
  </div>
);

export const AttendanceReport = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
      <p className="text-gray-600 mt-2">View and manage student attendance records</p>
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <p className="text-gray-500">Attendance reporting features coming soon...</p>
      </div>
    </div>
  </div>
);

export const LeaveManagementPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <LeaveManagement />
    </div>
  </div>
);

export const ComplaintManagement = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <AdminComplaintManagement />
    </div>
  </div>
);

export const Reports = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
      <p className="text-gray-600 mt-2">Generate various reports and analytics</p>
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <p className="text-gray-500">Reporting features coming soon...</p>
      </div>
    </div>
  </div>
);
