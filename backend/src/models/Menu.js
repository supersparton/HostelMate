const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    weekStartDate: {
        type: Date,
        required: true,
        unique: true
    },
    weekEndDate: {
        type: Date,
        required: true
    },
    menuItems: {
        monday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' }
        },
        tuesday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' }
        },
        wednesday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' }
        },
        thursday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' }
        },
        friday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' }
        },
        saturday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' }
        },
        sunday: {
            breakfast: { type: String, default: '' },
            lunch: { type: String, default: '' },
            dinner: { type: String, default: '' }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Ensure only one active menu per week
menuSchema.index({ weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('Menu', menuSchema);
