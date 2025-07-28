const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Application = require('../models/Application');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
    
    return { accessToken, refreshToken };
};

// Register new student
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
    try {
        const {
            name, email, phone, password, caste, religion, income,
            parentName, parentPhone, course, year, rollNumber,
            address, emergencyContact
        } = req.body;

        // Check if application already exists
        const existingApplication = await Application.findOne({ email });
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'Application already submitted with this email'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create application
        const application = new Application({
            name,
            email,
            phone,
            caste,
            religion,
            income,
            parentName,
            parentPhone,
            course,
            year,
            rollNumber,
            address,
            emergencyContact
        });

        await application.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully. You will be notified once reviewed.',
            data: {
                applicationId: application.applicationId,
                status: application.status,
                applicationDate: application.applicationDate
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Application submission failed',
            error: error.message
        });
    }
});

// Login
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // For students, check admission status
        let studentData = null;
        if (user.role === 'STUDENT') {
            studentData = await Student.findOne({ userId: user._id });
            if (!studentData || studentData.admissionStatus !== 'ACCEPTED') {
                return res.status(401).json({
                    success: false,
                    message: 'Your admission is still pending or has been rejected'
                });
            }
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                student: studentData,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Check if user still exists and is active
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        res.json({
            success: true,
            data: { tokens }
        });

    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        let studentData = null;

        // If user is a student, get student data
        if (user.role === 'STUDENT') {
            studentData = await Student.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                student: studentData
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
});

// Check admission status
router.get('/admission-status/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const user = await User.findOne({ email });
        if (!user || user.role !== 'STUDENT') {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const student = await Student.findOne({ userId: user._id });
        
        res.json({
            success: true,
            data: {
                studentId: student.studentId,
                admissionStatus: student.admissionStatus,
                roomNumber: student.roomNumber,
                bedLetter: student.bedLetter
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking admission status',
            error: error.message
        });
    }
});

// Create test admin user (for development only)
router.post('/create-test-admin', async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@hostelmate.local' });
        if (existingAdmin) {
            return res.json({
                success: true,
                message: 'Test admin already exists',
                data: {
                    email: 'admin@hostelmate.local',
                    password: 'admin123',
                    name: existingAdmin.name,
                    role: existingAdmin.role
                }
            });
        }

        // Create admin user
        const admin = new User({
            name: 'Test Admin',
            email: 'admin@hostelmate.local',
            phone: '9999999999',
            password: 'admin123',
            role: 'ADMIN',
            isActive: true
        });

        await admin.save();

        res.json({
            success: true,
            message: 'Test admin created successfully',
            data: {
                email: 'admin@hostelmate.local',
                password: 'admin123',
                name: admin.name,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Error creating test admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating test admin',
            error: error.message
        });
    }
});

module.exports = router;
