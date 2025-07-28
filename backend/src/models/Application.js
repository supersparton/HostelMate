

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicationId: {
        type: String,
        unique: true
    },
    // Basic Information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    
    // Personal Information
    caste: {
        type: String,
        required: [true, 'Caste is required'],
        trim: true
    },
    religion: {
        type: String,
        required: [true, 'Religion is required'],
        trim: true
    },
    income: {
        type: Number,
        required: [true, 'Family income is required'],
        min: [0, 'Income cannot be negative']
    },
    parentName: {
        type: String,
        required: [true, 'Parent name is required'],
        trim: true
    },
    parentPhone: {
        type: String,
        required: [true, 'Parent phone is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    emergencyContact: {
        type: String,
        required: [true, 'Emergency contact is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit emergency contact number']
    },
    
    // Academic Information
    course: {
        type: String,
        required: [true, 'Course is required']
    },
    year: {
        type: Number,
        required: [true, 'Academic year is required'],
        min: 1,
        max: 4
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required']
    },
    
    // Application Status
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin who reviewed
    },
    reviewDate: {
        type: Date
    },
    reviewComments: {
        type: String
    }
}, {
    timestamps: true
});

// Generate application ID with proper uniqueness handling
applicationSchema.pre('save', async function(next) {
    if (!this.applicationId) {
        const year = new Date().getFullYear();
        let applicationId;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            // Get the count of existing applications for this year
            const existingCount = await mongoose.model('Application').countDocuments({
                applicationId: { $regex: `^APP${year}` }
            });
            
            // Generate ID with sequential numbering plus some randomness to avoid conflicts
            const sequentialNumber = existingCount + 1 + attempts;
            applicationId = `APP${year}${String(sequentialNumber).padStart(4, '0')}`;
            
            // Check if this ID already exists
            const existingApp = await mongoose.model('Application').findOne({ applicationId });
            
            if (!existingApp) {
                isUnique = true;
                this.applicationId = applicationId;
            } else {
                attempts++;
                console.log(`ApplicationId ${applicationId} already exists, trying attempt ${attempts + 1}`);
            }
        }

        if (!isUnique) {
            // Fallback to timestamp-based ID if we can't generate a sequential one
            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            this.applicationId = `APP${year}${timestamp.toString().slice(-4)}${randomSuffix}`;
            console.log(`Fallback to timestamp-based ID: ${this.applicationId}`);
        }
    }
    next();
});

module.exports = mongoose.model('Application', applicationSchema);
