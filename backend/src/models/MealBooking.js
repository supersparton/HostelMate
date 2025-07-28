const mongoose = require('mongoose');

const mealBookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD format
        required: true
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true
    },
    isBooked: {
        type: Boolean,
        default: true
    },
    isConsumed: {
        type: Boolean,
        default: false
    },
    consumedAt: {
        type: Date
    },
    bookingTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure one booking per student per meal per day
mealBookingSchema.index({ studentId: 1, date: 1, mealType: 1 }, { unique: true });

// Index for efficient date-based queries
mealBookingSchema.index({ date: 1, mealType: 1 });

module.exports = mongoose.model('MealBooking', mealBookingSchema);
