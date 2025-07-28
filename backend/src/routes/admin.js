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
router.get('/students', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '',
            roomNumber,
            course,
            year 
        } = req.query;
        
        // Base filter: Only show currently enrolled students
        let filter = {
            admissionStatus: 'ACCEPTED', // Only accepted students
            // Optionally add: isActive: true if you have this field
        };
        
        // Additional filters
        if (roomNumber) filter.roomNumber = roomNumber;
        if (course) filter.course = { $regex: course, $options: 'i' };
        if (year) filter.year = parseInt(year);
        
        if (search) {
            filter.$or = [
                { studentId: { $regex: search, $options: 'i' } },
                { course: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('Fetching currently enrolled students with filter:', filter);

        const students = await Student.find(filter)
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Student.countDocuments(filter);

        console.log(`Found ${students.length} currently enrolled students out of ${total} total`);
        console.log('Sample found students:', students.slice(0, 2).map(s => ({
            id: s._id,
            studentId: s.studentId,
            admissionStatus: s.admissionStatus,
            name: s.userId?.name,
            room: s.roomNumber,
            bed: s.bedLetter
        })));
        
        // Double check - count all students with ACCEPTED status regardless of filter
        const allAcceptedCount = await Student.countDocuments({ admissionStatus: 'ACCEPTED' });
        console.log('Total ACCEPTED students in database (ignoring filters):', allAcceptedCount);

        res.json({
            success: true,
            message: `Currently enrolled students (${total} total)`,
            data: {
                students,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                },
                enrollmentStatus: 'ACCEPTED_ONLY'
            }
        });

    } catch (error) {
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

        const response = {
            success: true,
            message: 'Application approved successfully! Complete workflow executed.',
            data: {
                workflow: {
                    step1: "✅ User account created with encrypted password",
                    step2: "✅ Student profile created with all details",
                    step3: "✅ Room bed assigned",
                    step4: "✅ Application marked as approved"
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

// Get current week menu
router.get('/menu/current', async (req, res) => {
    try {
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();

        const menu = await Menu.findOne({
            weekStartDate: { $gte: startOfWeek, $lte: endOfWeek }
        }).populate('createdBy', 'name');

        res.json({
            success: true,
            data: { menu }
        });

    } catch (error) {
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

        if (!weekStartDate || !menuItems) {
            return res.status(400).json({
                success: false,
                message: 'Week start date and menu items are required'
            });
        }

        const startDate = new Date(weekStartDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        // Check if menu already exists for this week
        const existingMenu = await Menu.findOne({ weekStartDate: startDate });
        
        if (existingMenu) {
            // Update existing menu
            existingMenu.menuItems = menuItems;
            existingMenu.weekEndDate = endDate;
            await existingMenu.save();

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

            res.json({
                success: true,
                message: 'Menu created successfully',
                data: { menu }
            });
        }

    } catch (error) {
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

// Get all leave applications
router.get('/leaves', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, studentId } = req.query;
        
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

        // Debug: Check database connection and models
        console.log('Dashboard route called - checking database...');

        // Basic counts with error handling
        let totalStudents, pendingAdmissions, totalRooms, occupiedRooms;
        let todayAttendance, pendingLeaves, openComplaints;

        try {
            totalStudents = await Student.countDocuments({ admissionStatus: 'ACCEPTED' });
            console.log('Total students:', totalStudents);
        } catch (error) {
            console.error('Error counting students:', error);
            totalStudents = 0;
        }

        try {
            pendingAdmissions = await Application.countDocuments({ status: 'PENDING' });
            console.log('Pending admissions:', pendingAdmissions);
            
            // Debug: Get all applications to see what's in the database
            const allApplications = await Application.find({}).limit(5);
            console.log('Sample applications:', allApplications.map(app => ({
                id: app._id,
                name: app.name,
                email: app.email,
                status: app.status,
                createdAt: app.createdAt
            })));
        } catch (error) {
            console.error('Error counting applications:', error);
            pendingAdmissions = 0;
        }

        try {
            totalRooms = await Room.countDocuments();
            occupiedRooms = await Room.countDocuments({ 'beds.A.isOccupied': true });
            console.log('Rooms - Total:', totalRooms, 'Occupied:', occupiedRooms);
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

        console.log('Dashboard response:', JSON.stringify(dashboardData, null, 2));

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

module.exports = router;
