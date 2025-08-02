import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building, 
  Calendar, 
  MessageSquare, 
  ClipboardList, 
  BookOpen,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Eye,
  FileText
} from 'lucide-react';
import Navigation from '../../components/layout/Navigation.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import StudentProfileModal from '../../components/admin/StudentProfileModal.jsx';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const { data: dashboardData, isLoading, error } = useQuery(
    'adminDashboard',
    adminService.getDashboard,
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  // Add query for pending applications (commented out - not currently used)
  // const { data: pendingApps, isLoading: appsLoading } = useQuery(
  //   'pendingApplications',
  //   () => adminService.getPendingAdmissions(),
  //   { refetchInterval: 5000 }
  // );

  // Function to open student profile modal
  const openStudentProfile = (studentId) => {
    setSelectedStudentId(studentId);
    setIsProfileModalOpen(true);
  };

  // Function to close student profile modal
  const closeStudentProfile = () => {
    setSelectedStudentId(null);
    setIsProfileModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">Error loading dashboard: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.data?.data?.statistics || {};
  const recentActivities = dashboardData?.data?.data?.recentActivities || {};
  
  // Extract different types of activities
  const recentComplaints = recentActivities.complaints || [];
  const recentLeaves = recentActivities.leaves || [];
  const recentAdmissions = recentActivities.admissions || [];

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Pending Admissions',
      value: stats.pendingAdmissions || 0,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: '+5',
      changeType: 'increase'
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms || 0,
      icon: Building,
      color: 'bg-green-500',
      change: `${stats.occupancyRate || 0}% occupied`,
      changeType: 'neutral'
    },
    {
      title: 'Today\'s Attendance',
      value: stats.todayAttendance || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
      change: '+18%',
      changeType: 'increase'
    },
    {
      title: 'Open Complaints',
      value: stats.openComplaints || 0,
      icon: MessageSquare,
      color: 'bg-red-500',
      change: '-2',
      changeType: 'decrease'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves || 0,
      icon: Calendar,
      color: 'bg-indigo-500',
      change: '+4',
      changeType: 'increase'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's what's happening in your hostel.</p>
            </div>

          </div>
        </div>

        {/* Quick Actions Section */}
        {(stats.pendingAdmissions > 0 || stats.pendingLeaves > 0 || stats.openComplaints > 0) && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Action Required</h2>
                  <p className="text-gray-600">You have pending items that need your attention</p>
                </div>
                <div className="flex space-x-3">
                  {stats.pendingAdmissions > 0 && (
                    <button
                      onClick={() => navigate('/admin/applications')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Review {stats.pendingAdmissions} Applications</span>
                    </button>
                  )}
                  {stats.pendingLeaves > 0 && (
                    <button
                      onClick={() => navigate('/admin/leave')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Review {stats.pendingLeaves} Leaves</span>
                    </button>
                  )}
                  {stats.openComplaints > 0 && (
                    <button
                      onClick={() => navigate('/admin/complaints')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Handle {stats.openComplaints} Complaints</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className={`h-4 w-4 ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'} mr-1`} />
                      <span className={`text-sm ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className={`${stat.color} rounded-full p-3`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
              
              {/* Complaints Section */}
              {recentComplaints.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-red-500" />
                    Recent Complaints
                  </h3>
                  <div className="space-y-3">
                    {recentComplaints.map((complaint) => (
                      <div key={complaint._id} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-red-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{complaint.description}</p>
                              <div className="flex items-center mt-2 space-x-2">
                                <span className="text-xs text-gray-500">
                                  By {complaint.studentId?.userId?.name || 'Unknown Student'}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(complaint.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {complaint.studentId?._id && (
                              <button
                                onClick={() => openStudentProfile(complaint.studentId._id)}
                                className="ml-3 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Student Profile"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leave Applications Section */}
              {recentLeaves.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Recent Leave Applications
                  </h3>
                  <div className="space-y-3">
                    {recentLeaves.map((leave) => (
                      <div key={leave._id} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {leave.leaveType || 'Leave Application'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{leave.reason}</p>
                              <div className="flex items-center mt-2 space-x-4">
                                <span className="text-xs text-gray-500">
                                  By {leave.studentId?.userId?.name || 'Unknown Student'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {leave.studentId?._id && (
                              <button
                                onClick={() => openStudentProfile(leave.studentId._id)}
                                className="ml-3 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Student Profile"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admissions Section */}
              {recentAdmissions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-yellow-500" />
                    Pending Admissions
                  </h3>
                  <div className="space-y-3">
                    {recentAdmissions.map((admission) => (
                      <div key={admission._id} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-yellow-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            New admission application
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            From {admission.name} ({admission.email})
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(admission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {recentComplaints.length === 0 && recentLeaves.length === 0 && recentAdmissions.length === 0 && (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activities to display</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Pending Approvals */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
              <div className="space-y-3">
                <div 
                  onClick={() => navigate('/admin/applications')}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">New Admissions</p>
                        <p className="text-xs text-gray-600">{stats.pendingAdmissions || 0} applications</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          {stats.pendingAdmissions || 0}
                        </span>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Leave Requests</p>
                    <p className="text-xs text-gray-600">{stats.pendingLeaves || 0} requests</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {stats.pendingLeaves || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Complaints</p>
                    <p className="text-xs text-gray-600">{stats.openComplaints || 0} active</p>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {stats.openComplaints || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Occupancy Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.occupancyRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Rooms</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.totalRooms || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Occupied Rooms</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.occupiedRooms || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Rooms</span>
                  <span className="text-sm font-medium text-green-600">
                    {(stats.totalRooms - stats.occupiedRooms) || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900">Email Service</p>
                <p className="text-xs text-green-600">Active</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900">QR Service</p>
                <p className="text-xs text-green-600">Working</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900">Backup</p>
                <p className="text-xs text-green-600">Updated</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal 
        studentId={selectedStudentId}
        isOpen={isProfileModalOpen}
        onClose={closeStudentProfile}
      />
    </div>
  );
};

export default AdminDashboard;
