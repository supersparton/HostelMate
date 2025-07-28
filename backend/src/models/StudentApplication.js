const mongoose = require('mongoose');

const studentApplicationSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    
    // Personal Information
    caste: {
        type: String,
        required: true
    },
    religion: {
        type: String,
        required: true
    },
    income: {
        type: Number,
        required: true,
        min: 0
    },
    parentName: {
        type: String,
        required: true
    },
    parentPhone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    address: {
        type: String,
        required: true
    },
    emergencyContact: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    
    // Academic Information
    course: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    rollNumber: {
        type: String,
        required: true
    },
    
    // Application Status - SIMPLIFIED
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
        required: true
    },
    
    // Metadata
    applicationId: {
        type: String,
        unique: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    reviewComments: {
        type: String
    }
}, {
    timestamps: true
});

// Auto-generate application ID
studentApplicationSchema.pre('save', async function(next) {
    if (!this.applicationId) {
        const count = await mongoose.model('StudentApplication').countDocuments();
        this.applicationId = `APP${Date.now()}${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('StudentApplication', studentApplicationSchema);
