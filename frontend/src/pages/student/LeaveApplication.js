import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { studentService } from '../../services/studentService';

const LeaveApplication = () => {
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        status: 'ALL',
        // Remove pagination
        // page: 1,
        // limit: 10
    });
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        leaveType: 'HOME_VISIT',
        fromDate: '',
        toDate: '',
        reason: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const queryClient = useQueryClient();

    // Fetch leave applications
    const { data: leaveData, isLoading, error } = useQuery(
        ['student', 'leave-applications', filters],
        () => studentService.getLeaveApplications(filters),
        {
            keepPreviousData: true
        }
    );

    // Submit leave application mutation
    const submitLeave = useMutation(
        (data) => studentService.submitLeaveApplication(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['student', 'leave-applications']);
                setShowForm(false);
                resetForm();
                alert('Leave application submitted successfully!');
            },
            onError: (error) => {
                alert('Error submitting leave application: ' + (error.response?.data?.message || error.message));
            }
        }
    );

    // Cancel leave application mutation
    const cancelLeave = useMutation({
        mutationFn: (leaveId) => studentService.cancelLeaveApplication(leaveId),
        onSuccess: () => {
            queryClient.invalidateQueries(['student', 'leave-applications']);
            alert('Leave application cancelled successfully!');
        },
        onError: (error) => {
            alert('Error cancelling leave application: ' + (error.response?.data?.message || error.message));
        }
    });

    // Get QR codes mutation
    const getQRCodes = useMutation({
        mutationFn: (leaveId) => studentService.getLeaveQRCodes(leaveId),
        onSuccess: (data) => {
            setSelectedLeave(data.data);
            setShowQRModal(true);
        },
        onError: (error) => {
            alert('Error fetching QR codes: ' + (error.response?.data?.message || error.message));
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!formData.leaveType) {
            errors.leaveType = 'Leave type is required';
        }

        if (!formData.fromDate) {
            errors.fromDate = 'From date is required';
        } else if (new Date(formData.fromDate) < today) {
            errors.fromDate = 'From date cannot be in the past';
        }

        if (!formData.toDate) {
            errors.toDate = 'To date is required';
        } else if (formData.fromDate && new Date(formData.toDate) < new Date(formData.fromDate)) {
            errors.toDate = 'To date cannot be earlier than from date';
        }

        if (!formData.reason.trim()) {
            errors.reason = 'Reason is required';
        } else if (formData.reason.length > 500) {
            errors.reason = 'Reason cannot exceed 500 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            submitLeave.mutate(formData);
        }
    };

    const resetForm = () => {
        setFormData({
            leaveType: 'HOME_VISIT',
            fromDate: '',
            toDate: '',
            reason: ''
        });
        setFormErrors({});
    };

    const calculateDays = () => {
        if (formData.fromDate && formData.toDate) {
            const from = new Date(formData.fromDate);
            const to = new Date(formData.toDate);
            const diffTime = Math.abs(to - from);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
        return 0;
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

    // Debug logging
    console.log('Student LeaveApplication data:', {
        leaveData: leaveData,
        leaveApplications: leaveApplications,
        leaveApplicationsLength: leaveApplications.length,
        statistics: statistics,
        totalCount: totalCount
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Leave Applications</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Apply for Leave
                    </button>
                </div>

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
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Leave Applications List */}
            <div className="bg-white rounded-lg shadow-sm border">
                {leaveApplications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-500 text-lg mb-2">No leave applications found</div>
                        <p className="text-gray-400 mb-4">You haven't submitted any leave applications yet.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply for Leave
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
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
                                {leaveApplications.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-gray-50">
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
                                            {leave.adminComments && (
                                                <div className="text-xs text-gray-500 mt-1" title={leave.adminComments}>
                                                    {leave.adminComments.length > 50 
                                                        ? `${leave.adminComments.substring(0, 50)}...` 
                                                        : leave.adminComments}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {leave.status === 'PENDING' && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to cancel this leave application?')) {
                                                            cancelLeave.mutate(leave._id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {leave.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => getQRCodes.mutate(leave._id)}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors"
                                                >
                                                    View QR Codes
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Leave Application Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-w-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Apply for Leave</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Leave Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Leave Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        formErrors.leaveType ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="HOME_VISIT">Home Visit</option>
                                    <option value="MEDICAL">Medical</option>
                                    <option value="EMERGENCY">Emergency</option>
                                    <option value="PERSONAL">Personal</option>
                                    <option value="FESTIVAL">Festival</option>
                                    <option value="ACADEMIC">Academic</option>
                                    <option value="OTHER">Other</option>
                                </select>
                                {formErrors.leaveType && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.leaveType}</p>
                                )}
                            </div>

                            {/* From Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    From Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="fromDate"
                                    value={formData.fromDate}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        formErrors.fromDate ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {formErrors.fromDate && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.fromDate}</p>
                                )}
                            </div>

                            {/* To Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    To Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="toDate"
                                    value={formData.toDate}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        formErrors.toDate ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {formErrors.toDate && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.toDate}</p>
                                )}
                            </div>

                            {/* Days calculation */}
                            {formData.fromDate && formData.toDate && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Total days:</strong> {calculateDays()} days
                                    </p>
                                </div>
                            )}

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    rows={4}
                                    maxLength={500}
                                    placeholder="Please provide a detailed reason for your leave..."
                                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        formErrors.reason ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                <div className="flex justify-between items-center mt-1">
                                    {formErrors.reason && (
                                        <p className="text-red-500 text-xs">{formErrors.reason}</p>
                                    )}
                                    <p className="text-gray-500 text-xs ml-auto">
                                        {formData.reason.length}/500 characters
                                    </p>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitLeave.isLoading}
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitLeave.isLoading ? 'Submitting...' : 'Submit Application'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Codes Modal */}
            {showQRModal && selectedLeave && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Leave QR Codes</h3>
                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Leave Details</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div><strong>Type:</strong> {selectedLeave.leaveType?.replace('_', ' ')}</div>
                                    <div><strong>Duration:</strong> {formatDate(selectedLeave.fromDate)} - {formatDate(selectedLeave.toDate)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Exit QR Code */}
                                <div className="border border-red-200 rounded-lg p-4 text-center">
                                    <h4 className="font-medium text-red-800 mb-2">🚪 EXIT QR Code</h4>
                                    <p className="text-sm text-red-600 mb-3">Show this when leaving the hostel</p>
                                    <div className="bg-white p-4 rounded-lg border">
                                        <img 
                                            src={selectedLeave.qrCodes?.entryQR?.qrCode} 
                                            alt="Exit QR Code"
                                            className="mx-auto max-w-full h-48 object-contain"
                                        />
                                    </div>
                                    <div className="mt-2 text-xs text-gray-600">
                                        {selectedLeave.qrCodes?.entryQR?.used ? (
                                            <span className="text-green-600">✅ Used on {formatDate(selectedLeave.qrCodes.entryQR.usedAt)}</span>
                                        ) : (
                                            <span className="text-orange-600">⏳ Not used yet</span>
                                        )}
                                    </div>
                                </div>

                                {/* Entry QR Code */}
                                <div className="border border-green-200 rounded-lg p-4 text-center">
                                    <h4 className="font-medium text-green-800 mb-2">🏠 ENTRY QR Code</h4>
                                    <p className="text-sm text-green-600 mb-3">Show this when returning to the hostel</p>
                                    <div className="bg-white p-4 rounded-lg border">
                                        <img 
                                            src={selectedLeave.qrCodes?.exitQR?.qrCode} 
                                            alt="Entry QR Code"
                                            className="mx-auto max-w-full h-48 object-contain"
                                        />
                                    </div>
                                    <div className="mt-2 text-xs text-gray-600">
                                        {selectedLeave.qrCodes?.exitQR?.used ? (
                                            <span className="text-green-600">✅ Used on {formatDate(selectedLeave.qrCodes.exitQR.usedAt)}</span>
                                        ) : (
                                            <span className="text-orange-600">⏳ Not used yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-800 mb-2">📱 Instructions</h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Save screenshots of both QR codes to your phone</li>
                                    <li>• Show the EXIT QR code to security when leaving the hostel</li>
                                    <li>• Show the ENTRY QR code to security when returning to the hostel</li>
                                    <li>• Each QR code can only be used once</li>
                                    <li>• Keep your student ID card with you at all times</li>
                                </ul>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveApplication;
