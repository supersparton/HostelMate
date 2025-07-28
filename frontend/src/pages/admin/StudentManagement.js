import React from 'react';
import { useQuery } from 'react-query';
import Navigation from '../../components/layout/Navigation.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import adminService from '../../services/adminService';
import { 
  Users, 
  Mail, 
  Building,
  Phone,
  Calendar
} from 'lucide-react';

const StudentManagement = () => {
  // Single query for all students
  const { 
    data: allStudents, 
    isLoading, 
    error 
  } = useQuery('allStudents', adminService.getApprovedStudents);

  const students = allStudents?.data?.data?.students || [];

  // Temporary debug to see what we're getting
  if (allStudents) {
    console.log('=== FRONTEND DEBUG ===');
    console.log('Full response:', allStudents);
    console.log('Data object:', allStudents?.data);
    console.log('Nested data object:', allStudents?.data?.data);
    console.log('Students array:', allStudents?.data?.data?.students);
    console.log('Students length:', students.length);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Students</h1>
          <p className="text-gray-600 mt-2">Complete list of all students with their details</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {isLoading ? (
              <LoadingSpinner text="Loading all students..." />
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">Error loading students</div>
                <p className="text-gray-500">{error.message}</p>
              </div>
            ) : students.length > 0 ? (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Total Students: {students.length}
                  </h2>
                </div>
                
                {students.map((student) => (
                  <div key={student._id} className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {student.name}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          {/* Basic Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">Contact Information</h4>
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {student.email}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {student.phone || 'N/A'}
                            </div>
                          </div>

                          {/* Academic Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">Academic Details</h4>
                            <div><strong>Roll Number:</strong> {student.rollNumber}</div>
                            <div><strong>Course:</strong> {student.course}</div>
                            <div><strong>Year:</strong> {student.year}</div>
                            <div><strong>Caste:</strong> {student.caste || 'N/A'}</div>
                          </div>

                          {/* Hostel Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">Hostel Details</h4>
                            <div className="flex items-center text-gray-600">
                              <Building className="h-4 w-4 mr-2" />
                              Room {student.roomNumber} - Bed {student.bedLetter}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              Joined: {new Date(student.createdAt).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Details */}
                        {(student.parentName || student.parentPhone || student.address) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">Family Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                              {student.parentName && (
                                <div><strong>Parent Name:</strong> {student.parentName}</div>
                              )}
                              {student.parentPhone && (
                                <div><strong>Parent Phone:</strong> {student.parentPhone}</div>
                              )}
                              {student.address && (
                                <div>
                                  <strong>Address:</strong> 
                                  {typeof student.address === 'object' ? (
                                    <div className="ml-2">
                                      {student.address.street && <div>{student.address.street}</div>}
                                      {student.address.city && <div>{student.address.city}</div>}
                                      {student.address.state && <div>{student.address.state}</div>}
                                      {student.address.pincode && <div>PIN: {student.address.pincode}</div>}
                                    </div>
                                  ) : (
                                    <span> {student.address}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Student ID for reference */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            <strong>Student ID:</strong> {student._id}
                            <br />
                            <strong>Student System ID:</strong> {student.studentId || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No students found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Students will appear here once they are registered and approved
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
