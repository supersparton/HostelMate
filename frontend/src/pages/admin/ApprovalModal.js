import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import studentApplicationService from '../../services/studentApplicationService';

const ApprovalModal = ({ isOpen, onClose, application, onApprove }) => {
  const [selectedBed, setSelectedBed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: bedsData, isLoading: bedsLoading } = useQuery(
    'availableBeds',
    studentApplicationService.getAvailableBeds,
    { enabled: isOpen }
  );

  const availableBeds = bedsData?.data?.data?.availableBeds || [];

  useEffect(() => {
    if (!isOpen) {
      setSelectedBed('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleApprove = async () => {
    if (!selectedBed) {
      alert('Please select a bed');
      return;
    }

    const [roomNumber, bedLetter] = selectedBed.split('-');
    
    setIsSubmitting(true);
    try {
      await onApprove(application._id, roomNumber, bedLetter);
      onClose();
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Approve Application</h2>
        
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">{application?.name}</h3>
          <p className="text-gray-600">{application?.email}</p>
          <p className="text-gray-600">{application?.course} - Year {application?.year}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Available Bed:
          </label>
          {bedsLoading ? (
            <div className="text-center py-4">Loading available beds...</div>
          ) : availableBeds.length > 0 ? (
            <select
              value={selectedBed}
              onChange={(e) => setSelectedBed(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a bed...</option>
              {availableBeds.map((bed) => (
                <option key={`${bed.roomNumber}-${bed.bedLetter}`} value={`${bed.roomNumber}-${bed.bedLetter}`}>
                  {bed.label} (Floor {bed.floor}, Wing {bed.wing})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg">
              No available beds found. Please check room management.
            </div>
          )}
        </div>

        {selectedBed && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Auto-Generated Login Details:</h4>
            <p className="text-sm text-blue-700">
              Username: {application?.email}
            </p>
            <p className="text-sm text-blue-700">
              Password: {application?.name?.replace(/\s+/g, '').toLowerCase()}{selectedBed.replace('-', '')}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              (Password format: username + room + bed)
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleApprove}
            disabled={!selectedBed || isSubmitting}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Approving...' : 'Approve & Assign Bed'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
