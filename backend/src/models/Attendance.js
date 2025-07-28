const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    type: {
        type: String,
        enum: ['DINNER', 'GATE_IN', 'GATE_OUT'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    date: {
        type: String, // YYYY-MM-DD format for easy querying
        required: true
    },
    qrCodeUsed: {
        type: String,
        required: true
    },
    location: {
        type: String,
        enum: ['MESS_HALL', 'MAIN_GATE', 'BACK_GATE'],
        default: 'MAIN_GATE'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index for efficient querying
attendanceSchema.index({ studentId: 1, date: 1, type: 1 });
attendanceSchema.index({ date: 1, type: 1 });

// Pre-save middleware to set date
attendanceSchema.pre('save', function(next) {
    if (!this.date) {
        this.date = this.timestamp.toISOString().split('T')[0];
    }
    next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
