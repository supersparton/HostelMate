import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminService } from '../../services/adminService';
import StudentProfileModal from '../../components/admin/StudentProfileModal.jsx';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  Search,
  Eye,
  Edit,
  CheckCheck
} from 'lucide-react';

const AdminComplaintManagement = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showConfirmResolve, setShowConfirmResolve] = useState(false);
  const [complaintToResolve, setComplaintToResolve] = useState(null);
  const [responseData, setResponseData] = useState({
    status: '',
    adminResponse: ''
  });
  
  // Student profile modal state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Student Profile Modal Functions
  const openStudentProfile = (studentId) => {
    setSelectedStudentId(studentId);
    setIsProfileModalOpen(true);
  };

  const closeStudentProfile = () => {
    setSelectedStudentId(null);
    setIsProfileModalOpen(false);
  };
  
  const queryClient = useQueryClient();

  // Fetch complaints
  const { data: complaintsData, isLoading, error } = useQuery(
    ['admin', 'complaints', { status: filterStatus, category: filterCategory, priority: filterPriority, search: searchTerm }],
    () => adminService.getComplaints(filterStatus),
    {
      onSuccess: (data) => {
        console.log('Admin complaints data received:', data);
      },
      onError: (error) => {
        console.error('Error fetching complaints:', error);
      },
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  // Update complaint mutation
  const updateComplaintMutation = useMutation(
    ({ complaintId, status, response }) => adminService.updateComplaintStatus(complaintId, status, response),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'complaints']);
        setShowResponseModal(false);
        setSelectedComplaint(null);
        setResponseData({ status: '', adminResponse: '' });
        alert('Complaint updated successfully!');
      },
      onError: (error) => {
        console.error('Error updating complaint:', error);
        alert('Error updating complaint: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  const handleResponseSubmit = (e) => {
    e.preventDefault();
    
    if (!responseData.status) {
      alert('Please select a status');
      return;
    }

    updateComplaintMutation.mutate({
      complaintId: selectedComplaint._id,
      status: responseData.status,
      response: responseData.adminResponse
    });
  };

  const handleResolveConfirm = () => {
    if (complaintToResolve) {
      updateComplaintMutation.mutate({
        complaintId: complaintToResolve._id,
        status: 'RESOLVED',
        response: complaintToResolve.adminResponse || 'Issue has been resolved.'
      });
      setShowConfirmResolve(false);
      setComplaintToResolve(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-100';
      case 'RESOLVED': return 'text-green-600 bg-green-100';
      case 'CLOSED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <AlertCircle className="w-4 h-4" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />;
      case 'CLOSED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'URGENT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const complaints = complaintsData?.data?.data?.complaints || [];
  
  // Debug logging
  console.log('Admin - Full response data:', complaintsData);
  console.log('Admin - Response data.data:', complaintsData?.data?.data);
  console.log('Admin - Complaints array:', complaints);
  console.log('Admin - Complaints length:', complaints.length);
  
  // Filter complaints based on local filters
  const filteredComplaints = complaints.filter(complaint => {
    const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
                         complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.studentId?.userId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPriority && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading complaints</p>
          <p className="text-gray-500 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaint Management</h1>
          <p className="text-gray-600">Review and respond to student complaints</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="FOOD">Food</option>
              <option value="CLEANLINESS">Cleanliness</option>
              <option value="SECURITY">Security</option>
              <option value="FACILITIES">Facilities</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Stats */}
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredComplaints.length} of {complaints.length} complaints
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
              <p className="text-gray-500">
                {complaints.length === 0 
                  ? "No complaints have been submitted yet."
                  : "No complaints match your current filters."
                }
              </p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Title and Status */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{complaint.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{complaint.studentId?.userId?.name || 'Unknown Student'}</span>
                        {complaint.studentId?._id && (
                          <button
                            onClick={() => openStudentProfile(complaint.studentId._id)}
                            className="ml-1 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                            title="View Student Profile"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(complaint.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {complaint.category}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {complaint.priority}
                      </span>
                      {complaint.roomNumber && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Room {complaint.roomNumber}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-4">{complaint.description}</p>

                    {/* Admin Response */}
                    {complaint.adminResponse && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">Admin Response:</h4>
                        <p className="text-blue-800">{complaint.adminResponse}</p>
                        {complaint.resolvedAt && (
                          <p className="text-xs text-blue-600 mt-2">
                            Resolved on {formatDate(complaint.resolvedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 lg:w-32">
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setResponseData({
                          status: complaint.status,
                          adminResponse: complaint.adminResponse || ''
                        });
                        setShowResponseModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Respond
                    </button>
                    
                    {complaint.status !== 'RESOLVED' && (
                      <button
                        onClick={() => {
                          setComplaintToResolve(complaint);
                          setShowConfirmResolve(true);
                        }}
                        className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCheck className="w-4 h-4" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Response Modal */}
        {showResponseModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Respond to Complaint</h2>
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Complaint Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">{selectedComplaint.title}</h3>
                  <p className="text-gray-700 text-sm mb-2">{selectedComplaint.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {selectedComplaint.category}
                    </span>
                    <span className={`px-2 py-1 rounded ${getPriorityColor(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleResponseSubmit} className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={responseData.status}
                      onChange={(e) => setResponseData(prev => ({ ...prev, status: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  {/* Admin Response */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Message
                    </label>
                    <textarea
                      value={responseData.adminResponse}
                      onChange={(e) => setResponseData(prev => ({ ...prev, adminResponse: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your response to the student..."
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={updateComplaintMutation.isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateComplaintMutation.isLoading ? 'Updating...' : 'Update Complaint'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResponseModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Resolve Confirmation Modal */}
        {showConfirmResolve && complaintToResolve && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Confirm Resolution</h2>
                  <button
                    onClick={() => {
                      setShowConfirmResolve(false);
                      setComplaintToResolve(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to mark this complaint as resolved?
                </p>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="font-medium text-sm text-gray-900">{complaintToResolve.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{complaintToResolve.category}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleResolveConfirm}
                    disabled={updateComplaintMutation.isLoading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateComplaintMutation.isLoading ? 'Resolving...' : 'Yes, Resolve'}
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmResolve(false);
                      setComplaintToResolve(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeStudentProfile}
        studentId={selectedStudentId}
      />
    </div>
  );
};

export default AdminComplaintManagement;
