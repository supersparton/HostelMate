import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Shield, 
  Users, 
  Building, 
  Utensils, 
  Calendar, 
  QrCode,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import publicService from '../../services/publicService';

const HomePage = () => {
  const { data: homeData } = useQuery('homeInfo', publicService.getHomeInfo);
  const { data: contactData } = useQuery('contactInfo', publicService.getContactInfo);

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Attendance',
      description: 'Modern QR-based attendance system for mess timings'
    },
    {
      icon: Utensils,
      title: 'Meal Booking',
      description: 'Book your meals in advance and avoid wastage'
    },
    {
      icon: Calendar,
      title: 'Leave Management',
      description: 'Apply for leave and track approval status easily'
    },
    {
      icon: Building,
      title: 'Room Management',
      description: 'Efficient room allocation and management system'
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Connect with your hostel mates and share experiences'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is safe with our secure platform'
    }
  ];

  const stats = [
    { number: '200+', label: 'Rooms Available' },
    { number: '800+', label: 'Bed Capacity' },
    { number: '24/7', label: 'Support Available' },
    { number: '100%', label: 'Digital Management' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link to="/" className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">HostelMate</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-8">
              <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link to="/rules" className="text-gray-600 hover:text-gray-900 transition-colors">
                Rules
              </Link>
              <Link to="/fees" className="text-gray-600 hover:text-gray-900 transition-colors">
                Fees
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-yellow-300">HostelMate</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {homeData?.data?.description || 
               'Your comprehensive hostel management solution. Modern, efficient, and student-friendly.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Apply for Admission
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Student Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose HostelMate?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience modern hostel management with our comprehensive digital platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
                  <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Vision
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                To create a modern, efficient, and student-centric hostel management system that 
                enhances the residential experience for students while providing administrators 
                with powerful tools for effective management.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-yellow-500 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Student-Centric Design</h4>
                    <p className="text-gray-600">Built with students' needs and convenience in mind</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-yellow-500 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Digital Transformation</h4>
                    <p className="text-gray-600">Modernizing traditional hostel management processes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-yellow-500 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Transparency & Efficiency</h4>
                    <p className="text-gray-600">Clear processes and efficient management for all</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Join?</h3>
                <p className="text-blue-100 mb-6">
                  Experience the future of hostel living with HostelMate. 
                  Apply now and be part of our modern residential community.
                </p>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
                >
                  Start Your Application
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600">
              Have questions? We're here to help you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">
                {contactData?.data?.phone || '+91 (123) 456-7890'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">
                {contactData?.data?.email || 'info@hostelmate.com'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">
                {contactData?.data?.address || 'University Campus, City, State'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-2xl font-bold">HostelMate</span>
              </div>
              <p className="text-gray-400 mb-4">
                Modern hostel management made simple. Empowering students and administrators 
                with digital solutions for better residential experiences.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/rules" className="text-gray-400 hover:text-white transition-colors">Rules & Regulations</Link></li>
                <li><Link to="/fees" className="text-gray-400 hover:text-white transition-colors">Fee Structure</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Room Allocation</span></li>
                <li><span className="text-gray-400">Meal Management</span></li>
                <li><span className="text-gray-400">Attendance Tracking</span></li>
                <li><span className="text-gray-400">Leave Management</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HostelMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
