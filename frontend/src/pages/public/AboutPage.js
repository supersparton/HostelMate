import React from 'react';
import { useQuery } from 'react-query';
import { Target, Users, Award } from 'lucide-react';
import publicService from '../../services/publicService';
import Navigation from '../../components/layout/Navigation.jsx';

const AboutPage = () => {
  const { data: visionData } = useQuery('visionInfo', publicService.getVisionInfo);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Vision Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Vision & Mission</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {visionData?.data?.description || 
               'Building the future of hostel management through innovative technology and student-centric solutions.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                Leveraging cutting-edge technology to revolutionize hostel management and enhance student experience.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">
                Fostering a strong sense of community among students while maintaining efficient administrative processes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                Committed to providing exceptional service and continuously improving our platform based on user feedback.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section>
          <div className="bg-gray-50 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">What Makes Us Different</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Student-First Approach</h3>
                <p className="text-gray-600 mb-4">
                  Every feature is designed with student convenience in mind, from easy meal booking 
                  to seamless leave applications.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Modern Technology</h3>
                <p className="text-gray-600 mb-4">
                  QR-based attendance, real-time notifications, and mobile-responsive design 
                  for the digital generation.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Transparent Processes</h3>
                <p className="text-gray-600 mb-4">
                  Clear policies, transparent fee structures, and open communication channels 
                  between students and administration.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">24/7 Support</h3>
                <p className="text-gray-600 mb-4">
                  Round-the-clock technical support and responsive administrative assistance 
                  for all your hostel-related needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hostel Donors Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Generous Donors</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Thanks to the generous support of our donors, we can provide world-class hostel facilities and services to our students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Donor 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Users className="h-16 w-16 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">Adani Foundation</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Infrastructure Development</h4>
                <p className="text-gray-600 text-sm">
                  Major contributor to hostel infrastructure including modern dormitories, recreational facilities, and smart technology integration.
                </p>
                <div className="mt-4 text-blue-600 font-medium">
                  Contribution: ₹50 Lakhs
                </div>
              </div>
            </div>

            {/* Donor 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Award className="h-16 w-16 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">Alumni Association</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Scholarship Fund</h4>
                <p className="text-gray-600 text-sm">
                  Established scholarship programs for economically disadvantaged students and funded the digital transformation of hostel management.
                </p>
                <div className="mt-4 text-green-600 font-medium">
                  Contribution: ₹25 Lakhs
                </div>
              </div>
            </div>

            {/* Donor 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Target className="h-16 w-16 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">Tech Corp Ltd.</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Technology Partnership</h4>
                <p className="text-gray-600 text-sm">
                  Provided cutting-edge technology solutions including QR systems, IoT sensors, and the HostelMate management platform.
                </p>
                <div className="mt-4 text-purple-600 font-medium">
                  Contribution: ₹15 Lakhs
                </div>
              </div>
            </div>

            {/* Donor 4 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Users className="h-16 w-16 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">Local Community</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Community Support</h4>
                <p className="text-gray-600 text-sm">
                  Local businesses and community members contributed to recreational facilities, sports equipment, and cultural programs.
                </p>
                <div className="mt-4 text-orange-600 font-medium">
                  Contribution: ₹10 Lakhs
                </div>
              </div>
            </div>

            {/* Donor 5 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Award className="h-16 w-16 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">Education Ministry</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Government Grant</h4>
                <p className="text-gray-600 text-sm">
                  Special government grant for educational infrastructure development and student welfare programs.
                </p>
                <div className="mt-4 text-red-600 font-medium">
                  Contribution: ₹30 Lakhs
                </div>
              </div>
            </div>

            {/* Donor 6 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Target className="h-16 w-16 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">Parent Committee</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Safety & Security</h4>
                <p className="text-gray-600 text-sm">
                  Parent committee funded advanced security systems, CCTV networks, and 24/7 security personnel for student safety.
                </p>
                <div className="mt-4 text-teal-600 font-medium">
                  Contribution: ₹20 Lakhs
                </div>
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              We are deeply grateful to all our donors whose generosity has made HostelMate possible. 
              Your contributions continue to enhance the student living experience and create a home away from home.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Total Contributions Received: <span className="font-bold text-2xl text-blue-600">₹1.5 Crores</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
