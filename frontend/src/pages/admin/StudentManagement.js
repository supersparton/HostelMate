import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Building,
  Phone,
  Mail
} from 'lucide-react';
import Navigation from '../../components/layout/Navigation.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [roomAssignment, setRoomAssignment] = useState({ roomNumber: '', bedLetter: '', password: '' });

  const queryClient = useQueryClient();

  // Queries
  const { data: pendingStudents, isLoading: loadingPending } = useQuery(
    'pendingAdmissions',
    adminService.getPendingAdmissions,
    { enabled: activeTab === 'pending' }
  );

  const { data: approvedStudents, isLoading: loadingApproved } = useQuery(
    'approvedStudents',
    adminService.getApprovedStudents,
    { enabled: activeTab === 'approved' }
  );

  const { data: availableRooms } = useQuery(
    'availableRooms',
    adminService.getAvailableRooms
  );

  const { data: allAdmissions } = useQuery(
    'allAdmissions',
    adminService.getAllAdmissions
  );

  // Mutations
  const createTestApplicationsMutation = useMutation(
    adminService.createTestApplications,
    {
      onSuccess: () => {
        toast.success('Test applications created successfully');
        queryClient.invalidateQueries('pendingAdmissions');
        queryClient.invalidateQueries('allAdmissions');
        queryClient.invalidateQueries('adminDashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error creating test applications');
      }
    }
  );

  const createSimpleTestMutation = useMutation(
    adminService.createSimpleTestApplication,
    {
      onSuccess: () => {
        toast.success('Simple test application created successfully');
        queryClient.invalidateQueries('pendingAdmissions');
        queryClient.invalidateQueries('allAdmissions');
        queryClient.invalidateQueries('adminDashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error creating simple test application');
      }
    }
  );

  const fixStatusMutation = useMutation(
    adminService.fixApplicationStatus,
    {
      onSuccess: (data) => {
        toast.success(`Fixed ${data.data.modifiedCount} applications`);
        queryClient.invalidateQueries('pendingAdmissions');
        queryClient.invalidateQueries('allAdmissions');
        queryClient.invalidateQueries('adminDashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error fixing application status');
      }
    }
  );

  const forceAllPendingMutation = useMutation(
    adminService.forceAllPending,
    {
      onSuccess: (data) => {
        toast.success(`Forced all applications to PENDING. Modified: ${data.data.modifiedCount}`);
        queryClient.invalidateQueries('pendingAdmissions');
        queryClient.invalidateQueries('allAdmissions');
        queryClient.invalidateQueries('adminDashboard');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error forcing all applications to PENDING');
      }
    }
  );

  // Mutations
  const acceptAdmissionMutation = useMutation(
    ({ applicationId, roomData }) => adminService.acceptAdmission(applicationId, roomData),
    {
      onSuccess: () => {
        toast.success('Application approved and student account created successfully');
        queryClient.invalidateQueries('pendingAdmissions');
        queryClient.invalidateQueries('approvedStudents');
        queryClient.invalidateQueries('availableRooms');
        setShowAssignRoomModal(false);
        setSelectedStudent(null);
        setRoomAssignment({ roomNumber: '', bedLetter: '', password: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error accepting application');
      }
    }
  );

  const rejectAdmissionMutation = useMutation(
    ({ applicationId, reason }) => adminService.rejectAdmission(applicationId, reason),
    {
      onSuccess: () => {
        toast.success('Application rejected successfully');
        queryClient.invalidateQueries('pendingAdmissions');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error rejecting application');
      }
    }
  );

  const handleAcceptAdmission = (application) => {
    setSelectedStudent(application);
    setShowAssignRoomModal(true);
  };

  const handleRejectAdmission = (applicationId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectAdmissionMutation.mutate({ applicationId, reason });
    }
  };

  const handleAssignRoom = () => {
    if (!roomAssignment.roomNumber || !roomAssignment.bedLetter || !roomAssignment.password) {
      toast.error('Please select room, bed, and provide a password');
      return;
    }

    acceptAdmissionMutation.mutate({
      applicationId: selectedStudent._id,
      roomData: roomAssignment
    });
  };

  const filteredPendingStudents = pendingStudents?.data?.applications || [];
  
  // Debug logging
  console.log('Debug StudentManagement:', {
    pendingStudents: pendingStudents,
    pendingData: pendingStudents?.data,
    applications: pendingStudents?.data?.applications,
    filteredPendingStudents: filteredPendingStudents,
    filteredLength: filteredPendingStudents.length
  });

  const filteredApprovedStudents = approvedStudents?.data?.students?.filter(student =>
    student.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isLoading = loadingPending || loadingApproved;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
              <p className="text-gray-600 mt-2">Manage student admissions and records</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => fixStatusMutation.mutate()}
                disabled={fixStatusMutation.isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {fixStatusMutation.isLoading ? 'Fixing...' : 'Fix Application Status'}
              </button>
              <button
                onClick={() => forceAllPendingMutation.mutate()}
                disabled={forceAllPendingMutation.isLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {forceAllPendingMutation.isLoading ? 'Forcing...' : 'Force All PENDING'}
              </button>
              <button
                onClick={() => createSimpleTestMutation.mutate()}
                disabled={createSimpleTestMutation.isLoading}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {createSimpleTestMutation.isLoading ? 'Creating...' : 'Create Simple Test'}
              </button>
              <button
                onClick={() => createTestApplicationsMutation.mutate()}
                disabled={createTestApplicationsMutation.isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {createTestApplicationsMutation.isLoading ? 'Creating...' : 'Create Test Applications'}
              </button>
            </div>
          </div>
          
          {/* Debug Info */}
          {allAdmissions?.data && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Debug Information:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Total Applications: {allAdmissions.data.total || 0}</p>
                  <p className="font-medium">Without Status: {allAdmissions.data.withoutStatus || 0}</p>
                  <p className="font-medium">Pending Query Response: {JSON.stringify(pendingStudents?.data?.pagination || {})}</p>
                </div>
                <div>
                  <p className="font-medium">Status Breakdown:</p>
                  {allAdmissions.data.statusCounts?.map(status => (
                    <p key={status._id} className="ml-2">
                      {status._id || 'No Status'}: {status.count}
                    </p>
                  ))}
                  {(!allAdmissions.data.statusCounts || allAdmissions.data.statusCounts.length === 0) && (
                    <p className="ml-2 text-red-600">No applications found in database</p>
                  )}
                  {allAdmissions.data.withoutStatus > 0 && (
                    <p className="ml-2 text-yellow-600">⚠️ {allAdmissions.data.withoutStatus} apps need status fix</p>
                  )}
                </div>
                <div>
                  <p className="font-medium">Recent Applications:</p>
                  {allAdmissions.data.applications?.slice(0, 3).map(app => (
                    <p key={app._id} className="ml-2 text-xs">
                      {app.name} - {app.status || 'NO STATUS'}
                    </p>
                  ))}
                  {(!allAdmissions.data.applications || allAdmissions.data.applications.length === 0) && (
                    <p className="ml-2 text-red-600">No recent applications</p>
                  )}
                </div>
              </div>
              
              {/* Raw data for debugging */}
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-gray-700">Show Raw API Response</summary>
                <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify({
                    pendingStudents: pendingStudents?.data,
                    allAdmissions: allAdmissions?.data
                  }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Admissions ({pendingStudents?.data?.applications?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Approved Students ({approvedStudents?.data?.students?.length || 0})
            </button>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <LoadingSpinner text="Loading students..." />
            ) : (
              <>
                {/* Pending Admissions */}
                {activeTab === 'pending' && (
                  <div>
                    {filteredPendingStudents.length > 0 ? (
                      <div className="space-y-4">
                        {filteredPendingStudents.map((application) => (
                          <div key={application._id} className="bg-gray-50 rounded-lg p-6 border">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex-1">
                                <div className="flex items-start space-x-4">
                                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {application.name}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {application.email}
                                      </div>
                                      <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {application.phone}
                                      </div>
                                      <div>
                                        <strong>Course:</strong> {application.course}
                                      </div>
                                      <div>
                                        <strong>Year:</strong> {application.year}
                                      </div>
                                      <div>
                                        <strong>Roll No:</strong> {application.rollNumber}
                                      </div>
                                      <div>
                                        <strong>Caste:</strong> {application.caste}
                                      </div>
                                      <div>
                                        <strong>Parent:</strong> {application.parentName}
                                      </div>
                                      <div>
                                        <strong>Parent Phone:</strong> {application.parentPhone}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-3">
                                <button
                                  onClick={() => handleAcceptAdmission(application)}
                                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  disabled={acceptAdmissionMutation.isLoading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectAdmission(application._id)}
                                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                  disabled={rejectAdmissionMutation.isLoading}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No pending admissions found</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Approved Students */}
                {activeTab === 'approved' && (
                  <div>
                    {filteredApprovedStudents.length > 0 ? (
                      <div className="space-y-4">
                        {filteredApprovedStudents.map((student) => (
                          <div key={student._id} className="bg-gray-50 rounded-lg p-6 border">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex-1">
                                <div className="flex items-start space-x-4">
                                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {student.userId.name}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {student.userId.email}
                                      </div>
                                      <div className="flex items-center">
                                        <Building className="h-4 w-4 mr-2" />
                                        Room {student.roomNumber} - Bed {student.bedLetter}
                                      </div>
                                      <div>
                                        <strong>Course:</strong> {student.course} (Year {student.year})
                                      </div>
                                      <div>
                                        <strong>Roll No:</strong> {student.rollNumber}
                                      </div>
                                      <div>
                                        <strong>Status:</strong> 
                                        <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                          Active
                                        </span>
                                      </div>
                                      <div>
                                        <strong>Joined:</strong> {new Date(student.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-3">
                                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </button>
                                <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No approved students found</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Room Assignment Modal */}
      {showAssignRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Assign Room to {selectedStudent?.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Room
                </label>
                <select
                  value={roomAssignment.roomNumber}
                  onChange={(e) => setRoomAssignment(prev => ({ ...prev, roomNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a room</option>
                  {availableRooms?.data?.rooms?.map((room) => (
                    <option key={room._id} value={room.roomNumber}>
                      Room {room.roomNumber} ({room.availableBeds.length} beds available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Bed
                </label>
                <select
                  value={roomAssignment.bedLetter}
                  onChange={(e) => setRoomAssignment(prev => ({ ...prev, bedLetter: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!roomAssignment.roomNumber}
                >
                  <option value="">Select a bed</option>
                  {roomAssignment.roomNumber && 
                    availableRooms?.data?.rooms
                      ?.find(room => room.roomNumber === roomAssignment.roomNumber)
                      ?.availableBeds?.map((bed) => (
                        <option key={bed} value={bed}>
                          Bed {bed}
                        </option>
                      ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Password *
                </label>
                <input
                  type="password"
                  value={roomAssignment.password}
                  onChange={(e) => setRoomAssignment(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password for student account"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAssignRoom}
                disabled={acceptAdmissionMutation.isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {acceptAdmissionMutation.isLoading ? 'Assigning...' : 'Assign Room'}
              </button>
              <button
                onClick={() => {
                  setShowAssignRoomModal(false);
                  setSelectedStudent(null);
                  setRoomAssignment({ roomNumber: '', bedLetter: '', password: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
