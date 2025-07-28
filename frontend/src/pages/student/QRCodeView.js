import React, { useState } from 'react';
import { useQuery } from 'react-query';
import QRCode from 'qrcode.react';
import { Download, RefreshCw, Clock, User, Building } from 'lucide-react';
import Navigation from '../../components/layout/Navigation.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import studentService from '../../services/studentService';
import toast from 'react-hot-toast';

const QRCodeView = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: qrData, isLoading, error, refetch } = useQuery(
    'studentQRCode',
    studentService.getQRCode,
    {
      refetchInterval: 300000, // Refresh every 5 minutes
      staleTime: 240000, // Consider data stale after 4 minutes
    }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('QR Code refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh QR Code');
    } finally {
      setIsRefreshing(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement('a');
      link.download = `hostelmate-qr-${Date.now()}.png`;
      link.href = url;
      link.click();
      toast.success('QR Code downloaded successfully');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoadingSpinner text="Generating QR Code..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">Error loading QR Code: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const qrInfo = qrData?.data || {};
  const studentInfo = qrInfo.qrData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your QR Code</h1>
          <p className="text-gray-600 mt-2">
            Use this QR code for attendance marking during meal times
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Attendance QR Code
              </h2>
              
              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-6">
                <QRCode
                  id="qr-code-canvas"
                  value={qrInfo.qrString || ''}
                  size={200}
                  level="M"
                  includeMargin={true}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>

              {/* QR Code Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh QR'}
                </button>
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </button>
              </div>

              {/* Validity Info */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-center text-yellow-800">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Valid for {Math.floor((new Date(qrInfo.expiresAt) - new Date()) / (1000 * 60))} minutes
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  QR Code expires at {new Date(qrInfo.expiresAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="space-y-6">
            {/* Student Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{studentInfo.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Room & Bed</p>
                    <p className="font-medium text-gray-900">
                      Room {studentInfo.roomNumber} - Bed {studentInfo.bedLetter}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-3 flex items-center justify-center">
                    <span className="text-gray-400 text-xs font-bold">#</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Student ID</p>
                    <p className="font-medium text-gray-900">{studentInfo.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Generated At</p>
                    <p className="font-medium text-gray-900">
                      {new Date(qrInfo.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <p>Show this QR code to the mess staff during meal times</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">2</span>
                  </div>
                  <p>Staff will scan the QR code to mark your attendance</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <p>Your attendance will be automatically recorded in the system</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">4</span>
                  </div>
                  <p>QR code refreshes automatically every 5 minutes for security</p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Notes</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>This QR code is unique to you and should not be shared with others</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>QR codes expire every 5 minutes for security purposes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>If your QR code doesn't work, try refreshing it</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Contact admin if you continue to face issues with QR scanning</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeView;
