


const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['HOME_VISIT', 'MEDICAL', 'EMERGENCY', 'PERSONAL', 'FESTIVAL', 'ACADEMIC', 'FAMILY_FUNCTION', 'OTHER'],
        required: true,
        default: 'PERSONAL'
    },
    fromDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    toDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    adminComments: {
        type: String,
        trim: true,
        maxlength: [300, 'Admin comments cannot exceed 300 characters']
    },
    // QR Code fields for entry and exit
    entryQRCode: {
        code: String,
        used: { type: Boolean, default: false },
        usedAt: Date
    },
    exitQRCode: {
        code: String,
        used: { type: Boolean, default: false },
        usedAt: Date
    },
    actualReturnDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Validation to ensure fromDate is before toDate
leaveApplicationSchema.pre('save', function(next) {
    if (this.fromDate >= this.toDate) {
        return next(new Error('End date must be after start date'));
    }
    next();
});

// Calculate leave duration (total days)
leaveApplicationSchema.virtual('totalDays').get(function() {
    if (this.fromDate && this.toDate) {
        const diffTime = Math.abs(this.toDate - this.fromDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        return diffDays;
    }
    return 0;
});

// Legacy virtual for backward compatibility
leaveApplicationSchema.virtual('duration').get(function() {
    return this.totalDays;
});

// Ensure virtual fields are included in JSON output
leaveApplicationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
