import React, { useState } from 'react';
import { useQuery } from 'react-query';
import Navigation from '../../components/layout/Navigation.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import adminService from '../../services/adminService';
import { 
  Users, 
  Mail, 
  Building,
  Phone,
  Calendar,
  Eye,
  MapPin,
  User,
  GraduationCap,
  Heart,
  X,
  BookOpen,
  Home,
  Shield,
  CreditCard,
  Clock
} from 'lucide-react';

const StudentManagement = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, date, room
  const [filterBy, setFilterBy] = useState('all'); // all, year1, year2, year3, year4

  // Single query for all students
  const { 
    data: allStudents, 
    isLoading, 
    error 
  } = useQuery('allStudents', adminService.getApprovedStudents);

  const students = allStudents?.data?.data?.students || [];

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.roomNumber?.toString().includes(searchTerm);
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'year1' && student.year === '1st Year') ||
                           (filterBy === 'year2' && student.year === '2nd Year') ||
                           (filterBy === 'year3' && student.year === '3rd Year') ||
                           (filterBy === 'year4' && student.year === '4th Year');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'room':
          return (a.roomNumber || 0) - (b.roomNumber || 0);
        default:
          return 0;
      }
    });

  // Student Detail Modal Component
  const StudentDetailModal = ({ student, onClose }) => {
    if (!student) return null;

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
                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                <p className="text-gray-600">{student.email}</p>
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
          <div className="p-6 space-y-8">
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
                  <p className="text-gray-900">{student.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{student.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Student ID</label>
                  <p className="text-gray-900">{student.studentId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Admission Date</label>
                  <p className="text-gray-900">
                    {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Joined Date</label>
                  <p className="text-gray-900">
                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-gray-900">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Blood Group</label>
                  <p className="text-gray-900">{student.bloodGroup || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Nationality</label>
                  <p className="text-gray-900">{student.nationality || 'N/A'}</p>
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
                  <p className="text-gray-900">{student.course || 'N/A'}</p>
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
                  <p className="text-gray-900">{student.parentPhone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Alternate Phone</label>
                  <p className="text-gray-900">{student.alternatePhone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Guardian Name</label>
                  <p className="text-gray-900">{student.guardianName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Guardian Phone</label>
                  <p className="text-gray-900">{student.guardianPhone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Guardian Relation</label>
                  <p className="text-gray-900">{student.guardianRelation || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
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
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-gray-600 mt-2">Manage and view all student details</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Filters */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                <option value="year1">1st Year</option>
                <option value="year2">2nd Year</option>
                <option value="year3">3rd Year</option>
                <option value="year4">4th Year</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Join Date</option>
                <option value="room">Sort by Room</option>
              </select>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
              <span className="font-semibold">{filteredStudents.length}</span> Students
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {isLoading ? (
              <LoadingSpinner text="Loading students..." />
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">Error loading students</div>
                <p className="text-gray-500">{error.message}</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <div key={student._id} className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg group">
                    <div className="p-6">
                      {/* Profile Section */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="relative">
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
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{student.email}</p>
                          <div className="flex items-center mt-1">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {student.year || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">Roll:</span>
                          <span className="ml-1">{student.rollNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium">Room:</span>
                          <span className="ml-1">{student.roomNumber ? `${student.roomNumber}-${student.bedLetter}` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-medium">Phone:</span>
                          <span className="ml-1">{student.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-orange-500" />
                          <span className="font-medium">Joined:</span>
                          <span className="ml-1">{new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group-hover:shadow-md"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-xl mb-2">No students found</p>
                <p className="text-gray-400">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Students will appear here once they are registered and approved'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

export default StudentManagement;
