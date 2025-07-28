const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelmate', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Application = require('./src/models/Application');

async function testApplications() {
  try {
    console.log('Testing application database...');
    
    // Check existing applications
    const allApps = await Application.find({});
    console.log(`Total applications in database: ${allApps.length}`);
    
    const pendingApps = await Application.find({ status: 'PENDING' });
    console.log(`Pending applications: ${pendingApps.length}`);
    
    // Show sample applications
    console.log('\nSample applications:');
    allApps.slice(0, 3).forEach(app => {
      console.log(`- ${app.name} (${app.email}) - Status: ${app.status}`);
    });
    
    // Create a test application if none exist
    if (allApps.length === 0) {
      console.log('\nNo applications found. Creating a test application...');
      
      const testApp = new Application({
        name: 'Test Student',
        email: `test.${Date.now()}@hostelmate.local`,
        phone: '9876543210',
        caste: 'General',
        religion: 'Hindu',
        income: 50000,
        parentName: 'Test Parent',
        parentPhone: '9876543211',
        address: '123 Test Street',
        emergencyContact: '9876543212',
        course: 'Computer Science',
        year: 1,
        rollNumber: `TEST${Date.now()}`,
        status: 'PENDING'
      });
      
      await testApp.save();
      console.log('Test application created successfully!');
    }
    
    // Final check
    const finalPending = await Application.find({ status: 'PENDING' });
    console.log(`\nFinal pending count: ${finalPending.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testApplications();
