const mongoose = require('mongoose');
const Application = require('./src/models/Application');
const Room = require('./src/models/Room');
const Student = require('./src/models/Student');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelmate', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function createTestData() {
    try {
        console.log('Creating test data for dashboard...');

        // Create sample applications
        const existingApps = await Application.countDocuments();
        if (existingApps === 0) {
            console.log('Creating test applications...');
            const applications = [
                {
                    applicationId: 'APP2024001',
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '9876543210',
                    caste: 'General',
                    religion: 'Hindu',
                    income: 50000,
                    parentName: 'Robert Doe',
                    parentPhone: '9876543211',
                    address: '123 Main Street, City, State',
                    emergencyContact: '9876543212',
                    course: 'Computer Science',
                    year: 1,
                    rollNumber: 'CS2024001',
                    status: 'PENDING'
                },
                {
                    applicationId: 'APP2024002',
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    phone: '9876543213',
                    caste: 'OBC',
                    religion: 'Christian',
                    income: 75000,
                    parentName: 'Michael Smith',
                    parentPhone: '9876543214',
                    address: '456 Oak Avenue, City, State',
                    emergencyContact: '9876543215',
                    course: 'Mechanical Engineering',
                    year: 2,
                    rollNumber: 'ME2023001',
                    status: 'PENDING'
                },
                {
                    applicationId: 'APP2024003',
                    name: 'Alex Johnson',
                    email: 'alex.johnson@example.com',
                    phone: '9876543216',
                    caste: 'SC',
                    religion: 'Hindu',
                    income: 30000,
                    parentName: 'David Johnson',
                    parentPhone: '9876543217',
                    address: '789 Pine Road, City, State',
                    emergencyContact: '9876543218',
                    course: 'Electrical Engineering',
                    year: 1,
                    rollNumber: 'EE2024001',
                    status: 'PENDING'
                }
            ];

            await Application.insertMany(applications);
            console.log(`Created ${applications.length} test applications`);
        }

        // Create sample rooms
        const existingRooms = await Room.countDocuments();
        if (existingRooms === 0) {
            console.log('Creating test rooms...');
            const rooms = [];
            for (let i = 101; i <= 110; i++) {
                rooms.push({
                    roomNumber: i.toString(),
                    floor: Math.ceil((i - 100) / 20),
                    wing: ['A', 'B', 'C', 'D'][Math.floor((i - 101) / 25)],
                    rent: 5000
                });
            }
            await Room.insertMany(rooms);
            console.log(`Created ${rooms.length} test rooms`);
        }

        // Check current counts
        const stats = {
            applications: await Application.countDocuments(),
            pendingApplications: await Application.countDocuments({ status: 'PENDING' }),
            rooms: await Room.countDocuments(),
            students: await Student.countDocuments()
        };

        console.log('Database stats:', stats);
        console.log('Test data creation completed!');

    } catch (error) {
        console.error('Error creating test data:', error);
    } finally {
        mongoose.connection.close();
    }
}

createTestData();
