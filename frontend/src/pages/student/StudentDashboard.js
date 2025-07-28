import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  MessageSquare, 
  ClipboardList, 
  BookOpen,
  QrCode,
  Users,
  Bell,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Navigation from '../../components/layout/Navigation.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import studentService from '../../services/studentService';

const StudentDashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    'studentDashboard',
    studentService.getDashboard
  );

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

  const student = dashboardData?.data?.student || {};
  const stats = dashboardData?.data?.statistics || {};
  const recentActivities = dashboardData?.data?.recentActivities || [];
  const upcomingEvents = dashboardData?.data?.upcomingEvents || [];

  const quickActions = [
    {
      title: 'Book Meals',
      description: 'Book your meals for tomorrow',
      icon: BookOpen,
      link: '/student/meals',
      color: 'bg-blue-500'
    },
    {
      title: 'QR Code',
      description: 'Generate QR for attendance',
      icon: QrCode,
      link: '/student/qr-code',
      color: 'bg-green-500'
    },
    {
      title: 'Apply Leave',
      description: 'Submit leave application',
      icon: Calendar,
      link: '/student/leave',
      color: 'bg-purple-500'
    },
    {
      title: 'Submit Complaint',
      description: 'Report issues or concerns',
      icon: MessageSquare,
      link: '/student/complaints',
      color: 'bg-red-500'
    },
    {
      title: 'Community',
      description: 'Connect with hostel mates',
      icon: Users,
      link: '/student/community',
      color: 'bg-indigo-500'
    },
    {
      title: 'View Profile',
      description: 'Update your information',
      icon: User,
      link: '/student/profile',
      color: 'bg-gray-500'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'APPROVED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'REJECTED': { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig['PENDING'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {student.userId?.name || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Room {student.roomNumber}{student.bedLetter ? ` - Bed ${student.bedLetter}` : ''}
          </p>
        </div>

        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{student.userId?.name}</h2>
              <p className="text-gray-600">{student.course} - Year {student.year}</p>
              <p className="text-sm text-gray-500">Roll Number: {student.rollNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Admission Status</p>
              {getStatusBadge(student.admissionStatus)}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${action.color} rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
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
                  <p className="text-gray-500">No recent activities</p>
                  <p className="text-sm text-gray-400 mt-1">Start using the system to see your activities here</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Statistics */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Meals Booked This Month</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.mealsBookedThisMonth || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {stats.attendanceRate || '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Leave Applications</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.totalLeaveApplications || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Complaints</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {stats.pendingComplaints || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-blue-900">Welcome to HostelMate!</p>
                  <p className="text-xs text-blue-700 mt-1">Complete your profile for better experience.</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm font-medium text-green-900">Meal booking reminder</p>
                  <p className="text-xs text-green-700 mt-1">Don't forget to book tomorrow's meals.</p>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{event.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
