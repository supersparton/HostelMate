// Student pages
import React from 'react';
import Navigation from '../../components/layout/Navigation.jsx';
import LeaveApplication from './LeaveApplication';
import MenuView from './MenuView';
import ComplaintManagement from './ComplaintManagement';
import CommunityForumComponent from '../../components/community/CommunityForum';

export const StudentProfile = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      <p className="text-gray-600 mt-2">View and update your profile information</p>
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <p className="text-gray-500">Profile management features coming soon...</p>
      </div>
    </div>
  </div>
);

export const MenuViewPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <MenuView />
    </div>
  </div>
);

export const MealBooking = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Meal Booking</h1>
      <p className="text-gray-600 mt-2">Book your meals in advance</p>
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <p className="text-gray-500">Meal booking features coming soon...</p>
      </div>
    </div>
  </div>
);

export const AttendanceView = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
      <p className="text-gray-600 mt-2">View your attendance records</p>
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <p className="text-gray-500">Attendance viewing features coming soon...</p>
      </div>
    </div>
  </div>
);

export const LeaveApplicationPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <LeaveApplication />
    </div>
  </div>
);

export const ComplaintSubmission = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <div className="container mx-auto px-4 py-8">
      <ComplaintManagement />
    </div>
  </div>
);

export const CommunityForum = () => (
  <CommunityForumComponent />
);
