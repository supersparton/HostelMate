const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^[1-9][0-9]{0,2}$/, 'Invalid room number'] // 1-200
    },
    floor: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    wing: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: true
    },
    beds: {
        A: {
            isOccupied: { type: Boolean, default: false },
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }
        },
        B: {
            isOccupied: { type: Boolean, default: false },
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }
        },
        C: {
            isOccupied: { type: Boolean, default: false },
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }
        },
        D: {
            isOccupied: { type: Boolean, default: false },
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }
        }
    },
    facilities: {
        hasAC: { type: Boolean, default: false },
        hasAttachedBathroom: { type: Boolean, default: true },
        hasBalcony: { type: Boolean, default: false },
        hasFurniture: { type: Boolean, default: true }
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'BLOCKED'],
        default: 'AVAILABLE'
    },
    rent: {
        type: Number,
        required: true,
        default: 5000
    },
    lastMaintenance: {
        type: Date
    },
    maintenanceScheduled: {
        type: Date
    }
}, {
    timestamps: true
});

// Calculate available beds
roomSchema.virtual('availableBeds').get(function() {
    const beds = ['A', 'B', 'C', 'D'];
    return beds.filter(bed => !this.beds[bed].isOccupied);
});

// Calculate occupancy count
roomSchema.virtual('occupancyCount').get(function() {
    const beds = ['A', 'B', 'C', 'D'];
    return beds.filter(bed => this.beds[bed].isOccupied).length;
});

// Update room status based on occupancy
roomSchema.pre('save', function(next) {
    const occupiedBeds = this.occupancyCount;
    if (occupiedBeds === 0) {
        this.status = 'AVAILABLE';
    } else if (occupiedBeds === 4) {
        this.status = 'OCCUPIED';
    }
    next();
});

// Ensure virtual fields are included in JSON output
roomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);
