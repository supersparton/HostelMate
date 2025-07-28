import React from 'react';
import { useQuery } from 'react-query';
import studentApplicationService from '../../services/studentApplicationService';

const SimpleApplicationTest = () => {
  const { data, isLoading, error } = useQuery(
    'testPendingApps',
    studentApplicationService.getPendingApplications
  );

  console.log('=== SIMPLE TEST DEBUG ===');
  console.log('Raw response:', data);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const applications = data?.data?.data?.applications || [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Application Test</h1>
      <div className="mb-4">
        <strong>Found {applications.length} applications</strong>
      </div>
      
      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app, index) => (
            <div key={app._id || index} className="border p-4 rounded">
              <h3 className="font-semibold">{app.name}</h3>
              <p>Email: {app.email}</p>
              <p>Course: {app.course}</p>
              <p>Status: {app.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">
          No applications found. Try creating test data.
          <button 
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {
              studentApplicationService.createTestApplication()
                .then(() => window.location.reload())
                .catch(console.error);
            }}
          >
            Create Test Application
          </button>
        </div>
      )}
      
      <details className="mt-8">
        <summary>Raw Response</summary>
        <pre className="bg-gray-100 p-4 mt-2 text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default SimpleApplicationTest;
