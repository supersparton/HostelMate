import React from 'react';
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
  ExternalLink
} from 'lucide-react';
import Navigation from '../../components/layout/Navigation.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useQuery(
    'adminDashboard',
    adminService.getDashboard
  );

  // Add query for pending applications
  const { data: pendingApps, isLoading: appsLoading } = useQuery(
    'pendingApplications',
    () => adminService.getPendingAdmissions(),
    { refetchInterval: 5000 }
  );

  console.log('Dashboard data:', dashboardData);
  console.log('Pending applications raw response:', pendingApps);

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

  const stats = dashboardData?.data?.statistics || {};
  const recentActivities = dashboardData?.data?.recentActivities || [];

  // Debug information
  console.log('Dashboard data received:', dashboardData);
  console.log('Statistics:', stats);

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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening in your hostel.</p>
        </div>

        {/* Quick Actions Section */}
        {(stats.pendingAdmissions > 0 || stats.pendingLeaveApplications > 0 || stats.activeComplaints > 0) && (
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
                      onClick={() => navigate('/admin/students')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Review {stats.pendingAdmissions} Applications</span>
                    </button>
                  )}
                  {stats.pendingLeaveApplications > 0 && (
                    <button
                      onClick={() => navigate('/admin/leave')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Review {stats.pendingLeaveApplications} Leaves</span>
                    </button>
                  )}
                  {stats.activeComplaints > 0 && (
                    <button
                      onClick={() => navigate('/admin/complaints')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Handle {stats.activeComplaints} Complaints</span>
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
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <ClipboardList className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
                  onClick={() => navigate('/admin/students')}
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
                    <p className="text-xs text-gray-600">{stats.pendingLeaveApplications || 0} requests</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {stats.pendingLeaveApplications || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Complaints</p>
                    <p className="text-xs text-gray-600">{stats.activeComplaints || 0} active</p>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {stats.activeComplaints || 0}
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
                    {stats.occupancyRate || '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Rooms</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.totalRooms || 200}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Beds</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.availableBeds || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="text-sm font-medium text-green-600">
                    ₹{stats.monthlyRevenue || '0'}
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

        {/* PENDING APPLICATIONS SECTION */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Pending Applications ({pendingApps?.data?.pagination?.total || 0})
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    adminService.createSimpleTestApplication()
                      .then(() => window.location.reload())
                      .catch(console.error);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Create Test App
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {appsLoading ? (
              <div className="text-center py-4">Loading applications...</div>
            ) : pendingApps?.data?.applications?.length > 0 ? (
              <div className="space-y-4">
                {pendingApps.data.applications.map((app, index) => (
                  <div key={app._id || index} className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <p className="text-sm text-gray-600">{app.email}</p>
                        <p className="text-sm text-gray-600">{app.course} - Year {app.year}</p>
                        <p className="text-xs text-gray-500">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate('/admin/students')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    View All Applications
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No pending applications found</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-blue-500 hover:text-blue-700"
                >
                  Refresh
                </button>
              </div>
            )}

            {/* Raw Response Debug */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500">View Raw Response (Debug)</summary>
              <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(pendingApps, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
