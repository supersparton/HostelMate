import React from 'react';
import { DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import Navigation from '../../components/layout/Navigation.jsx';

const FeesPage = () => {
  const feeStructure = [
    {
      category: 'Room Rent',
      amount: '₹8,000',
      period: 'per month',
      description: 'Includes electricity, water, and maintenance charges'
    },
    {
      category: 'Mess Charges',
      amount: '₹4,500',
      period: 'per month',
      description: 'All meals included (breakfast, lunch, snacks, dinner)'
    },
    {
      category: 'Security Deposit',
      amount: '₹5,000',
      period: 'one-time',
      description: 'Refundable deposit for room and mess facilities'
    },
    {
      category: 'Admission Fee',
      amount: '₹2,000',
      period: 'one-time',
      description: 'Non-refundable registration and processing fee'
    }
  ];

  const additionalCharges = [
    { item: 'Late Fee (per day)', amount: '₹50' },
    { item: 'Room Cleaning Service', amount: '₹500/month' },
    { item: 'Laundry Service', amount: '₹800/month' },
    { item: 'Guest Room (per night)', amount: '₹200' },
    { item: 'ID Card Replacement', amount: '₹100' },
    { item: 'Key Replacement', amount: '₹150' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Fee Structure</h1>
          <p className="text-xl text-gray-600 mt-4">
            Transparent and affordable pricing for hostel facilities
          </p>
        </div>

        {/* Main Fee Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {feeStructure.map((fee, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border p-6 text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{fee.category}</h3>
              <div className="text-3xl font-bold text-blue-600 mb-1">{fee.amount}</div>
              <div className="text-sm text-gray-500 mb-3">{fee.period}</div>
              <p className="text-sm text-gray-600">{fee.description}</p>
            </div>
          ))}
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Payment Schedule</h2>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">Monthly Payments</h3>
                <p className="text-gray-600">Room rent and mess charges due by 5th of every month</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">Semester Payments</h3>
                <p className="text-gray-600">Option to pay for entire semester with 5% discount</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900">Annual Payments</h3>
                <p className="text-gray-600">Full year payment with 10% discount available</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex items-center mb-6">
              <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Payment Methods</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Online Banking / UPI</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Credit / Debit Cards</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Net Banking</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Cash Payment at Office</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Cheque / Demand Draft</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Charges */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Additional Charges</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalCharges.map((charge, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{charge.item}</span>
                <span className="font-semibold text-gray-900">{charge.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-yellow-900 mb-4">Important Notes</h2>
          <ul className="space-y-2 text-yellow-800">
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>All fees are subject to annual revision</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>Late payment will incur additional charges as mentioned above</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>Security deposit will be refunded within 30 days of checkout</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>No refund for partial months or early departure</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>GST applicable as per government regulations</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>Fee concessions available for economically disadvantaged students</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
};

export default FeesPage;
