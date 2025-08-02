import React from 'react';
import { QrCode, Clock, Star, Zap, Shield, Smartphone } from 'lucide-react';
import Navigation from '../../components/layout/Navigation.jsx';

const QRCodeView = () => {
  const features = [
    {
      icon: QrCode,
      title: 'Dynamic QR Generation',
      description: 'Secure, time-based QR codes for attendance marking'
    },
    {
      icon: Clock,
      title: 'Real-time Sync',
      description: 'Instant attendance recording and verification'
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Anti-fraud measures with encrypted QR data'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect scanning experience on all devices'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Quick scan and instant attendance confirmation'
    },
    {
      icon: Star,
      title: 'Smart Analytics',
      description: 'Detailed attendance insights and reporting'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            QR Code Attendance
          </h1>
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold text-lg mb-4">
            <Clock className="w-5 h-5 mr-2" />
            Coming Soon
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're building an advanced QR code system for seamless attendance tracking. 
            Get ready for a revolutionary hostel management experience!
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What's Coming
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-3 w-fit mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
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

        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Development Progress
            </h3>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: '75%' }}
                ></div>
              </div>
              <p className="text-gray-500 mt-4">
                Almost there! We're in the final stages of testing and optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">
              Expected Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Phase 1</h4>
                <p className="text-blue-100">Core QR generation system</p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Phase 2</h4>
                <p className="text-blue-100">Security & validation features</p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">Phase 3</h4>
                <p className="text-blue-100">Analytics & reporting dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stay Updated */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Want to be notified when QR attendance goes live?
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold">
            Notify Me When Ready
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeView;
