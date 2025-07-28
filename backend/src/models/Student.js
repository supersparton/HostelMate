const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentId: {
        type: String,
        unique: true,
        required: true
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
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    
    // Hostel Information
    roomNumber: {
        type: String,
        match: [/^[1-9][0-9]{0,2}$/, 'Invalid room number'], // 1-200
        default: null
    },
    bedLetter: {
        type: String,
        enum: ['A', 'B', 'C', 'D', null],
        default: null
    },
    admissionStatus: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    },
    admissionDate: {
        type: Date
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
    
    // Hostel Management
    leaveBalance: {
        type: Number,
        default: 30 // 30 days per year
    },
    isInHostel: {
        type: Boolean,
        default: true
    },
    
    // QR Code for attendance
    qrCode: {
        type: String,
        unique: true
    },
    
    // Fee Information
    feesPaid: {
        type: Boolean,
        default: false
    },
    feeAmount: {
        type: Number,
        default: 0
    },
    
    // Emergency Contact
    emergencyContact: {
        type: String,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit emergency contact number']
    }
}, {
    timestamps: true
});

// Generate student ID
studentSchema.pre('save', async function(next) {
    if (!this.studentId) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Student').countDocuments();
        this.studentId = `HM${year}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Generate QR code data
studentSchema.pre('save', function(next) {
    if (!this.qrCode) {
        this.qrCode = `${this.studentId}_${Date.now()}`;
    }
    next();
});

module.exports = mongoose.model('Student', studentSchema);
