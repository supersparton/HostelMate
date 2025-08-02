import React from 'react';
import { useQuery } from 'react-query';
import { 
  X, 
  User, 
  GraduationCap, 
  Building, 
  Heart, 
  MapPin, 
  Shield,
  Phone,
  Mail,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import adminService from '../../services/adminService';

const StudentProfileModal = ({ studentId, isOpen, onClose }) => {
  // Query to fetch complete student details
  const { data: studentData, isLoading, error } = useQuery(
    ['studentProfile', studentId],
    () => adminService.getStudentById(studentId),
    {
      enabled: !!studentId && isOpen
    }
  );

  if (!isOpen) return null;

  const student = studentData?.data?.data || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-white">
              {student.profilePicture?.secure_url ? (
                <img 
                  src={student.profilePicture.secure_url} 
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.name || 'Loading...'}</h2>
              <p className="text-gray-600">{student.email || ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner text="Loading student profile..." />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">Error loading student profile</div>
              <p className="text-gray-500">{error.message}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">{student.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-500" />
                      {student.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-500" />
                      {student.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Student ID</label>
                    <p className="text-gray-900">{student.studentId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Blood Group</label>
                    <p className="text-gray-900">{student.bloodGroup || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Course</label>
                    <p className="text-gray-900 flex items-center">
                      <BookOpen className="h-4 w-4 mr-1 text-gray-500" />
                      {student.course || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <p className="text-gray-900">{student.year || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Roll Number</label>
                    <p className="text-gray-900">{student.rollNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">College</label>
                    <p className="text-gray-900">{student.collegeName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <p className="text-gray-900">{student.department || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Hostel Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-600" />
                  Hostel Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Room Number</label>
                    <p className="text-gray-900">{student.roomNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bed Letter</label>
                    <p className="text-gray-900">{student.bedLetter || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Admission Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.admissionStatus === 'APPROVED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.admissionStatus || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Joined Date</label>
                    <p className="text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-orange-600" />
                  Family Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Parent Name</label>
                    <p className="text-gray-900">{student.parentName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Parent Phone</label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-500" />
                      {student.parentPhone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                    <p className="text-gray-900">{student.emergencyContact || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-teal-600" />
                  Address Information
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  {typeof student.address === 'object' && student.address ? (
                    <div className="text-gray-900 space-y-1">
                      {student.address.street && <p>{student.address.street}</p>}
                      {student.address.city && <p>{student.address.city}</p>}
                      {student.address.state && <p>{student.address.state}</p>}
                      {student.address.pincode && <p>PIN: {student.address.pincode}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-900">{student.address || 'N/A'}</p>
                  )}
                </div>
              </div>

              {/* Social & Economic Information */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-amber-600" />
                  Social & Economic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Caste</label>
                    <p className="text-gray-900">{student.caste || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Religion</label>
                    <p className="text-gray-900">{student.religion || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Family Income</label>
                    <p className="text-gray-900">{student.income || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
