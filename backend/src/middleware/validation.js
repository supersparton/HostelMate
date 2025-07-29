const { validationResult, body, param, query } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Common validation rules
const validateRegistration = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('phone')
        .matches(/^[0-9]{10}$/)
        .withMessage('Please provide a valid 10-digit phone number'),
    
    body('caste')
        .trim()
        .notEmpty()
        .withMessage('Caste is required'),
    
    body('religion')
        .trim()
        .notEmpty()
        .withMessage('Religion is required'),
    
    body('income')
        .isNumeric()
        .withMessage('Income must be a number')
        .isFloat({ min: 0 })
        .withMessage('Income cannot be negative'),
    
    body('parentName')
        .trim()
        .notEmpty()
        .withMessage('Parent name is required'),
    
    body('parentPhone')
        .matches(/^[0-9]{10}$/)
        .withMessage('Please provide a valid 10-digit parent phone number'),
    
    body('course')
        .trim()
        .notEmpty()
        .withMessage('Course is required'),
    
    body('year')
        .isInt({ min: 1, max: 4 })
        .withMessage('Academic year must be between 1 and 4'),
    
    body('rollNumber')
        .trim()
        .notEmpty()
        .withMessage('Roll number is required'),
    
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required')
        .isLength({ min: 1, max: 500 })
        .withMessage('Address must be between 10 and 500 characters'),
    
    body('emergencyContact')
        .matches(/^[0-9]{10}$/)
        .withMessage('Please provide a valid 10-digit emergency contact number')
];

const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const validateLeaveApplication = [
    body('leaveType')
        .isIn(['HOME_VISIT', 'MEDICAL', 'EMERGENCY', 'PERSONAL', 'FESTIVAL', 'ACADEMIC', 'OTHER'])
        .withMessage('Invalid leave type'),
    
    body('fromDate')
        .isISO8601()
        .withMessage('Please provide a valid start date'),
    
    body('toDate')
        .isISO8601()
        .withMessage('Please provide a valid end date'),
    
    body('reason')
        .trim()
        .notEmpty()
        .withMessage('Reason is required')
        .isLength({ max: 500 })
        .withMessage('Reason cannot exceed 500 characters')
];

const validateComplaint = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Complaint title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    
    body('category')
        .isIn(['MAINTENANCE', 'FOOD', 'CLEANLINESS', 'SECURITY', 'FACILITIES', 'OTHER'])
        .withMessage('Invalid complaint category')
];

const validateCommunityPost = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Post title is required')
        .isLength({ max: 150 })
        .withMessage('Title cannot exceed 150 characters'),
    
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),
    
    body('type')
        .isIn(['SUGGESTION', 'PROBLEM', 'SOLUTION', 'DISCUSSION'])
        .withMessage('Invalid post type'),
    
    body('category')
        .isIn(['FOOD', 'FACILITIES', 'RULES', 'EVENTS', 'MAINTENANCE', 'GENERAL'])
        .withMessage('Invalid post category')
];

const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName}`)
];

const validateDateRange = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),
    
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format')
];

module.exports = {
    handleValidationErrors,
    validateRegistration,
    validateLogin,
    validateLeaveApplication,
    validateComplaint,
    validateCommunityPost,
    validateObjectId,
    validateDateRange
};
