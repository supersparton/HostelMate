const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        return res.status(403).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Check if user is student
const requireStudent = (req, res, next) => {
    if (req.user.role !== 'STUDENT') {
        return res.status(403).json({
            success: false,
            message: 'Student access required'
        });
    }
    next();
};

// Check if user can access student data (admin or same student)
const canAccessStudentData = async (req, res, next) => {
    try {
        const requestedStudentId = req.params.studentId || req.body.studentId;
        
        // Admin can access any student data
        if (req.user.role === 'ADMIN') {
            return next();
        }
        
        // Student can only access their own data
        if (req.user.role === 'STUDENT') {
            const Student = require('../models/Student');
            const student = await Student.findOne({ userId: req.user._id });
            
            if (!student || student._id.toString() !== requestedStudentId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to this student data'
                });
            }
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking access permissions'
        });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireStudent,
    canAccessStudentData
};
