const mongoose = require('mongoose');
const LeaveApplication = require('./src/models/LeaveApplication');

mongoose.connect('mongodb://localhost:27017/hostelmate');

mongoose.connection.once('open', async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Check all leave applications in the database
        const leaves = await LeaveApplication.find({}).populate('studentId', 'name').populate('userId', 'email');
        console.log('Total leave applications in database:', leaves.length);
        
        if (leaves.length === 0) {
            console.log('No leave applications found in database');
        } else {
            leaves.forEach((leave, index) => {
                console.log(`Leave ${index + 1}:`, {
                    id: leave._id,
                    studentId: leave.studentId?._id || 'MISSING',
                    studentName: leave.studentId?.name || 'MISSING',
                    userId: leave.userId?._id || 'MISSING',
                    userEmail: leave.userId?.email || 'MISSING',
                    status: leave.status,
                    fromDate: leave.fromDate,
                    toDate: leave.toDate,
                    reason: leave.reason.substring(0, 50),
                    createdAt: leave.createdAt
                });
            });
        }
        
        // Also check the structure of the last leave application
        const lastLeave = await LeaveApplication.findOne().sort({ createdAt: -1 });
        if (lastLeave) {
            console.log('\nLast leave application details:');
            console.log(JSON.stringify(lastLeave, null, 2));
        }
        
    } catch (error) {
        console.error('Error checking leaves:', error);
    }
    
    mongoose.connection.close();
});
