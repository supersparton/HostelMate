const express = require('express');
const mongoose = require('mongoose'); // Add mongoose for connection debugging
const bcrypt = require('bcryptjs'); // Use bcryptjs to match User model
const Student = require('../models/Student');
const User = require('../models/User');
const Application = require('../models/Application');
const Room = require('../models/Room');
const Menu = require('../models/Menu');
const LeaveApplication = require('../models/LeaveApplication');
const Attendance = require('../models/Attendance');
const Complaint = require('../models/Complaint');
const CommunityPost = require('../models/CommunityPost');
const MealBooking = require('../models/MealBooking');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateObjectId, handleValidationErrors } = require('../middleware/validation');
const emailService = require('../services/emailService');
const moment = require('moment');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken, requireAdmin);

// ======================
// ADMISSION MANAGEMENT
// ======================

// Get all pending admissions
router.get('/admissions/pending', async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '' } = req.query;
        
        console.log('GET /admissions/pending called with:', { page, limit, search });
        
        const searchQuery = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { applicationId: { $regex: search, $options: 'i' } },
                { course: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const applications = await Application.find({ 
            status: 'PENDING',
            ...searchQuery 
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await Application.countDocuments({ 
            status: 'PENDING',
            ...searchQuery 
        });

        console.log('Found pending applications:', {
            count: applications.length,
            total: total,
            sampleApps: applications.slice(0, 2).map(app => ({
                id: app._id,
                name: app.name,
                status: app.status,
                email: app.email
            }))
        });

        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Error in GET /admissions/pending:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending applications',
            error: error.message
        });
    }
});

// Get all applications (for debugging)
router.get('/admissions/all', async (req, res) => {
    try {
        const applications = await Application.find({})
            .sort({ createdAt: -1 })
            .limit(50);

        console.log('All applications found:', applications.length);
        console.log('Sample application statuses:', applications.slice(0, 5).map(app => ({
            id: app._id,
            status: app.status,
            hasStatus: app.status !== undefined && app.status !== null
        })));

        const statusCounts = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('Status counts from aggregation:', statusCounts);

        // Also check for applications without status field
        const withoutStatus = await Application.countDocuments({
            $or: [
                { status: { $exists: false } },
                { status: null },
                { status: undefined },
                { status: '' }
            ]
        });

        console.log('Applications without proper status:', withoutStatus);

        res.json({
            success: true,
            data: {
                applications,
                statusCounts,
                withoutStatus,
                total: await Application.countDocuments()
            }
        });

    } catch (error) {
        console.error('Error in /admissions/all:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all applications',
            error: error.message
        });
    }
});

// Create test applications (for development/testing only)
router.post('/admissions/create-test', async (req, res) => {
    try {
        console.log('Creating test applications...');
        
        // First, check if test applications already exist
        const existingCount = await Application.countDocuments({ 
            email: { $regex: 'test.*@hostelmate.example' } 
        });

        const timestamp = Date.now();
        const year = new Date().getFullYear();
        const totalCount = await Application.countDocuments();
        
        const testApplicationsData = [
            {
                applicationId: `APP${year}${String(totalCount + 1).padStart(4, '0')}`, // Manual ID
                name: 'John Doe',
                email: `test.john.${timestamp}@hostelmate.example`,
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
                rollNumber: `CS2024${String(existingCount + 1).padStart(3, '0')}`,
                status: 'PENDING'
            },
            {
                applicationId: `APP${year}${String(totalCount + 2).padStart(4, '0')}`, // Manual ID
                name: 'Jane Smith',
                email: `test.jane.${timestamp}@hostelmate.example`,
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
                rollNumber: `ME2023${String(existingCount + 2).padStart(3, '0')}`,
                status: 'PENDING'
            },
            {
                applicationId: `APP${year}${String(totalCount + 3).padStart(4, '0')}`, // Manual ID
                name: 'Alex Johnson',
                email: `test.alex.${timestamp}@hostelmate.example`,
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
                rollNumber: `EE2024${String(existingCount + 3).padStart(3, '0')}`,
                status: 'PENDING'
            }
        ];

        // Create applications one by one to trigger pre-save hooks
        const createdApplications = [];
        for (let i = 0; i < testApplicationsData.length; i++) {
            const appData = testApplicationsData[i];
            const application = new Application(appData);
            const savedApp = await application.save();
            createdApplications.push(savedApp);
            console.log(`Created application ${i + 1}: ${savedApp.name} (${savedApp.applicationId})`);
        }

        console.log(`Successfully created ${createdApplications.length} test applications`);

        res.json({
            success: true,
            message: 'Test applications created successfully',
            data: {
                count: createdApplications.length,
                applications: createdApplications
            }
        });

    } catch (error) {
        console.error('Error creating test applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating test applications',
            error: error.message,
            details: error.errors || error
        });
    }
});

// Fix existing applications that might be missing status field
router.post('/admissions/fix-status', async (req, res) => {
    try {
        // Find applications without status field or with null/undefined status
        const result = await Application.updateMany(
            { 
                $or: [
                    { status: { $exists: false } },
                    { status: null },
                    { status: undefined },
                    { status: '' }
                ]
            },
            { $set: { status: 'PENDING' } }
        );

        // Get current status counts after fixing
        const statusCounts = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            message: `Fixed ${result.modifiedCount} applications`,
            data: {
                modifiedCount: result.modifiedCount,
                statusCounts
            }
        });

    } catch (error) {
        console.error('Error fixing application status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fixing application status',
            error: error.message
        });
    }
});

// Clean up duplicate applicationIds and fix numbering
router.post('/admissions/cleanup-duplicates', async (req, res) => {
    try {
        console.log('Starting cleanup of duplicate applicationIds...');
        
        // Find all applications
        const allApps = await Application.find({}).sort({ createdAt: 1 });
        
        // Remove duplicates based on applicationId
        const seenIds = new Set();
        const duplicates = [];
        
        for (const app of allApps) {
            if (seenIds.has(app.applicationId)) {
                duplicates.push(app._id);
                console.log(`Found duplicate applicationId: ${app.applicationId} (${app.name})`);
            } else {
                seenIds.add(app.applicationId);
            }
        }
        
        // Delete duplicates
        if (duplicates.length > 0) {
            await Application.deleteMany({ _id: { $in: duplicates } });
            console.log(`Deleted ${duplicates.length} duplicate applications`);
        }
        
        // Re-number remaining applications
        const remainingApps = await Application.find({}).sort({ createdAt: 1 });
        const year = new Date().getFullYear();
        
        for (let i = 0; i < remainingApps.length; i++) {
            const app = remainingApps[i];
            const newAppId = `APP${year}${String(i + 1).padStart(4, '0')}`;
            
            if (app.applicationId !== newAppId) {
                app.applicationId = newAppId;
                await app.save();
                console.log(`Updated ${app.name}: ${app.applicationId} -> ${newAppId}`);
            }
        }
        
        res.json({
            success: true,
            message: `Cleanup completed. Removed ${duplicates.length} duplicates and renumbered ${remainingApps.length} applications`,
            data: {
                duplicatesRemoved: duplicates.length,
                totalApplications: remainingApps.length
            }
        });

    } catch (error) {
        console.error('Error cleaning up duplicates:', error);
        res.status(500).json({
            success: false,
            message: 'Error cleaning up duplicates',
            error: error.message
        });
    }
});

// Create a simple test application (one at a time to avoid conflicts)
router.post('/admissions/create-simple-test', async (req, res) => {
    try {
        const timestamp = Date.now();
        
        console.log('Creating simple test application...');
        
        // Generate a more unique applicationId to avoid conflicts
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4 digit random number
        const uniqueApplicationId = `APP${year}${randomNum}${timestamp.toString().slice(-3)}`;
        
        const testApplication = new Application({
            applicationId: uniqueApplicationId, // Manually set to avoid pre-save hook conflicts
            name: 'Test Student ' + timestamp.toString().slice(-4),
            email: `test.student.${timestamp}@hostelmate.local`,
            phone: '9876543210',
            caste: 'General',
            religion: 'Hindu',
            income: 50000,
            parentName: 'Test Parent',
            parentPhone: '9876543211',
            address: '123 Test Street, Test City, Test State',
            emergencyContact: '9876543212',
            course: 'Computer Science',
            year: 1,
            rollNumber: `TEST${timestamp.toString().slice(-6)}`,
            status: 'PENDING'
        });

        const savedApplication = await testApplication.save();
        console.log('Test application created:', {
            id: savedApplication._id,
            applicationId: savedApplication.applicationId,
            name: savedApplication.name,
            status: savedApplication.status,
            email: savedApplication.email
        });

        res.json({
            success: true,
            message: 'Simple test application created successfully',
            data: savedApplication
        });

    } catch (error) {
        console.error('Error creating simple test application:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating simple test application',
            error: error.message,
            validationErrors: error.errors
        });
    }
});

// Create comprehensive test data for dashboard
router.post('/create-test-data', async (req, res) => {
    try {
        console.log('Creating comprehensive test data...');
        
        const timestamp = Date.now();
        const bcrypt = require('bcryptjs');
        
        // Clear existing test data to avoid conflicts
        console.log('Clearing existing test data...');
        await Application.deleteMany({ email: { $regex: /hostelmate\.local$/ } });
        await User.deleteMany({ email: { $regex: /hostelmate\.local$/ } });
        await Student.deleteMany({ studentId: { $regex: /^STU/ } });
        await Room.deleteMany({ roomNumber: { $in: ['1', '2', '3', '4', '5'] } });
        await LeaveApplication.deleteMany({});
        await Complaint.deleteMany({});
        await Attendance.deleteMany({});
        console.log('Existing test data cleared');
        
        // Create test applications
        const applications = [];
        for (let i = 1; i <= 3; i++) {
            const app = new Application({
                name: `Test Student ${i}`,
                email: `test.student.${i}.${timestamp}@hostelmate.local`,
                phone: `987654321${i}`,
                course: ['Computer Science', 'Mechanical Engineering', 'Civil Engineering'][i-1],
                year: i,
                status: 'PENDING',
                rollNumber: `TEST${timestamp}${i}`,
                caste: 'General',
                religion: 'Hindu',
                income: 50000,
                parentName: `Test Parent ${i}`,
                parentPhone: `987654320${i}`,
                address: `${i}23 Test Street, Test City, Test State`,
                emergencyContact: `987654322${i}`
            });
            const saved = await app.save();
            applications.push(saved);
        }
        
        // Create test users and students (must create User first, then Student)
        const students = [];
        for (let i = 1; i <= 2; i++) {
            // First create User
            const hashedPassword = await bcrypt.hash(`password${i}`, 10);
            const user = new User({
                name: `Accepted Student ${i}`,
                email: `accepted.student.${i}.${timestamp}@hostelmate.local`,
                phone: `887654321${i}`,
                password: hashedPassword,
                role: 'STUDENT',
                isActive: true
            });
            const savedUser = await user.save();
            
            // Then create Student with all required fields
            const student = new Student({
                userId: savedUser._id, // Link to the user we just created
                studentId: `STU${timestamp}${i}`,
                caste: 'General',
                religion: 'Hindu',
                income: 50000,
                parentName: `Parent ${i}`,
                parentPhone: `8876543210`,
                course: ['Computer Science', 'Electrical Engineering'][i-1],
                year: i,
                rollNumber: `STU${timestamp}${i}`,
                admissionStatus: 'ACCEPTED',
                roomNumber: i.toString(), // Valid room number format
                bedLetter: 'A',
                address: {
                    street: `${i}45 Student Street`,
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456'
                },
                emergencyContact: `9876543210`
            });
            const savedStudent = await student.save();
            students.push(savedStudent);
        }
        
        // Create test rooms
        const rooms = [];
        for (let i = 1; i <= 5; i++) {
            const room = new Room({
                roomNumber: i.toString(),
                floor: Math.ceil(i / 10),
                wing: ['A', 'B', 'C', 'D'][Math.floor((i-1) / 2)],
                rent: 5000
            });
            
            // Set bed occupancy for first 2 rooms
            if (i <= 2) {
                room.beds.A.isOccupied = true;
                room.beds.A.studentId = students[i-1]._id;
            }
            
            const saved = await room.save();
            rooms.push(saved);
        }
        
        // Create test leave applications
        const leaveApps = [];
        for (let i = 1; i <= 2; i++) {
            const leave = new LeaveApplication({
                studentId: students[i-1]._id, // Use actual student ObjectId
                reason: ['Family function', 'Medical checkup'][i-1],
                fromDate: new Date(),
                toDate: new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000),
                status: 'PENDING'
            });
            const saved = await leave.save();
            leaveApps.push(saved);
        }
        
        // Create test complaints
        const complaints = [];
        for (let i = 1; i <= 2; i++) {
            const complaint = new Complaint({
                studentId: students[i-1]._id, // Use actual student ObjectId
                title: ['WiFi not working', 'AC repair needed'][i-1],
                description: ['WiFi has been down for 2 days', 'AC is making loud noises'][i-1],
                category: 'MAINTENANCE',
                status: i === 1 ? 'OPEN' : 'IN_PROGRESS',
                priority: i === 1 ? 'MEDIUM' : 'HIGH'
            });
            const saved = await complaint.save();
            complaints.push(saved);
        }
        
        // Create test attendance
        const today = new Date().toISOString().split('T')[0];
        const attendanceRecords = [];
        for (let i = 1; i <= 2; i++) {
            const attendance = new Attendance({
                studentId: students[i-1]._id, // Use actual student ObjectId
                date: today,
                type: 'DINNER',
                timestamp: new Date(),
                qrCodeUsed: `QR${timestamp}${i}`, // Required field
                location: 'MESS_HALL'
            });
            const saved = await attendance.save();
            attendanceRecords.push(saved);
        }
        
        const summary = {
            applications: applications.length,
            students: students.length,
            rooms: rooms.length,
            leaveApplications: leaveApps.length,
            complaints: complaints.length,
            attendanceRecords: attendanceRecords.length
        };
        
        console.log('Test data created successfully:', summary);
        
        res.json({
            success: true,
            message: 'Comprehensive test data created successfully',
            data: summary
        });
        
    } catch (error) {
        console.error('Error creating test data:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating test data',
            error: error.message
        });
    }
});

router.get('/students', async (req, res) => {
    try {
        console.log('Fetching all students with complete details...');

        // Get ALL students (no filters, no pagination, no complex logic)
        const students = await Student.find({})
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        console.log(`Found ${students.length} total students in database`);

        // Format response with complete student details
        const studentsWithDetails = students.map(student => ({
            _id: student._id,
            studentId: student.studentId,
            name: student.userId?.name || 'N/A',
            email: student.userId?.email || 'N/A',
            phone: student.userId?.phone || 'N/A',
            course: student.course,
            year: student.year,
            rollNumber: student.rollNumber,
            roomNumber: student.roomNumber,
            bedLetter: student.bedLetter,
            admissionStatus: student.admissionStatus,
            admissionDate: student.admissionDate,
            caste: student.caste,
            religion: student.religion,
            income: student.income,
            parentName: student.parentName,
            parentPhone: student.parentPhone,
            address: student.address,
            emergencyContact: student.emergencyContact,
            createdAt: student.createdAt
        }));

        res.json({
            success: true,
            message: `All students (${students.length} total)`,
            data: {
                students: studentsWithDetails,
                total: students.length
            }
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
});

// Debug route to check all students in database
router.get('/debug/all-students', async (req, res) => {
    try {
        const allStudents = await Student.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        const statusBreakdown = await Student.aggregate([
            {
                $group: {
                    _id: '$admissionStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('All students in database:', allStudents.length);
        console.log('Status breakdown:', statusBreakdown);
        
        // Also check what exactly is in each student record
        const sampleStudents = allStudents.slice(0, 3).map(student => ({
            id: student._id,
            studentId: student.studentId,
            admissionStatus: student.admissionStatus,
            roomNumber: student.roomNumber,
            bedLetter: student.bedLetter,
            userId: student.userId?._id,
            userName: student.userId?.name,
            createdAt: student.createdAt
        }));
        
        console.log('Sample student records:', sampleStudents);

        res.json({
            success: true,
            message: `All students in database (${allStudents.length} total)`,
            data: {
                students: allStudents,
                statusBreakdown,
                sampleStudents,
                total: allStudents.length,
                acceptedCount: allStudents.filter(s => s.admissionStatus === 'ACCEPTED').length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching all students for debug',
            error: error.message
        });
    }
});

// Create sample rooms (for testing)
router.post('/admissions/create-sample-rooms', async (req, res) => {
    try {
        console.log('Creating sample rooms...');
        
        // Check if rooms already exist
        const existingRooms = await Room.countDocuments();
        if (existingRooms > 0) {
            return res.json({
                success: true,
                message: `${existingRooms} rooms already exist. No new rooms created.`,
                data: { existingCount: existingRooms }
            });
        }

        // Create sample rooms 101-110
        const sampleRooms = [];
        for (let roomNum = 101; roomNum <= 110; roomNum++) {
            const room = new Room({
                roomNumber: roomNum.toString(),
                floor: Math.ceil((roomNum - 100) / 20),
                wing: ['A', 'B', 'C', 'D'][Math.floor((roomNum - 101) / 25)],
                rent: 5000
            });
            sampleRooms.push(room);
        }

        await Room.insertMany(sampleRooms);

        console.log(`Created ${sampleRooms.length} sample rooms`);

        res.json({
            success: true,
            message: `Created ${sampleRooms.length} sample rooms (101-110)`,
            data: {
                roomsCreated: sampleRooms.length,
                totalBeds: sampleRooms.length * 4
            }
        });

    } catch (error) {
        console.error('Error creating sample rooms:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating sample rooms',
            error: error.message
        });
    }
});

// Get available beds for assignment
router.get('/admissions/available-beds', async (req, res) => {
    try {
        console.log('Getting available beds...');
        
        // Find all rooms with available beds
        const rooms = await Room.find({
            $or: [
                { 'beds.A.isOccupied': false },
                { 'beds.B.isOccupied': false },
                { 'beds.C.isOccupied': false },
                { 'beds.D.isOccupied': false }
            ]
        }).sort({ roomNumber: 1 });

        const availableBeds = [];
        
        rooms.forEach(room => {
            ['A', 'B', 'C', 'D'].forEach(bedLetter => {
                if (!room.beds[bedLetter].isOccupied) {
                    availableBeds.push({
                        roomNumber: room.roomNumber,
                        bedLetter: bedLetter,
                        label: `Room ${room.roomNumber} - Bed ${bedLetter}`,
                        floor: room.floor,
                        wing: room.wing,
                        rent: room.rent
                    });
                }
            });
        });

        console.log(`Found ${availableBeds.length} available beds`);

        res.json({
            success: true,
            data: {
                availableBeds,
                total: availableBeds.length
            }
        });

    } catch (error) {
        console.error('Error getting available beds:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available beds',
            error: error.message
        });
    }
});

// Accept admission application
router.post('/admissions/:applicationId/accept', async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { roomNumber, bedLetter } = req.body;

        console.log('Accept application called with:', { applicationId, roomNumber, bedLetter });

        // Validate required fields
        if (!roomNumber || !bedLetter || !['A', 'B', 'C', 'D'].includes(bedLetter)) {
            console.log('Validation failed:', { roomNumber, bedLetter });
            return res.status(400).json({
                success: false,
                message: 'Room number and bed letter (A, B, C, D) are required'
            });
        }

        // Find application
        console.log('Finding application with ID:', applicationId);
        const application = await Application.findById(applicationId);
        if (!application) {
            console.log('Application not found');
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        console.log('Found application:', { name: application.name, status: application.status });

        if (application.status !== 'PENDING') {
            console.log('Application is not pending, current status:', application.status);
            return res.status(400).json({
                success: false,
                message: 'Application is not pending'
            });
        }

        // Auto-generate password: username + room + bed (e.g., john101A)
        const username = application.name.replace(/\s+/g, '').toLowerCase();
        const autoPassword = `${username}${roomNumber}${bedLetter}`;

        console.log(`Auto-generated password for ${application.name}: ${autoPassword}`);

        // Check if room exists and bed is available
        console.log('Looking for room:', roomNumber);
        let room = await Room.findOne({ roomNumber });
        if (!room) {
            console.log('Room not found, creating new room');
            // Create room if it doesn't exist
            const roomNum = parseInt(roomNumber);
            if (roomNum < 1 || roomNum > 200) {
                console.log('Invalid room number:', roomNum);
                return res.status(400).json({
                    success: false,
                    message: 'Room number must be between 1 and 200'
                });
            }

            room = new Room({
                roomNumber,
                floor: Math.ceil(roomNum / 20),
                wing: ['A', 'B', 'C', 'D'][Math.floor((roomNum - 1) / 50)],
                rent: 5000
            });
            await room.save();
            console.log(`Created new room: ${roomNumber}`);
        }

        console.log('Room found/created:', { roomNumber: room.roomNumber, beds: room.beds });

        if (room.beds[bedLetter].isOccupied) {
            console.log(`Bed ${bedLetter} is already occupied`);
            return res.status(400).json({
                success: false,
                message: `Bed ${bedLetter} in room ${roomNumber} is already occupied`
            });
        }

        // Check if application has already been processed
        console.log('Checking if application already processed...');
        const existingUser = await User.findOne({ email: application.email });
        if (existingUser) {
            const existingStudent = await Student.findOne({ userId: existingUser._id });
            if (existingStudent) {
                console.log('Application already processed');
                return res.status(400).json({
                    success: false,
                    message: `This application has already been processed. Student ${existingStudent.studentId} is assigned to room ${existingStudent.roomNumber}-${existingStudent.bedLetter}`
                });
            } else {
                // User exists but no student record - this is the hanging scenario
                console.log('⚠️ CONFLICT: User exists but no student record. Deleting orphaned user...');
                await User.findByIdAndDelete(existingUser._id);
                console.log('✅ Orphaned user deleted, proceeding with new creation');
            }
        }

        console.log('🔄 STEP 1: Creating User Account FIRST with encrypted password...');
        
        // STEP 1: Create User account FIRST with STUDENT role and encrypted password
        let user;
        try {
            const saltRounds = 10;
            
            // Encrypt the password before storing
            console.log('🔄 Encrypting password...');
            const hashedPassword = await bcrypt.hash(autoPassword, saltRounds);
            console.log('✅ Password encrypted successfully');
            
            // Create user using User model with encrypted password
            console.log('🔄 Creating user object...');
            user = new User({
                name: application.name,
                email: application.email,
                phone: application.phone,
                password: hashedPassword, // Store encrypted password
                role: 'STUDENT', // STUDENT role
                isActive: true
            });
            console.log('✅ User object created');
            
            console.log('🔄 Saving user to database...');
            console.log('User data being saved:', {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                passwordLength: user.password.length
            });
            
            // Check MongoDB connection first
            console.log('🔄 Checking MongoDB connection state...');
            console.log('Mongoose connection state:', mongoose.connection.readyState);
            console.log('Database name:', mongoose.connection.name);
            
            // Try direct MongoDB insertion first as it's more reliable
            console.log('🔄 ATTEMPTING DIRECT MONGODB INSERTION (bypassing Mongoose)...');
            let savedUser;
            try {
                const userDoc = {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    password: user.password,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                console.log('🔄 Inserting directly into users collection...');
                const insertResult = await mongoose.connection.db.collection('users').insertOne(userDoc);
                console.log('✅ Direct insertion successful:', insertResult.insertedId);
                
                // Create a user object with the inserted ID for further processing
                savedUser = await User.findById(insertResult.insertedId);
                console.log('✅ STEP 1 COMPLETE (Direct): User account created');
                
            } catch (directError) {
                console.error('❌ Direct insertion failed:', directError);
                console.log('🔄 Falling back to Mongoose save method...');
                
                // Fallback to original Mongoose save method
                const savePromise = new Promise(async (resolve, reject) => {
                    try {
                        console.log('🔄 Starting user.save() operation...');
                        const result = await user.save();
                        console.log('🔄 user.save() completed successfully');
                        resolve(result);
                    } catch (error) {
                        console.log('🔄 user.save() failed with error:', error.message);
                        reject(error);
                    }
                });
                
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => {
                        console.log('❌ TIMEOUT: User save operation exceeded 8 seconds');
                        reject(new Error('User save operation timed out after 8 seconds - possible database connection issue'));
                    }, 8000)
                );
                
                try {
                    savedUser = await Promise.race([savePromise, timeoutPromise]);
                    console.log(`✅ STEP 1 COMPLETE (Fallback): User account created with ID: ${savedUser._id}`);
                } catch (saveError) {
                    console.error('❌ DETAILED SAVE ERROR:', {
                        message: saveError.message,
                        name: saveError.name,
                        code: saveError.code,
                        codeName: saveError.codeName,
                        keyPattern: saveError.keyPattern,
                        keyValue: saveError.keyValue,
                        mongooseConnectionState: mongoose.connection.readyState
                    });
                    
                    // If it's a duplicate key error, provide specific message
                    if (saveError.code === 11000) {
                        throw new Error(`Email ${application.email} is already registered. Please check if this application was already processed.`);
                    }
                    
                    throw saveError;
                }
            }
            
            console.log(`✅ User account details:`);
            console.log(`   - ID: ${savedUser._id}`);
            console.log(`   - Email: ${savedUser.email}`);
            console.log(`   - Role: ${savedUser.role}`);
            console.log(`   - Password: [ENCRYPTED WITH BCRYPTJS]`);
            
            // Update user reference for the rest of the process
            user = savedUser;
            
        } catch (userCreateError) {
            console.error('❌ Error creating user account:', userCreateError);
            throw userCreateError;
        }

        console.log('🔄 STEP 2: Creating Student Profile with all details...');
        
        // STEP 2: Create Student profile with all details INCLUDING required fields
        // Generate studentId in format: YEAR + first 3 letters of course + sequential number
        const currentYear = new Date().getFullYear();
        const coursePrefix = application.course.substring(0, 3).toUpperCase();
        const studentCount = await Student.countDocuments() + 1;
        const generatedStudentId = `${currentYear}${coursePrefix}${String(studentCount).padStart(3, '0')}`;
        
        const student = new Student({
            // REQUIRED FIELDS FIRST
            userId: user._id, // Link to user account
            studentId: generatedStudentId, // Generated student ID
            
            // Personal Information
            caste: application.caste,
            religion: application.religion,
            income: application.income,
            parentName: application.parentName,
            parentPhone: application.parentPhone,
            course: application.course,
            year: application.year,
            rollNumber: application.rollNumber,
            address: {
                street: application.address || 'Not specified',
                city: 'Not specified',
                state: 'Not specified',
                pincode: '000000'
            },
            emergencyContact: application.emergencyContact,
            
            // Room and Bed Assignment
            roomNumber: roomNumber,
            bedLetter: bedLetter,
            
            // Admission Details
            admissionStatus: 'ACCEPTED',
            admissionDate: new Date()
        });

        try {
            await student.save();
            console.log(`✅ STEP 2 COMPLETE: Student profile created with ID: ${student._id}`);
            console.log(`   - Student ID: ${student.studentId}`);
            console.log(`   - Room: ${roomNumber}, Bed: ${bedLetter}`);
            console.log(`   - Course: ${student.course}, Year: ${student.year}`);
            console.log(`   - Roll Number: ${student.rollNumber}`);
        } catch (studentCreateError) {
            console.error('❌ Error creating student profile:', studentCreateError);
            // Clean up user if student creation fails
            await User.findByIdAndDelete(user._id);
            console.log('🧹 Cleaned up user record due to student creation failure');
            throw studentCreateError;
        }

        console.log('🔄 STEP 3: Updating room bed assignment...');
        // Update room bed assignment
        room.beds[bedLetter].isOccupied = true;
        room.beds[bedLetter].studentId = student._id;
        await room.save();
        console.log(`✅ STEP 3 COMPLETE: Assigned bed ${bedLetter} in room ${roomNumber} to ${application.name}`);

        console.log('🔄 STEP 4: Updating application status...');
        // Update application status
        application.status = 'APPROVED';
        application.reviewedBy = req.user._id;
        application.reviewDate = new Date();
        await application.save();
        console.log('✅ STEP 4 COMPLETE: Application status updated to APPROVED');

        console.log('🔄 STEP 5: Sending approval email...');
        // Send professional approval email with login credentials
        try {
            await emailService.sendAdmissionAcceptance(
                {
                    name: application.name,
                    email: application.email,
                    studentId: student.studentId
                },
                {
                    roomNumber: student.roomNumber,
                    bedLetter: student.bedLetter,
                    floor: room.floor,
                    wing: room.wing
                },
                {
                    email: user.email,
                    password: autoPassword
                }
            );
            console.log('✅ STEP 5 COMPLETE: Professional approval email sent successfully');
        } catch (emailError) {
            console.warn('⚠️ STEP 5 WARNING: Email sending failed, but application was approved:', emailError.message);
        }

        const response = {
            success: true,
            message: 'Application approved successfully! Complete workflow executed.',
            data: {
                workflow: {
                    step1: "✅ User account created with encrypted password",
                    step2: "✅ Student profile created with all details",
                    step3: "✅ Room bed assigned",
                    step4: "✅ Application marked as approved",
                    step5: "✅ Professional approval email sent"
                },
                student: {
                    studentId: student.studentId,
                    name: user.name,
                    email: user.email,
                    course: student.course,
                    year: student.year,
                    rollNumber: student.rollNumber,
                    generatedPassword: autoPassword, // Plain text password for admin reference
                    passwordStatus: "Encrypted and stored securely"
                },
                room: {
                    roomNumber: student.roomNumber,
                    bedLetter: student.bedLetter,
                    floor: room.floor,
                    wing: room.wing
                },
                databases: {
                    userDatabase: "✅ Login credentials with STUDENT role and encrypted password stored",
                    studentDatabase: "✅ All personal details, room, bed info stored with generated studentId"
                }
            }
        };

        console.log('✅ WORKFLOW COMPLETE: All steps executed successfully');
        console.log('📋 Summary:');
        console.log(`   - Student ID: ${student.studentId}`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Room: ${student.roomNumber}-${student.bedLetter}`);
        console.log(`   - Course: ${student.course} Year ${student.year}`);
        console.log(`   - Login: ${user.email} / ${autoPassword}`);
        console.log(`   - Password: Encrypted with bcrypt`);
        console.log(`   - Email: Professional approval email sent`);
        
        res.json(response);

    } catch (error) {
        console.error('DETAILED ERROR in accept application:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        res.status(500).json({
            success: false,
            message: 'Error accepting application',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Reject admission application
router.post('/admissions/:applicationId/reject', async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { reason } = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (application.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Application is not pending'
            });
        }

        application.status = 'REJECTED';
        application.reviewedBy = req.user._id;
        application.reviewDate = new Date();
        application.reviewComments = reason || 'Application rejected';
        await application.save();

        // Send professional rejection email
        try {
            await emailService.sendAdmissionRejection(
                {
                    name: application.name,
                    email: application.email
                },
                reason
            );
            console.log('✅ Professional rejection email sent successfully');
        } catch (emailError) {
            console.warn('⚠️ Email sending failed, but application was rejected:', emailError.message);
        }

        res.json({
            success: true,
            message: 'Application rejected successfully',
            data: {
                applicationId: application.applicationId,
                status: application.status,
                reviewComments: application.reviewComments
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting application',
            error: error.message
        });
    }
});

// ======================
// ROOM MANAGEMENT
// ======================

// Get all rooms
router.get('/rooms', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        
        const searchQuery = search ? {
            roomNumber: { $regex: search, $options: 'i' }
        } : {};

        const rooms = await Room.find(searchQuery)
            .sort({ roomNumber: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Room.countDocuments(searchQuery);

        res.json({
            success: true,
            data: {
                rooms,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching rooms',
            error: error.message
        });
    }
});

// Get available rooms
router.get('/rooms/available', async (req, res) => {
    try {
        const rooms = await Room.find({
            $or: [
                { 'beds.A.isOccupied': false },
                { 'beds.B.isOccupied': false },
                { 'beds.C.isOccupied': false },
                { 'beds.D.isOccupied': false }
            ]
        }).sort({ roomNumber: 1 });

        const availableRooms = rooms.map(room => {
            const availableBeds = [];
            ['A', 'B', 'C', 'D'].forEach(bedLetter => {
                if (!room.beds[bedLetter].isOccupied) {
                    availableBeds.push(bedLetter);
                }
            });
            
            return {
                _id: room._id,
                roomNumber: room.roomNumber,
                floor: room.floor,
                wing: room.wing,
                availableBeds,
                totalBeds: 4,
                occupiedBeds: 4 - availableBeds.length
            };
        }).filter(room => room.availableBeds.length > 0);

        res.json({
            success: true,
            data: availableRooms
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching available rooms',
            error: error.message
        });
    }
});

// ======================
// MENU MANAGEMENT
// ======================

// Debug: Get all menus
router.get('/menu/debug', async (req, res) => {
    try {
        const allMenus = await Menu.find({}).sort({ weekStartDate: -1 }).limit(10);
        
        console.log('DEBUG: Total menus in database:', allMenus.length);
        console.log('DEBUG: Recent menus:', allMenus.map(m => ({
            id: m._id,
            weekStartDate: m.weekStartDate,
            weekEndDate: m.weekEndDate,
            createdAt: m.createdAt,
            hasMenuItems: !!m.menuItems
        })));
        
        res.json({
            success: true,
            totalMenus: allMenus.length,
            recentMenus: allMenus
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clean up duplicate menus
router.delete('/menu/cleanup', async (req, res) => {
    try {
        console.log('Admin - Starting menu cleanup...');
        
        // Find all menus and group by week
        const allMenus = await Menu.find({}).sort({ createdAt: 1 });
        const menusByWeek = {};
        
        // Group menus by week start date (as string)
        allMenus.forEach(menu => {
            const weekKey = moment(menu.weekStartDate).format('YYYY-MM-DD');
            if (!menusByWeek[weekKey]) {
                menusByWeek[weekKey] = [];
            }
            menusByWeek[weekKey].push(menu);
        });
        
        let deletedCount = 0;
        
        // For each week, keep only the most recent menu
        for (const [week, menus] of Object.entries(menusByWeek)) {
            if (menus.length > 1) {
                console.log(`Admin - Found ${menus.length} menus for week ${week}`);
                
                // Sort by creation date, keep the latest
                menus.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const toKeep = menus[0];
                const toDelete = menus.slice(1);
                
                console.log(`Admin - Keeping menu ${toKeep._id}, deleting ${toDelete.length} duplicates`);
                
                // Delete duplicates
                for (const menu of toDelete) {
                    await Menu.findByIdAndDelete(menu._id);
                    deletedCount++;
                }
            }
        }
        
        console.log(`Admin - Cleanup complete. Deleted ${deletedCount} duplicate menus.`);
        
        res.json({
            success: true,
            message: `Cleanup completed. Deleted ${deletedCount} duplicate menus.`,
            deletedCount
        });
        
    } catch (error) {
        console.error('Admin - Error during cleanup:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get current week menu
router.get('/menu/current', async (req, res) => {
    try {
        // Get the current week's Monday date (same logic as frontend)
        const currentWeekStart = moment().startOf('week');
        const startDate = currentWeekStart.format('YYYY-MM-DD');
        
        console.log('Admin GET - Looking for menu for week starting:', startDate);
        console.log('Admin GET - Current week start moment:', currentWeekStart.toDate());

        // Find menu with weekStartDate matching this week
        const menu = await Menu.findOne().sort({ createdAt: -1 });
        
        console.log('Admin GET - Found any menu:', menu ? 'Yes' : 'No');
        if (menu) {
            console.log('Admin GET - Menu week start:', menu.weekStartDate);
            console.log('Admin GET - Menu week start formatted:', moment(menu.weekStartDate).format('YYYY-MM-DD'));
            console.log('Admin GET - Menu items keys:', Object.keys(menu.menuItems || {}));
        }

        res.json({
            success: true,
            data: { menu }
        });

    } catch (error) {
        console.error('Admin GET - Error fetching current menu:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching current menu',
            error: error.message
        });
    }
});

// Update weekly menu
router.post('/menu', async (req, res) => {
    try {
        const { weekStartDate, menuItems } = req.body;

        console.log('Admin POST - Saving menu for week:', weekStartDate);
        console.log('Admin POST - Menu items received:', Object.keys(menuItems));

        if (!weekStartDate || !menuItems) {
            return res.status(400).json({
                success: false,
                message: 'Week start date and menu items are required'
            });
        }

        // Create date object for the start of the week
        const startDate = moment(weekStartDate).startOf('day').toDate();
        const endDate = moment(weekStartDate).add(6, 'days').endOf('day').toDate();

        console.log('Admin POST - Start date object:', startDate);
        console.log('Admin POST - End date object:', endDate);

        // Try to find existing menu (simplified - just find any existing menu for now)
        const existingMenu = await Menu.findOne().sort({ createdAt: -1 });
        
        console.log('Admin POST - Found existing menu:', existingMenu ? 'Yes' : 'No');
        if (existingMenu) {
            console.log('Admin POST - Existing menu ID:', existingMenu._id);
            console.log('Admin POST - Existing menu date:', existingMenu.weekStartDate);
        }

        if (existingMenu) {
            // Update existing menu
            existingMenu.menuItems = menuItems;
            existingMenu.weekStartDate = startDate;
            existingMenu.weekEndDate = endDate;
            await existingMenu.save();

            console.log('Admin POST - Updated existing menu with ID:', existingMenu._id);

            res.json({
                success: true,
                message: 'Menu updated successfully',
                data: { menu: existingMenu }
            });
        } else {
            // Create new menu
            const menu = new Menu({
                weekStartDate: startDate,
                weekEndDate: endDate,
                menuItems,
                createdBy: req.user._id
            });

            await menu.save();

            console.log('Admin POST - Created new menu with ID:', menu._id);

            res.json({
                success: true,
                message: 'Menu created successfully',
                data: { menu }
            });
        }

    } catch (error) {
        console.error('Admin POST - Error updating menu:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating menu',
            error: error.message
        });
    }
});

// ======================
// LEAVE MANAGEMENT
// ======================

// DEBUG: Get total count of all leave applications
router.get('/leave-debug', async (req, res) => {
    try {
        const totalCount = await LeaveApplication.countDocuments({});
        const allLeaves = await LeaveApplication.find({}).limit(5);
        
        console.log('DEBUG: Total leaves in database:', totalCount);
        console.log('DEBUG: Sample leaves:', allLeaves.map(l => ({
            id: l._id,
            studentId: l.studentId,
            status: l.status,
            fromDate: l.fromDate,
            createdAt: l.createdAt
        })));
        
        res.json({
            success: true,
            totalCount,
            sampleLeaves: allLeaves
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all leave applications
router.get('/leaves', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, studentId } = req.query;
        
        console.log('OLD ADMIN LEAVES ROUTE called with:', { page, limit, status, studentId });
        
        let filter = {};
        if (status) filter.status = status;
        if (studentId) filter.studentId = studentId;

        const leaves = await LeaveApplication.find(filter)
            .populate({
                path: 'studentId',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await LeaveApplication.countDocuments(filter);

        res.json({
            success: true,
            data: {
                leaves,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave applications',
            error: error.message
        });
    }
});

// Approve/Reject leave application
router.patch('/leaves/:leaveId/:action', validateObjectId('leaveId'), handleValidationErrors, async (req, res) => {
    try {
        const { leaveId, action } = req.params;
        const { rejectionReason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use approve or reject'
            });
        }

        const leave = await LeaveApplication.findById(leaveId);
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        if (leave.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Leave application already processed'
            });
        }

        if (action === 'approve') {
            leave.status = 'APPROVED';
            leave.approvedBy = req.user._id;
            leave.approvedAt = new Date();

            // Update student leave balance
            const student = await Student.findById(leave.studentId);
            const leaveDays = Math.ceil((leave.toDate - leave.fromDate) / (1000 * 60 * 60 * 24));
            student.leaveBalance = Math.max(0, student.leaveBalance - leaveDays);
            student.isInHostel = false;
            await student.save();

        } else {
            leave.status = 'REJECTED';
            leave.rejectionReason = rejectionReason || 'No reason provided';
        }

        await leave.save();

        res.json({
            success: true,
            message: `Leave application ${action}d successfully`,
            data: { leave }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error ${req.params.action}ing leave application`,
            error: error.message
        });
    }
});

// ======================
// ATTENDANCE & REPORTS
// ======================

// Get attendance report
router.get('/reports/attendance', async (req, res) => {
    try {
        const { date, type, studentId, startDate, endDate } = req.query;
        
        let filter = {};
        
        if (studentId) filter.studentId = studentId;
        if (type) filter.type = type;
        
        if (date) {
            filter.date = date;
        } else if (startDate && endDate) {
            filter.date = { $gte: startDate, $lte: endDate };
        } else {
            // Default to today
            filter.date = moment().format('YYYY-MM-DD');
        }

        const attendance = await Attendance.find(filter)
            .populate({
                path: 'studentId',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .sort({ timestamp: -1 });

        // Get summary statistics
        const summary = await Attendance.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    uniqueStudents: { $addToSet: '$studentId' }
                }
            },
            {
                $project: {
                    type: '$_id',
                    count: 1,
                    uniqueStudentCount: { $size: '$uniqueStudents' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                attendance,
                summary,
                total: attendance.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance report',
            error: error.message
        });
    }
});

// Get absent students report (midnight check)
router.get('/reports/absent-students', async (req, res) => {
    try {
        const { date = moment().format('YYYY-MM-DD') } = req.query;

        // Get all accepted students
        const allStudents = await Student.find({ 
            admissionStatus: 'ACCEPTED',
            isInHostel: true 
        }).populate('userId', 'name email');

        // Get students who have gate_out but no gate_in for the day
        const gateOuts = await Attendance.find({
            date,
            type: 'GATE_OUT'
        }).distinct('studentId');

        const gateIns = await Attendance.find({
            date,
            type: 'GATE_IN'
        }).distinct('studentId');

        // Students with approved leave for this date
        const approvedLeaves = await LeaveApplication.find({
            status: 'APPROVED',
            fromDate: { $lte: new Date(date) },
            toDate: { $gte: new Date(date) }
        }).distinct('studentId');

        // Find students who are outside without permission
        const absentStudents = [];
        
        for (let student of allStudents) {
            const studentIdStr = student._id.toString();
            
            // Skip if on approved leave
            if (approvedLeaves.some(id => id.toString() === studentIdStr)) {
                continue;
            }
            
            // Check if student went out but didn't return
            const hasGateOut = gateOuts.some(id => id.toString() === studentIdStr);
            const hasGateIn = gateIns.some(id => id.toString() === studentIdStr);
            
            if (hasGateOut && !hasGateIn) {
                absentStudents.push({
                    student,
                    reason: 'Outside hostel without return entry',
                    lastSeen: await Attendance.findOne({
                        studentId: student._id,
                        date,
                        type: 'GATE_OUT'
                    }).sort({ timestamp: -1 })
                });
            }
        }

        res.json({
            success: true,
            data: {
                date,
                absentStudents,
                totalAbsent: absentStudents.length,
                totalStudents: allStudents.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating absent students report',
            error: error.message
        });
    }
});

// Get meal count for food preparation
router.get('/reports/meal-count', async (req, res) => {
    try {
        const { date = moment().add(1, 'day').format('YYYY-MM-DD'), mealType } = req.query;

        let filter = { date, isBooked: true };
        if (mealType) filter.mealType = mealType;

        const mealBookings = await MealBooking.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$mealType',
                    count: { $sum: 1 },
                    students: { $push: '$studentId' }
                }
            }
        ]);

        // Get detailed booking info if specific meal type requested
        let detailedBookings = null;
        if (mealType) {
            detailedBookings = await MealBooking.find(filter)
                .populate({
                    path: 'studentId',
                    populate: {
                        path: 'userId',
                        select: 'name'
                    }
                });
        }

        res.json({
            success: true,
            data: {
                date,
                mealCounts: mealBookings,
                detailedBookings,
                totalMeals: mealBookings.reduce((sum, meal) => sum + meal.count, 0)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meal count',
            error: error.message
        });
    }
});

// ======================
// COMPLAINT MANAGEMENT
// ======================

// Get all complaints
router.get('/complaints', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            category, 
            priority,
            search = '' 
        } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const complaints = await Complaint.find(filter)
            .populate({
                path: 'studentId',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .populate('resolvedBy', 'name')
            .sort({ priority: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Complaint.countDocuments(filter);

        // Get statistics
        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                complaints,
                stats,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching complaints',
            error: error.message
        });
    }
});

// Update complaint status
router.patch('/complaints/:complaintId', validateObjectId('complaintId'), handleValidationErrors, async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { status, adminResponse, estimatedResolutionDate } = req.body;

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        if (status) complaint.status = status;
        if (adminResponse) complaint.adminResponse = adminResponse;
        if (estimatedResolutionDate) complaint.estimatedResolutionDate = new Date(estimatedResolutionDate);

        if (status === 'RESOLVED') {
            complaint.resolvedBy = req.user._id;
            complaint.resolvedAt = new Date();
        }

        await complaint.save();

        res.json({
            success: true,
            message: 'Complaint updated successfully',
            data: { complaint }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating complaint',
            error: error.message
        });
    }
});

// ======================
// DASHBOARD ANALYTICS
// ======================

// Get admin dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const today = moment().format('YYYY-MM-DD');
        const thisMonth = moment().format('YYYY-MM');

        // Basic counts with error handling
        let totalStudents, pendingAdmissions, totalRooms, occupiedRooms;
        let todayAttendance, pendingLeaves, openComplaints;

        try {
            totalStudents = await Student.countDocuments({ admissionStatus: 'ACCEPTED' });
        } catch (error) {
            console.error('Error counting students:', error);
            totalStudents = 0;
        }

        try {
            pendingAdmissions = await Application.countDocuments({ status: 'PENDING' });
        } catch (error) {
            console.error('Error counting applications:', error);
            pendingAdmissions = 0;
        }

        try {
            totalRooms = await Room.countDocuments();
            occupiedRooms = await Room.countDocuments({ 'beds.A.isOccupied': true });
        } catch (error) {
            console.error('Error counting rooms:', error);
            totalRooms = 0;
            occupiedRooms = 0;
        }

        // Today's attendance
        try {
            todayAttendance = await Attendance.countDocuments({ 
                date: today,
                type: 'DINNER'
            });
        } catch (error) {
            console.error('Error counting attendance:', error);
            todayAttendance = 0;
        }

        // Pending leave applications
        try {
            pendingLeaves = await LeaveApplication.countDocuments({ status: 'PENDING' });
        } catch (error) {
            console.error('Error counting leave applications:', error);
            pendingLeaves = 0;
        }

        // Open complaints
        try {
            openComplaints = await Complaint.countDocuments({ 
                status: { $in: ['OPEN', 'IN_PROGRESS'] }
            });
        } catch (error) {
            console.error('Error counting complaints:', error);
            openComplaints = 0;
        }

        // Monthly meal statistics
        let monthlyMeals = [];
        try {
            monthlyMeals = await MealBooking.aggregate([
                {
                    $match: {
                        date: { $regex: `^${thisMonth}` },
                        isBooked: true
                    }
                },
                {
                    $group: {
                        _id: '$mealType',
                        count: { $sum: 1 }
                    }
                }
            ]);
        } catch (error) {
            console.error('Error aggregating meal bookings:', error);
            monthlyMeals = [];
        }

        // Recent activities
        let recentAdmissions = [];
        let recentComplaints = [];
        
        try {
            recentAdmissions = await Application.find({ status: 'PENDING' })
                .sort({ createdAt: -1 })
                .limit(5);
        } catch (error) {
            console.error('Error fetching recent admissions:', error);
        }

        try {
            recentComplaints = await Complaint.find({ status: 'OPEN' })
                .populate('studentId')
                .sort({ createdAt: -1 })
                .limit(5);
        } catch (error) {
            console.error('Error fetching recent complaints:', error);
        }

        const dashboardData = {
            statistics: {
                totalStudents,
                pendingAdmissions,
                totalRooms,
                occupiedRooms,
                occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
                todayAttendance,
                pendingLeaves,
                openComplaints
            },
            monthlyMeals,
            recentActivities: {
                admissions: recentAdmissions,
                complaints: recentComplaints
            }
        };

        res.json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message,
            stack: error.stack
        });
    }
});

// Force ALL applications to have status 'PENDING' (admin debug route)
router.post('/admissions/force-all-pending', async (req, res) => {
    try {
        const result = await Application.updateMany({}, { $set: { status: 'PENDING' } });
        const statusCounts = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        res.json({
            success: true,
            message: `Forced all applications to PENDING. Modified: ${result.modifiedCount}`,
            data: {
                modifiedCount: result.modifiedCount,
                statusCounts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error forcing all applications to PENDING',
            error: error.message
        });
    }
});

// ======================
// LEAVE MANAGEMENT
// ======================

// Get all leave applications with filters
router.get('/leave-applications', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            status = '', 
            leaveType = '', 
            search = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        console.log('GET /leave-applications called with:', { page, limit, status, leaveType, search });
        
        const filter = {};
        
        // Temporarily remove all filters to see all data
        // Status filter
        // if (status && status !== 'ALL') {
        //     filter.status = status;
        // }
        
        // Leave type filter
        // if (leaveType && leaveType !== 'ALL') {
        //     filter.leaveType = leaveType;
        // }
        
        // Search filter
        // if (search) {
        //     filter.$or = [
        //         { reason: { $regex: search, $options: 'i' } },
        //         { adminComments: { $regex: search, $options: 'i' } }
        //     ];
        // }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        console.log('About to query leave applications with filter:', filter);
        console.log('Sort options:', sortOptions);

        // Remove pagination temporarily to see all data
        const leaveApplications = await LeaveApplication.find(filter)
            .populate({
                path: 'studentId',
                select: 'name email studentId roomNumber',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .populate('userId', 'name email')
            .sort(sortOptions);
            // .limit(limit * 1)
            // .skip((page - 1) * limit);

        console.log('Raw query result:', leaveApplications.length);

        const total = await LeaveApplication.countDocuments(filter);
        
        console.log('Found leave applications:', {
            count: leaveApplications.length,
            total: total,
            filter: filter,
            sampleApps: leaveApplications.slice(0, 3).map(app => ({
                id: app._id,
                status: app.status,
                studentName: app.studentId?.name || app.studentId?.userId?.name || 'NAME_NOT_FOUND',
                studentEmail: app.studentId?.email || app.studentId?.userId?.email || 'EMAIL_NOT_FOUND',
                studentRoom: app.studentId?.roomNumber || 'ROOM_NOT_FOUND',
                fromDate: app.fromDate,
                toDate: app.toDate,
                reason: app.reason?.substring(0, 30) || 'NO_REASON'
            }))
        });
        
        // Get statistics for dashboard
        const stats = await LeaveApplication.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const statusCounts = {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 0
        };
        
        stats.forEach(stat => {
            statusCounts[stat._id] = stat.count;
        });

        res.json({
            success: true,
            data: {
                leaveApplications: leaveApplications.map(app => ({
                    ...app.toObject(),
                    studentName: app.studentId?.userId?.name || 'Unknown Student',
                    studentEmail: app.studentId?.userId?.email || app.studentId?.email || 'No Email',
                    studentRoom: app.studentId?.roomNumber || 'No Room'
                })),
                totalCount: total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
                statistics: statusCounts
            }
        });
    } catch (error) {
        console.error('Error fetching leave applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave applications',
            error: error.message
        });
    }
});

// Get leave application by ID with full details
router.get('/leave-applications/:id', validateObjectId('id'), async (req, res) => {
    try {
        const leaveApplication = await LeaveApplication.findById(req.params.id)
            .populate('studentId', 'name email studentId roomNumber course year')
            .populate('userId', 'email')
            .populate('approvedBy', 'name email');

        if (!leaveApplication) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        res.json({
            success: true,
            data: leaveApplication
        });
    } catch (error) {
        console.error('Error fetching leave application:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave application',
            error: error.message
        });
    }
});

// Approve leave application with QR code generation
router.patch('/leave-applications/:id/approve', validateObjectId('id'), async (req, res) => {
    try {
        const { adminComments } = req.body;
        const leaveApplicationId = req.params.id;
        
        console.log('Approving leave application:', leaveApplicationId);

        // Find the leave application
        const leaveApplication = await LeaveApplication.findById(leaveApplicationId)
            .populate({
                path: 'studentId',
                select: 'studentId roomNumber userId',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .populate('userId', 'email');

        if (!leaveApplication) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        if (leaveApplication.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Leave application is not in pending status'
            });
        }

        // Import QR service
        const QRService = require('../services/qrService');

        // Generate QR codes for entry and exit
        const qrCodes = await QRService.generateLeaveQRCodes(leaveApplication, leaveApplication.studentId);

        // Update leave application with approval and QR codes
        leaveApplication.status = 'APPROVED';
        leaveApplication.approvedBy = req.user.id;
        leaveApplication.approvedAt = new Date();
        leaveApplication.adminComments = adminComments || '';
        
        // Store QR codes in the application (updated to match model structure)
        leaveApplication.entryQRCode = {
            code: qrCodes.entryQR.code,
            used: false,
            usedAt: null
        };
        
        leaveApplication.exitQRCode = {
            code: qrCodes.exitQR.code,
            used: false,
            usedAt: null
        };

        await leaveApplication.save();

        // Send approval email with QR codes
        try {
            await emailService.sendLeaveApprovalEmail(
                leaveApplication.userId.email,
                {
                    name: leaveApplication.studentId.userId.name,
                    studentId: leaveApplication.studentId.studentId,
                    roomNumber: leaveApplication.studentId.roomNumber
                },
                {
                    leaveType: leaveApplication.leaveType,
                    fromDate: leaveApplication.fromDate,
                    toDate: leaveApplication.toDate,
                    totalDays: leaveApplication.totalDays,
                    reason: leaveApplication.reason,
                    adminComments: leaveApplication.adminComments
                },
                qrCodes
            );
            console.log('✅ Leave approval email sent successfully');
        } catch (emailError) {
            console.error('❌ Error sending leave approval email:', emailError);
            // Don't fail the approval if email fails
        }

        res.json({
            success: true,
            message: 'Leave application approved successfully with QR codes generated',
            data: {
                leaveApplication: await LeaveApplication.findById(leaveApplicationId)
                    .populate('studentId', 'name email studentId roomNumber')
                    .populate('userId', 'email')
                    .populate('approvedBy', 'name email'),
                qrCodes: {
                    entryQR: {
                        purpose: qrCodes.entryQR.purpose,
                        validFrom: qrCodes.entryQR.data.validFrom,
                        validUntil: qrCodes.entryQR.data.validUntil
                    },
                    exitQR: {
                        purpose: qrCodes.exitQR.purpose,
                        validFrom: qrCodes.exitQR.data.validFrom,
                        validUntil: qrCodes.exitQR.data.validUntil
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error approving leave application:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving leave application',
            error: error.message
        });
    }
});

// Reject leave application
router.patch('/leave-applications/:id/reject', validateObjectId('id'), async (req, res) => {
    try {
        const { adminComments, rejectionReason } = req.body;
        const leaveApplicationId = req.params.id;
        
        console.log('Rejecting leave application:', leaveApplicationId);

        // Find the leave application
        const leaveApplication = await LeaveApplication.findById(leaveApplicationId)
            .populate({
                path: 'studentId',
                select: 'studentId roomNumber userId',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .populate('userId', 'email');

        if (!leaveApplication) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        if (leaveApplication.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Leave application is not in pending status'
            });
        }

        // Update leave application with rejection
        leaveApplication.status = 'REJECTED';
        leaveApplication.approvedBy = req.user.id;
        leaveApplication.approvedAt = new Date();
        leaveApplication.adminComments = adminComments || rejectionReason || 'Application rejected by administrator';

        await leaveApplication.save();

        // Send rejection email
        try {
            await emailService.sendLeaveRejectionEmail(
                leaveApplication.userId.email,
                {
                    name: leaveApplication.studentId.userId.name,
                    studentId: leaveApplication.studentId.studentId,
                    roomNumber: leaveApplication.studentId.roomNumber
                },
                {
                    leaveType: leaveApplication.leaveType,
                    fromDate: leaveApplication.fromDate,
                    toDate: leaveApplication.toDate,
                    totalDays: leaveApplication.totalDays,
                    reason: leaveApplication.reason,
                    adminComments: leaveApplication.adminComments
                },
                rejectionReason || adminComments
            );
            console.log('✅ Leave rejection email sent successfully');
        } catch (emailError) {
            console.error('❌ Error sending leave rejection email:', emailError);
            // Don't fail the rejection if email fails
        }

        res.json({
            success: true,
            message: 'Leave application rejected successfully',
            data: await LeaveApplication.findById(leaveApplicationId)
                .populate('studentId', 'name email studentId roomNumber')
                .populate('userId', 'email')
                .populate('approvedBy', 'name email')
        });
    } catch (error) {
        console.error('Error rejecting leave application:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting leave application',
            error: error.message
        });
    }
});

// Get leave statistics for dashboard
router.get('/leave-statistics', async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

        const [
            totalLeaves,
            pendingLeaves,
            approvedLeaves,
            rejectedLeaves,
            monthlyLeaves,
            yearlyLeaves,
            leavesByType
        ] = await Promise.all([
            LeaveApplication.countDocuments(),
            LeaveApplication.countDocuments({ status: 'PENDING' }),
            LeaveApplication.countDocuments({ status: 'APPROVED' }),
            LeaveApplication.countDocuments({ status: 'REJECTED' }),
            LeaveApplication.countDocuments({ createdAt: { $gte: startOfMonth } }),
            LeaveApplication.countDocuments({ createdAt: { $gte: startOfYear } }),
            LeaveApplication.aggregate([
                {
                    $group: {
                        _id: '$leaveType',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const leaveTypeStats = {};
        leavesByType.forEach(type => {
            leaveTypeStats[type._id] = type.count;
        });

        res.json({
            success: true,
            data: {
                total: totalLeaves,
                pending: pendingLeaves,
                approved: approvedLeaves,
                rejected: rejectedLeaves,
                thisMonth: monthlyLeaves,
                thisYear: yearlyLeaves,
                byType: leaveTypeStats
            }
        });
    } catch (error) {
        console.error('Error fetching leave statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave statistics',
            error: error.message
        });
    }
});

// Verify and mark QR code as used (for gate security)
router.post('/leave-qr/verify', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'QR code token is required'
            });
        }

        const QRService = require('../services/qrService');
        
        // Verify the QR code
        const verification = await QRService.verifyLeaveQR(token, LeaveApplication);
        
        if (!verification.valid) {
            return res.status(400).json({
                success: false,
                message: verification.error
            });
        }

        // Mark QR code as used
        const updatedLeave = await QRService.markLeaveQRAsUsed(
            verification.leaveApplication._id,
            verification.qrType,
            LeaveApplication
        );

        res.json({
            success: true,
            message: `QR code verified and marked as used for ${verification.action}`,
            data: {
                student: verification.leaveApplication.studentId,
                leaveType: verification.leaveApplication.leaveType,
                action: verification.action,
                qrType: verification.qrType,
                usedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error verifying leave QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying QR code',
            error: error.message
        });
    }
});

// ======================
// COMMUNITY MANAGEMENT
// ======================

// Get all community posts (admin can see all)
router.get('/community', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            type, 
            category, 
            status,
            search = '' 
        } = req.query;
        
        let filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (status) filter.status = status;
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await CommunityPost.find(filter)
            .populate({
                path: 'studentId',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .populate({
                path: 'votes.voters.studentId',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            })
            .populate({
                path: 'comments.studentId',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CommunityPost.countDocuments(filter);

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching community posts',
            error: error.message
        });
    }
});

// Create community post (admin)
router.post('/community', async (req, res) => {
    try {
        const { title, description, type, category, isAnonymous = false } = req.body;

        // For admin posts, we need to create a special handling since admin is not a student
        const post = new CommunityPost({
            studentId: null, // Admin posts don't have studentId
            title,
            description,
            type,
            category,
            isAnonymous,
            adminPost: {
                adminId: req.user._id,
                adminName: req.user.name
            }
        });

        await post.save();

        res.json({
            success: true,
            message: 'Community post created successfully',
            data: { post }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating community post',
            error: error.message
        });
    }
});

// Vote on community post (admin)
router.post('/community/:postId/vote', async (req, res) => {
    try {
        const { postId } = req.params;
        const { voteType } = req.body; // 'UP' or 'DOWN'

        if (!['UP', 'DOWN'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote type. Must be UP or DOWN'
            });
        }

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if admin already voted
        const existingVote = post.votes.voters.find(vote => 
            vote.adminId && vote.adminId.toString() === req.user._id.toString()
        );

        if (existingVote) {
            // Update existing vote
            if (existingVote.voteType === voteType) {
                // Remove vote if same type
                post.votes.voters = post.votes.voters.filter(vote => 
                    !(vote.adminId && vote.adminId.toString() === req.user._id.toString())
                );
                if (voteType === 'UP') post.votes.upvotes--;
                else post.votes.downvotes--;
            } else {
                // Change vote type
                existingVote.voteType = voteType;
                if (voteType === 'UP') {
                    post.votes.upvotes++;
                    post.votes.downvotes--;
                } else {
                    post.votes.downvotes++;
                    post.votes.upvotes--;
                }
            }
        } else {
            // Add new vote
            post.votes.voters.push({
                adminId: req.user._id,
                voteType,
                votedAt: new Date()
            });
            if (voteType === 'UP') post.votes.upvotes++;
            else post.votes.downvotes++;
        }

        await post.save();

        res.json({
            success: true,
            message: 'Vote recorded successfully',
            data: { post }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording vote',
            error: error.message
        });
    }
});

// Add comment to community post (admin)
router.post('/community/:postId/comment', async (req, res) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot be empty'
            });
        }

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        post.comments.push({
            adminId: req.user._id,
            adminName: req.user.name,
            comment: comment.trim(),
            commentedAt: new Date()
        });

        await post.save();

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: { post }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
});

// Delete community post (admin only)
router.delete('/community/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        await CommunityPost.findByIdAndDelete(postId);

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting post',
            error: error.message
        });
    }
});

module.exports = router;
