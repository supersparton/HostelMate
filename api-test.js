// Quick test script to verify API endpoints
const BASE_URL = 'http://localhost:5000/api';

// Test function to check API endpoints
async function testAPIs() {
  console.log('Testing API endpoints...');
  
  try {
    // Test dashboard
    console.log('\n1. Testing /admin/dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard response:', dashboardData);
    
    // Test pending admissions
    console.log('\n2. Testing /admin/admissions/pending...');
    const pendingResponse = await fetch(`${BASE_URL}/admin/admissions/pending`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const pendingData = await pendingResponse.json();
    console.log('Pending admissions response:', pendingData);
    
    // Test all admissions
    console.log('\n3. Testing /admin/admissions/all...');
    const allResponse = await fetch(`${BASE_URL}/admin/admissions/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const allData = await allResponse.json();
    console.log('All admissions response:', allData);
    
    // Create a test application first
    console.log('\n4. Creating test application...');
    const createResponse = await fetch(`${BASE_URL}/admin/admissions/create-simple-test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const createData = await createResponse.json();
    console.log('Create test application response:', createData);
    
    // Force all to pending
    console.log('\n5. Forcing all applications to PENDING...');
    const forceResponse = await fetch(`${BASE_URL}/admin/admissions/force-all-pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const forceData = await forceResponse.json();
    console.log('Force all pending response:', forceData);
    
    // Test pending again
    console.log('\n6. Testing /admin/admissions/pending after forcing...');
    const pendingResponse2 = await fetch(`${BASE_URL}/admin/admissions/pending`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const pendingData2 = await pendingResponse2.json();
    console.log('Pending admissions response after forcing:', pendingData2);
    
  } catch (error) {
    console.error('API test error:', error);
  }
}

// Run the test
testAPIs();

console.log('To run this test, copy and paste this code into your browser console while on the admin page.');
