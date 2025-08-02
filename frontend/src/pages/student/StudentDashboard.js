import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  MessageSquare, 
  ClipboardList, 
  QrCode,
  Users,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Mail,
  Phone,
  MapPin,
  Award,
  Activity,
  Zap,
  Star,
  Settings,
  HelpCircle,
  BookOpen,
  Building
} from 'lucide-react';
import Navigation from '../../components/layout/Navigation.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import studentService from '../../services/studentService';

const StudentDashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    'studentDashboard',
    studentService.getDashboard
  );

  // Also fetch profile data for more complete student information
  const { data: profileData } = useQuery(
    ['student', 'profile'],
    () => studentService.getProfile(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch leave applications for current student
  const { data: leaveApplicationsData, error: leaveError, isLoading: leaveLoading } = useQuery(
    ['student', 'leave-applications'],
    () => studentService.getLeaveApplications(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error) => {
        console.error('Error fetching leave applications:', error);
      }
    }
  );

  // Fetch complaints for current student
  const { data: complaintsData, error: complaintsError, isLoading: complaintsLoading } = useQuery(
    ['student', 'complaints'],
    () => studentService.getComplaints(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error) => {
        console.error('Error fetching complaints:', error);
      }
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-white bg-opacity-20 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-white bg-opacity-20 rounded w-1/2"></div>
            </div>
          </div>
          <LoadingSpinner text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-red-900">Error loading dashboard</h3>
            </div>
            <p className="text-red-600 mb-4">{error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const student = dashboardData?.data?.student || {};
  const stats = dashboardData?.data?.statistics || {};
  const recentActivities = dashboardData?.data?.recentActivities || [];
  const upcomingEvents = dashboardData?.data?.upcomingEvents || [];

  // Calculate real counts from API data with proper debugging
  console.log('Leave Applications Data:', leaveApplicationsData);
  console.log('Complaints Data:', complaintsData);
  console.log('Leave Error:', leaveError);
  console.log('Complaints Error:', complaintsError);
  console.log('Leave Loading:', leaveLoading);
  console.log('Complaints Loading:', complaintsLoading);
  
  // Handle different response structures
  let leaveApplications = [];
  if (leaveApplicationsData?.data?.data?.leaveApplications) {
    leaveApplications = leaveApplicationsData.data.data.leaveApplications;
  } else if (leaveApplicationsData?.data?.leaveApplications) {
    leaveApplications = leaveApplicationsData.data.leaveApplications;
  } else if (leaveApplicationsData?.leaveApplications) {
    leaveApplications = leaveApplicationsData.leaveApplications;
  } else if (leaveApplicationsData?.data?.data && Array.isArray(leaveApplicationsData.data.data)) {
    leaveApplications = leaveApplicationsData.data.data;
  } else if (leaveApplicationsData?.data && Array.isArray(leaveApplicationsData.data)) {
    leaveApplications = leaveApplicationsData.data;
  }

  let complaints = [];
  if (complaintsData?.data?.data?.complaints) {
    complaints = complaintsData.data.data.complaints;
  } else if (complaintsData?.data?.complaints) {
    complaints = complaintsData.data.complaints;
  } else if (complaintsData?.complaints) {
    complaints = complaintsData.complaints;
  } else if (complaintsData?.data?.data && Array.isArray(complaintsData.data.data)) {
    complaints = complaintsData.data.data;
  } else if (complaintsData?.data && Array.isArray(complaintsData.data)) {
    complaints = complaintsData.data;
  }

  console.log('Processed Leave Applications:', leaveApplications);
  console.log('Processed Complaints:', complaints);

  // Enhanced stats with real data from student's records
  const enhancedStats = {
    ...stats,
    // Attendance not implemented yet
    attendanceRate: '0%',
    attendancePercentage: '0%',
    // Real data for complaints and leave applications
    totalComplaints: Array.isArray(complaints) ? complaints.length : 0,
    totalLeaveApplications: Array.isArray(leaveApplications) ? leaveApplications.length : 0,
    pendingComplaints: Array.isArray(complaints) ? complaints.filter(c => c.status === 'PENDING').length : 0,
    pendingLeaves: Array.isArray(leaveApplications) ? leaveApplications.filter(l => l.status === 'PENDING').length : 0
  };

  console.log('Enhanced Stats:', enhancedStats);

  // Get profile data with fallback paths
  let profile = null;
  if (profileData?.data?.data?.profile) {
    profile = profileData.data.data.profile;
  } else if (profileData?.data?.profile) {
    profile = profileData.data.profile;
  } else if (profileData?.profile) {
    profile = profileData.profile;
  }

  // Merge student data from dashboard and profile for complete information
  const studentInfo = {
    ...student,
    ...profile,
    name: profile?.userId?.name || student?.userId?.name || student?.name || 'Student',
    email: profile?.userId?.email || student?.userId?.email || student?.email,
    phone: profile?.userId?.phone || student?.userId?.phone || student?.phone,
    roomNumber: profile?.roomNumber || student?.roomNumber,
    bedLetter: profile?.bedLetter || student?.bedLetter,
    course: profile?.course || student?.course,
    year: profile?.year || student?.year,
    rollNumber: profile?.rollNumber || student?.rollNumber || student?.studentId,
    admissionStatus: profile?.admissionStatus || student?.admissionStatus || 'PENDING'
  };

  const quickActions = [
    {
      title: 'My Profile',
      description: 'View and update your information',
      icon: User,
      link: '/student/profile',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      featured: true
    },
    {
      title: 'QR Attendance',
      description: 'Access attendance QR code',
      icon: QrCode,
      link: '/student/qr-code',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      badge: 'Coming Soon'
    },
    {
      title: 'Apply Leave',
      description: 'Submit leave application',
      icon: Calendar,
      link: '/student/leave',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      title: 'Complaints',
      description: 'Report issues or concerns',
      icon: MessageSquare,
      link: '/student/complaints',
      color: 'bg-gradient-to-r from-red-500 to-red-600'
    },
    {
      title: 'Community',
      description: 'Connect with hostel mates',
      icon: Users,
      link: '/student/community',
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
    },
    {
      title: 'Menu',
      description: 'View daily meal menu',
      icon: BookOpen,
      link: '/student/menu',
      color: 'bg-gradient-to-r from-orange-500 to-orange-600'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'APPROVED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'REJECTED': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'ACTIVE': { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig['PENDING'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status || 'PENDING'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {studentInfo.name}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  {studentInfo.roomNumber ? (
                    <>Room {studentInfo.roomNumber}{studentInfo.bedLetter ? ` - Bed ${studentInfo.bedLetter}` : ''}</>
                  ) : (
                    'Room assignment pending'
                  )}
                  {studentInfo.course && studentInfo.year && (
                    <> • {studentInfo.course} - Year {studentInfo.year}</>
                  )}
                </p>
                <div className="mt-4 flex items-center gap-4 flex-wrap">
                  {studentInfo.rollNumber && (
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      <User className="w-4 h-4 inline mr-1" />
                      ID: {studentInfo.rollNumber}
                    </div>
                  )}
                  {getStatusBadge(studentInfo.admissionStatus)}
                  {studentInfo.email && (
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-white bg-opacity-20 p-4 rounded-xl text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Active Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-500">
                  {enhancedStats.attendanceRate}
                </p>
                <p className="text-xs text-gray-400 mt-1">Not implemented</p>
              </div>
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leave Apps</p>
                <p className="text-2xl font-bold text-blue-600">
                  {enhancedStats.totalLeaveApplications}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Complaints</p>
                <p className="text-2xl font-bold text-orange-600">
                  {enhancedStats.totalComplaints}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Community</p>
                <p className="text-2xl font-bold text-purple-600">Active</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group relative overflow-hidden ${
                    action.featured ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                >
                  {action.badge && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {action.badge}
                    </div>
                  )}
                  {action.featured && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white p-1 rounded-full">
                      <Star className="w-3 h-3" />
                    </div>
                  )}
                  <div className="flex items-start space-x-4">
                    <div className={`${action.color} rounded-xl p-3 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Recent Activities
                </h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <ClipboardList className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activities</h3>
                  <p className="text-gray-500 mb-4">Start using the system to see your activities here</p>
                  <Link 
                    to="/student/profile" 
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Personal Info
              </h3>
              <div className="space-y-3">
                {studentInfo.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 truncate">{studentInfo.email}</span>
                  </div>
                )}
                {studentInfo.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{studentInfo.phone}</span>
                  </div>
                )}
                {studentInfo.roomNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Room {studentInfo.roomNumber}{studentInfo.bedLetter ? `-${studentInfo.bedLetter}` : ''}
                    </span>
                  </div>
                )}
                {!studentInfo.email && !studentInfo.phone && !studentInfo.roomNumber && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No contact information available</p>
                  </div>
                )}
                <Link 
                  to="/student/profile" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-3"
                >
                  {(!studentInfo.email || !studentInfo.phone) ? 'Complete Profile' : 'Edit Profile'} →
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  Notifications
                </h3>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">3</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-blue-900">Welcome to HostelMate! 🎉</p>
                  <p className="text-xs text-blue-700 mt-1">Complete your profile for better experience.</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <p className="text-sm font-medium text-orange-900">QR Feature Coming Soon</p>
                  <p className="text-xs text-orange-700 mt-1">New attendance system in development.</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm font-medium text-green-900">System Update</p>
                  <p className="text-xs text-green-700 mt-1">New features and improvements available.</p>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Need Help?</h3>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Get assistance with hostel services, complaints, or system usage.
              </p>
              <Link 
                to="/student/complaints" 
                className="inline-flex items-center bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
