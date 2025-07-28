const axios = require('axios');

// Test the dashboard API endpoint
const testDashboardAPI = async () => {
    try {
        console.log('Testing dashboard API...');
        
        // First test without auth to see if server is running
        const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
            headers: {
                'Authorization': 'Bearer test-token' // Use a dummy token for now
            }
        });
        
        console.log('Dashboard API Response:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('Error testing dashboard API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

// Test pending applications API
const testPendingAppsAPI = async () => {
    try {
        console.log('\nTesting pending applications API...');
        
        const response = await axios.get('http://localhost:5000/api/admin/admissions/pending', {
            headers: {
                'Authorization': 'Bearer test-token'
            }
        });
        
        console.log('Pending Apps API Response:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('Error testing pending apps API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

// Run tests
testDashboardAPI();
testPendingAppsAPI();
