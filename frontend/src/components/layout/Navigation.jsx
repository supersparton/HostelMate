import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  User, 
  Users, 
  Building, 
  Calendar, 
  ClipboardList, 
  MessageSquare, 
  QrCode,
  LogOut,
  Menu,
  X,
  Shield,
  BookOpen,
  BarChart3
} from 'lucide-react';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin, isStudent } = useAuth();
  const location = useLocation();

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/applications', label: 'Applications', icon: ClipboardList },
    { path: '/admin/menu', label: 'Menu', icon: BookOpen },
    { path: '/admin/attendance', label: 'Attendance', icon: ClipboardList },
    { path: '/admin/leave', label: 'Leave', icon: Calendar },
    { path: '/admin/complaints', label: 'Complaints', icon: MessageSquare },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const studentNavItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: Home },
    { path: '/student/profile', label: 'Profile', icon: User },
    { path: '/student/meals', label: 'Meals', icon: BookOpen },
    { path: '/student/attendance', label: 'Attendance', icon: ClipboardList },
    { path: '/student/leave', label: 'Leave', icon: Calendar },
    { path: '/student/complaints', label: 'Complaints', icon: MessageSquare },
    { path: '/student/community', label: 'Community', icon: Users },
    { path: '/student/qr-code', label: 'QR Code', icon: QrCode },
  ];

  const navItems = isAdmin() ? adminNavItems : isStudent() ? studentNavItems : [];

  // Public navigation items for non-authenticated users
  const publicNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About', icon: Shield },
    { path: '/rules', label: 'Rules', icon: BookOpen },
    { path: '/fees', label: 'Fees', icon: BarChart3 },
    { path: '/contact', label: 'Contact', icon: MessageSquare },
  ];

  // Determine which nav items to show
  const currentNavItems = user ? navItems : publicNavItems;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HostelMate</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center text-sm text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  <span>{user?.name}</span>
                  <span className="ml-1 text-xs text-gray-500">
                    ({isAdmin() ? 'Admin' : 'Student'})
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition duration-150 ease-in-out"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Mobile user info and logout/auth */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-2 text-sm text-gray-700">
                    <User className="h-4 w-4 mr-2" />
                    <span>{user?.name}</span>
                    <span className="ml-1 text-xs text-gray-500">
                      ({isAdmin() ? 'Admin' : 'Student'})
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center w-full px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 mt-2"
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
