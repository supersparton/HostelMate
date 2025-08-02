import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Eye } from 'lucide-react';
import { adminService } from '../../services/adminService';
import StudentProfileModal from '../../components/admin/StudentProfileModal.jsx';

const LeaveManagement = () => {
    const [filters, setFilters] = useState({
        status: 'ALL',
        leaveType: 'ALL',
        search: '',
        // Remove pagination
        // page: 1,
        // limit: 20
    });
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
    const [adminComments, setAdminComments] = useState('');
    
    // Student profile modal state
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const queryClient = useQueryClient();

    // Fetch leave applications
    const { data: leaveData, isLoading, error } = useQuery(
        ['admin', 'leave-applications', filters],
        () => adminService.getLeaveApplications(filters),
        {
            keepPreviousData: true,
            refetchInterval: 30000 // Refresh every 30 seconds
        }
    );

    // Fetch leave statistics (commented out - not currently used)
    // const { data: statsData } = useQuery(
    //     ['admin', 'leave-statistics'],
    //     () => adminService.getLeaveStatistics(),
    //     {
    //         refetchInterval: 60000 // Refresh every minute
    //     }
    // );

    // Approve leave mutation
    const approveLeave = useMutation(
        ({ id, comments }) => adminService.approveLeaveApplication(id, comments),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['admin', 'leave-applications']);
                queryClient.invalidateQueries(['admin', 'leave-statistics']);
                handleCloseModal();
                alert('Leave application approved successfully! Email sent to student with QR codes.');
            },
            onError: (error) => {
                alert('Error approving leave: ' + (error.response?.data?.message || error.message));
            }
        }
    );

    // Reject leave mutation
    const rejectLeave = useMutation(
        ({ id, comments }) => adminService.rejectLeaveApplication(id, comments),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['admin', 'leave-applications']);
                queryClient.invalidateQueries(['admin', 'leave-statistics']);
                handleCloseModal();
                alert('Leave application rejected successfully! Email sent to student.');
            },
            onError: (error) => {
                alert('Error rejecting leave: ' + (error.response?.data?.message || error.message));
            }
        }
    );

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filters change
        }));
    };

    const handleAction = (leave, action) => {
        setSelectedLeave(leave);
        setActionType(action);
        setAdminComments('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedLeave(null);
        setActionType('');
        setAdminComments('');
    };

    // Student profile modal functions
    const openStudentProfile = (studentId) => {
        setSelectedStudentId(studentId);
        setIsProfileModalOpen(true);
    };

    const closeStudentProfile = () => {
        setSelectedStudentId(null);
        setIsProfileModalOpen(false);
    };

    const handleSubmitAction = () => {
        if (!selectedLeave) return;

        if (actionType === 'approve') {
            approveLeave.mutate({
                id: selectedLeave._id,
                comments: adminComments
            });
        } else if (actionType === 'reject') {
            if (!adminComments.trim()) {
                alert('Please provide a reason for rejection');
                return;
            }
            rejectLeave.mutate({
                id: selectedLeave._id,
                comments: adminComments
            });
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getLeaveTypeBadge = (type) => {
        const badges = {
            HOME_VISIT: 'bg-blue-100 text-blue-800',
            MEDICAL: 'bg-red-100 text-red-800',
            EMERGENCY: 'bg-orange-100 text-orange-800',
            PERSONAL: 'bg-purple-100 text-purple-800',
            FESTIVAL: 'bg-pink-100 text-pink-800',
            ACADEMIC: 'bg-indigo-100 text-indigo-800',
            OTHER: 'bg-gray-100 text-gray-800'
        };
        return badges[type] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error loading leave applications: {error.message}</p>
            </div>
        );
    }

    const leaveApplications = leaveData?.data?.data?.leaveApplications || [];
    const statistics = leaveData?.data?.data?.statistics || {};
    const totalCount = leaveData?.data?.data?.totalCount || 0;
    const totalPages = leaveData?.data?.data?.totalPages || 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Leave Management</h1>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-yellow-800 text-sm font-medium">Pending</div>
                        <div className="text-2xl font-bold text-yellow-900">{statistics.PENDING || 0}</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-green-800 text-sm font-medium">Approved</div>
                        <div className="text-2xl font-bold text-green-900">{statistics.APPROVED || 0}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-800 text-sm font-medium">Rejected</div>
                        <div className="text-2xl font-bold text-red-900">{statistics.REJECTED || 0}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-blue-800 text-sm font-medium">Total</div>
                        <div className="text-2xl font-bold text-blue-900">{totalCount}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                        <select
                            value={filters.leaveType}
                            onChange={(e) => handleFilterChange('leaveType', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Types</option>
                            <option value="HOME_VISIT">Home Visit</option>
                            <option value="MEDICAL">Medical</option>
                            <option value="EMERGENCY">Emergency</option>
                            <option value="PERSONAL">Personal</option>
                            <option value="FESTIVAL">Festival</option>
                            <option value="ACADEMIC">Academic</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by reason..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
                        <select
                            value={filters.limit}
                            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Leave Applications Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leave Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaveApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        <div>
                                            <div className="text-lg font-medium">No leave applications found</div>
                                            <div className="text-sm mt-1">
                                                Try adjusting your filters to see more results.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                leaveApplications.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {leave.studentName || leave.studentId?.name || 'Unknown Student'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {leave.studentId?.studentId} • Room {leave.studentRoom || leave.studentId?.roomNumber || 'N/A'}
                                                    </div>
                                                </div>
                                                {leave.studentId?._id && (
                                                    <button
                                                        onClick={() => openStudentProfile(leave.studentId._id)}
                                                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                                                        title="View Student Profile"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeBadge(leave.leaveType)}`}>
                                            {leave.leaveType?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{formatDate(leave.fromDate)} - {formatDate(leave.toDate)}</div>
                                        <div className="text-gray-500">{leave.totalDays} days</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {leave.reason}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {leave.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleAction(leave, 'approve')}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(leave, 'reject')}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {leave.status !== 'PENDING' && (
                                            <span className="text-gray-400">
                                                {leave.status === 'APPROVED' ? 'QR Codes Sent' : 'Rejected'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page {filters.page} of {totalPages} 
                                    <span className="font-medium"> ({totalCount} total applications)</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                                        disabled={filters.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                                        disabled={filters.page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {showModal && selectedLeave && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Application
                            </h3>
                            
                            {/* Student Details */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm">
                                    <div><strong>Student:</strong> {selectedLeave.studentId?.name}</div>
                                    <div><strong>Room:</strong> {selectedLeave.studentId?.roomNumber}</div>
                                    <div><strong>Leave Type:</strong> {selectedLeave.leaveType?.replace('_', ' ')}</div>
                                    <div><strong>Duration:</strong> {formatDate(selectedLeave.fromDate)} - {formatDate(selectedLeave.toDate)}</div>
                                    <div><strong>Days:</strong> {selectedLeave.totalDays}</div>
                                    <div><strong>Reason:</strong> {selectedLeave.reason}</div>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {actionType === 'approve' ? 'Admin Comments (Optional)' : 'Rejection Reason (Required)'}
                                </label>
                                <textarea
                                    value={adminComments}
                                    onChange={(e) => setAdminComments(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={actionType === 'approve' 
                                        ? 'Optional comments for the student...' 
                                        : 'Please provide a reason for rejection...'}
                                />
                            </div>

                            {actionType === 'approve' && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        ✅ Upon approval, the student will receive an email with two QR codes:
                                        one for exiting the hostel and one for re-entry.
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSubmitAction}
                                    disabled={approveLeave.isLoading || rejectLeave.isLoading}
                                    className={`flex-1 py-2 px-4 rounded-lg text-white font-medium ${
                                        actionType === 'approve' 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-red-600 hover:bg-red-700'
                                    } disabled:opacity-50`}
                                >
                                    {(approveLeave.isLoading || rejectLeave.isLoading) ? 'Processing...' : 
                                        (actionType === 'approve' ? 'Approve & Send QR Codes' : 'Reject Application')}
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Profile Modal */}
            <StudentProfileModal 
                studentId={selectedStudentId}
                isOpen={isProfileModalOpen}
                onClose={closeStudentProfile}
            />
        </div>
    );
};

export default LeaveManagement;
