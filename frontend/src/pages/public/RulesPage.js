import React from 'react';
import { Shield, Clock, Users, Utensils } from 'lucide-react';
import Navigation from '../../components/layout/Navigation.jsx';

const RulesPage = () => {
  const rules = [
    {
      category: 'General Rules',
      icon: Shield,
      items: [
        'Maintain discipline and order within the hostel premises',
        'Respect fellow students and hostel staff at all times',
        'No smoking, drinking, or substance abuse allowed',
        'Visitors are allowed only during specified hours (9 AM - 6 PM)',
        'Students must carry their ID cards at all times',
        'Damage to hostel property will result in penalty charges'
      ]
    },
    {
      category: 'Meal Timings',
      icon: Utensils,
      items: [
        'Breakfast: 7:00 AM - 9:00 AM',
        'Lunch: 12:00 PM - 2:00 PM',
        'Snacks: 4:00 PM - 5:00 PM',
        'Dinner: 7:00 PM - 9:00 PM',
        'Late meals will not be served after specified timings',
        'Meal booking must be done 24 hours in advance'
      ]
    },
    {
      category: 'Room Rules',
      icon: Users,
      items: [
        'Keep your room clean and tidy',
        'No loud music or noise after 10 PM',
        'Electrical appliances must be approved by management',
        'Report maintenance issues immediately',
        'No unauthorized room changes or bed swapping',
        'Personal belongings are the responsibility of students'
      ]
    },
    {
      category: 'Time Restrictions',
      icon: Clock,
      items: [
        'Hostel gates close at 10:00 PM sharp',
        'Late entry requires prior permission from warden',
        'Study hours: 9:00 PM - 11:00 PM (silence maintained)',
        'Morning wake-up bell at 6:00 AM',
        'Lights out by 11:30 PM',
        'Emergency contact available 24/7'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Hostel Rules & Regulations</h1>
          <p className="text-xl text-gray-600 mt-4">
            Please read and follow these guidelines for a harmonious hostel experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rules.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">{section.category}</h2>
                </div>
                <ul className="space-y-3">
                  {section.items.map((rule, ruleIndex) => (
                    <li key={ruleIndex} className="flex items-start">
                      <span className="text-blue-600 mr-3 mt-1">•</span>
                      <span className="text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-red-900 mb-4">Important Notice</h2>
          <p className="text-red-800 mb-4">
            Violation of hostel rules may result in disciplinary action including:
          </p>
          <ul className="space-y-2 text-red-700">
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>Warning notice for first-time offenses</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>Fine or penalty charges for property damage</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>Temporary suspension from hostel facilities</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">•</span>
              <span>Permanent expulsion for serious violations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
};

export default RulesPage;
