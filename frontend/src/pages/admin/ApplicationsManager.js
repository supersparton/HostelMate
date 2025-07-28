import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import studentApplicationService from '../../services/studentApplicationService';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ApprovalModal from './ApprovalModal';

const ApplicationsManager = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [approvalModal, setApprovalModal] = useState({ isOpen: false, application: null });
  const queryClient = useQueryClient();

  // Queries
  const { data: pendingApps, isLoading: loadingPending, error: pendingError } = useQuery(
    'pendingApplications',
    studentApplicationService.getPendingApplications,
    {
      enabled: activeTab === 'pending',
      refetchInterval: 5000, // Refetch every 5 seconds
    }
  );

  const { data: allApps, isLoading: loadingAll } = useQuery(
    'allApplications',
    studentApplicationService.getAllApplications,
    {
      enabled: activeTab === 'all',
    }
  );

  const { data: dashboardStats } = useQuery(
    'dashboardStats',
    studentApplicationService.getDashboardStats,
    {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  // Mutations
  const createTestMutation = useMutation(
    studentApplicationService.createTestApplication,
    {
      onSuccess: () => {
        toast.success('Test application created successfully!');
        queryClient.invalidateQueries('pendingApplications');
        queryClient.invalidateQueries('allApplications');
        queryClient.invalidateQueries('dashboardStats');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error creating test application');
      }
    }
  );

  const forcePendingMutation = useMutation(
    studentApplicationService.forceAllPending,
    {
      onSuccess: (data) => {
        toast.success(`Updated ${data.data.modifiedCount} applications to PENDING!`);
        queryClient.invalidateQueries('pendingApplications');
        queryClient.invalidateQueries('allApplications');
        queryClient.invalidateQueries('dashboardStats');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error updating applications');
      }
    }
  );

  const approveMutation = useMutation(
    ({ id, roomNumber, bedLetter }) => studentApplicationService.approveApplication(id, roomNumber, bedLetter),
    {
      onSuccess: (response) => {
        toast.success(`Application approved! Student assigned to Room ${response.data.data.room.roomNumber}-${response.data.data.room.bedLetter}`);
        queryClient.invalidateQueries('pendingApplications');
        queryClient.invalidateQueries('allApplications');
        queryClient.invalidateQueries('dashboardStats');
        queryClient.invalidateQueries('availableBeds');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error approving application');
      }
    }
  );

  const rejectMutation = useMutation(
    ({ id, reason }) => studentApplicationService.rejectApplication(id, reason),
    {
      onSuccess: () => {
        toast.success('Application rejected successfully!');
        queryClient.invalidateQueries('pendingApplications');
        queryClient.invalidateQueries('allApplications');
        queryClient.invalidateQueries('dashboardStats');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error rejecting application');
      }
    }
  );

  // Get current applications based on active tab
  const currentApps = activeTab === 'pending' 
    ? pendingApps?.data?.data?.applications || []
    : allApps?.data?.data?.applications || [];

  const isLoading = activeTab === 'pending' ? loadingPending : loadingAll;

  console.log('=== ApplicationsManager Debug ===');
  console.log('Active tab:', activeTab);
  console.log('Pending apps data:', pendingApps?.data);
  console.log('Current apps count:', currentApps.length);
  console.log('Dashboard stats:', dashboardStats?.data);
  console.log('Loading state:', isLoading);
  console.log('Pending error:', pendingError);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Applications Manager</h1>
          <p className="text-gray-600 mt-2">Manage and review student hostel applications</p>
        </div>

        {/* Dashboard Stats */}
        {dashboardStats?.data?.data?.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {dashboardStats.data.data.statistics.pendingAdmissions}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
              <p className="text-3xl font-bold text-green-600">
                {dashboardStats.data.data.statistics.totalStudents}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">Total Rooms</h3>
              <p className="text-3xl font-bold text-red-600">
                {dashboardStats.data.data.statistics.totalRooms}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
              <p className="text-3xl font-bold text-blue-600">
                {dashboardStats.data.data.statistics.occupancyRate}%
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                studentApplicationService.createSampleRooms()
                  .then(() => {
                    toast.success('Sample rooms created!');
                    queryClient.invalidateQueries('availableBeds');
                  })
                  .catch(console.error);
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Sample Rooms
            </button>
            <button
              onClick={() => createTestMutation.mutate()}
              disabled={createTestMutation.isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {createTestMutation.isLoading ? 'Creating...' : 'Create Test Application'}
            </button>
            <button
              onClick={() => forcePendingMutation.mutate()}
              disabled={forcePendingMutation.isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {forcePendingMutation.isLoading ? 'Updating...' : 'Force All to PENDING'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Applications ({pendingApps?.data?.count || 0})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Applications ({allApps?.data?.total || 0})
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <LoadingSpinner text="Loading applications..." />
            ) : (
              <div>
                {currentApps.length > 0 ? (
                  <div className="space-y-4">
                    {currentApps.map((app) => (
                      <div key={app._id} className="bg-gray-50 rounded-lg p-6 border">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                                <p className="text-gray-600">{app.email}</p>
                                <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Course:</span> {app.course}
                                  </div>
                                  <div>
                                    <span className="font-medium">Year:</span> {app.year}
                                  </div>
                                  <div>
                                    <span className="font-medium">Roll Number:</span> {app.rollNumber}
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span> 
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                      app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                      app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {app.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {app.status === 'PENDING' && (
                            <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-3">
                              <button
                                onClick={() => setApprovalModal({ isOpen: true, application: app })}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                Approve & Assign Bed
                              </button>
                              <button
                                onClick={() => rejectMutation.mutate({ id: app._id, reason: 'Rejected by admin' })}
                                disabled={rejectMutation.isLoading}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">
                      {activeTab === 'pending' ? 'No pending applications found' : 'No applications found'}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Create a test application to get started
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <details className="bg-white rounded-lg p-6 shadow-sm border">
          <summary className="cursor-pointer font-medium text-gray-700">Debug Information</summary>
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">API Response (Pending):</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(pendingApps?.data, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Current Apps Count:</h4>
              <p className="text-gray-600">{currentApps.length}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Loading States:</h4>
              <p className="text-gray-600">
                Pending: {loadingPending.toString()}, All: {loadingAll.toString()}
              </p>
            </div>
          </div>
        </details>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ isOpen: false, application: null })}
        application={approvalModal.application}
        onApprove={(id, roomNumber, bedLetter) => {
          approveMutation.mutate({ id, roomNumber, bedLetter });
        }}
      />
    </div>
  );
};

export default ApplicationsManager;
