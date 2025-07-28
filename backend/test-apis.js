const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
    adminCredentials: {
        email: 'admin@hostelmate.com',
        password: 'admin123'
    },
    studentData: {
        name: 'Test Student',
        email: 'test.student@example.com',
        phone: '9876543210',
        password: 'TestPass123',
        caste: 'General',
        religion: 'Hindu',
        income: 50000,
        parentName: 'Test Parent',
        parentPhone: '9876543211',
        course: 'Computer Science',
        year: 2,
        rollNumber: 'CS2023001'
    }
};

let adminToken = '';
let studentToken = '';
let studentId = '';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(data && { data })
        };

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status
        };
    }
}

// Test functions
async function testHealthCheck() {
    console.log('\n🧪 Testing Health Check...');
    const result = await apiCall('GET', '/health');
    
    if (result.success) {
        console.log('✅ Health check passed');
        console.log('📊 Server status:', result.data.status);
    } else {
        console.log('❌ Health check failed:', result.error);
        return false;
    }
    return true;
}

async function testPublicEndpoints() {
    console.log('\n🌐 Testing Public Endpoints...');
    
    const endpoints = [
        '/public/home',
        '/public/vision',
        '/public/contact',
        '/public/rules',
        '/public/fees'
    ];

    for (const endpoint of endpoints) {
        const result = await apiCall('GET', endpoint);
        if (result.success) {
            console.log(`✅ ${endpoint} - OK`);
        } else {
            console.log(`❌ ${endpoint} - Failed:`, result.error.message || result.error);
        }
    }
}

async function testAdminLogin() {
    console.log('\n🔐 Testing Admin Login...');
    
    const result = await apiCall('POST', '/auth/login', testConfig.adminCredentials);
    
    if (result.success && result.data.data.tokens) {
        adminToken = result.data.data.tokens.accessToken;
        console.log('✅ Admin login successful');
        console.log('👤 Admin name:', result.data.data.user.name);
        return true;
    } else {
        console.log('❌ Admin login failed:', result.error.message || result.error);
        return false;
    }
}

async function testStudentRegistration() {
    console.log('\n📝 Testing Student Registration...');
    
    const result = await apiCall('POST', '/auth/register', testConfig.studentData);
    
    if (result.success) {
        console.log('✅ Student registration successful');
        console.log('🆔 Student ID:', result.data.data.studentId);
        console.log('📋 Status:', result.data.data.admissionStatus);
        return true;
    } else {
        console.log('❌ Student registration failed:', result.error.message || result.error);
        return false;
    }
}

async function testAdminDashboard() {
    console.log('\n📊 Testing Admin Dashboard...');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return false;
    }

    const result = await apiCall('GET', '/admin/dashboard', null, adminToken);
    
    if (result.success) {
        console.log('✅ Admin dashboard data retrieved');
        console.log('📈 Statistics:', {
            totalStudents: result.data.data.statistics.totalStudents,
            pendingAdmissions: result.data.data.statistics.pendingAdmissions,
            totalRooms: result.data.data.statistics.totalRooms
        });
        return true;
    } else {
        console.log('❌ Admin dashboard failed:', result.error.message || result.error);
        return false;
    }
}

async function testPendingAdmissions() {
    console.log('\n📋 Testing Pending Admissions...');
    
    if (!adminToken) {
        console.log('❌ No admin token available');
        return false;
    }

    const result = await apiCall('GET', '/admin/admissions/pending', null, adminToken);
    
    if (result.success) {
        console.log('✅ Pending admissions retrieved');
        console.log('📊 Count:', result.data.data.students.length);
        
        if (result.data.data.students.length > 0) {
            studentId = result.data.data.students[0]._id;
            console.log('👤 First student ID:', studentId);
        }
        return true;
    } else {
        console.log('❌ Pending admissions failed:', result.error.message || result.error);
        return false;
    }
}

async function testAcceptAdmission() {
    console.log('\n✅ Testing Admission Acceptance...');
    
    if (!adminToken || !studentId) {
        console.log('❌ No admin token or student ID available');
        return false;
    }

    const acceptData = {
        roomNumber: '101',
        bedLetter: 'A'
    };

    const result = await apiCall('POST', `/admin/admissions/${studentId}/accept`, acceptData, adminToken);
    
    if (result.success) {
        console.log('✅ Student admission accepted');
        console.log('🏠 Room assigned:', result.data.data.room.roomNumber);
        console.log('🛏️ Bed assigned:', result.data.data.room.bedLetter);
        return true;
    } else {
        console.log('❌ Admission acceptance failed:', result.error.message || result.error);
        return false;
    }
}

async function testStudentLogin() {
    console.log('\n🔐 Testing Student Login...');
    
    const studentCredentials = {
        email: testConfig.studentData.email,
        password: testConfig.studentData.password
    };

    const result = await apiCall('POST', '/auth/login', studentCredentials);
    
    if (result.success && result.data.data.tokens) {
        studentToken = result.data.data.tokens.accessToken;
        console.log('✅ Student login successful');
        console.log('👤 Student name:', result.data.data.user.name);
        return true;
    } else {
        console.log('❌ Student login failed:', result.error.message || result.error);
        return false;
    }
}

async function testStudentDashboard() {
    console.log('\n📊 Testing Student Dashboard...');
    
    if (!studentToken) {
        console.log('❌ No student token available');
        return false;
    }

    const result = await apiCall('GET', '/student/dashboard', null, studentToken);
    
    if (result.success) {
        console.log('✅ Student dashboard data retrieved');
        console.log('👤 Student info:', {
            name: result.data.data.student.userId.name,
            room: result.data.data.student.roomNumber,
            bed: result.data.data.student.bedLetter
        });
        return true;
    } else {
        console.log('❌ Student dashboard failed:', result.error.message || result.error);
        return false;
    }
}

async function testQRCodeGeneration() {
    console.log('\n📱 Testing QR Code Generation...');
    
    if (!studentToken) {
        console.log('❌ No student token available');
        return false;
    }

    const result = await apiCall('GET', '/student/qr-code', null, studentToken);
    
    if (result.success) {
        console.log('✅ QR code generated successfully');
        console.log('📊 QR data includes:', Object.keys(result.data.data.qrData));
        return true;
    } else {
        console.log('❌ QR code generation failed:', result.error.message || result.error);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting HostelMate API Tests...');
    console.log('=' .repeat(50));

    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'Public Endpoints', fn: testPublicEndpoints },
        { name: 'Admin Login', fn: testAdminLogin },
        { name: 'Student Registration', fn: testStudentRegistration },
        { name: 'Admin Dashboard', fn: testAdminDashboard },
        { name: 'Pending Admissions', fn: testPendingAdmissions },
        { name: 'Accept Admission', fn: testAcceptAdmission },
        { name: 'Student Login', fn: testStudentLogin },
        { name: 'Student Dashboard', fn: testStudentDashboard },
        { name: 'QR Code Generation', fn: testQRCodeGeneration }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} threw an error:`, error.message);
            failed++;
        }
        
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Your HostelMate API is working perfectly!');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the server logs and fix any issues.');
    }
}

// Check if server is running before starting tests
async function checkServerAndRun() {
    console.log('🔍 Checking if server is running...');
    
    try {
        await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server is running, starting tests...');
        await runTests();
    } catch (error) {
        console.log('❌ Server is not running!');
        console.log('💡 Please start the server first:');
        console.log('   cd backend');
        console.log('   node src/index.js');
        console.log('');
        console.log('   Then run this test again:');
        console.log('   node test-apis.js');
    }
}

// Run the tests
checkServerAndRun();
