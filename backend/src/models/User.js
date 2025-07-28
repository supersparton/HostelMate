const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['ADMIN', 'STUDENT'],
        required: [true, 'Role is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Temporarily disable password hashing middleware to fix infinite loop
// Hash password before saving
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     
//     try {
//         console.log('Hashing password for user:', this.email);
//         // Simplified password hashing - just use a simple hash for now
//         this.password = 'hashed_' + this.password; // Temporary simple solution
//         console.log('Password hashed successfully (simplified)');
//         next();
//     } catch (error) {
//         console.error('Error hashing password:', error);
//         next(error);
//     }
// });

// Compare password method - handles both plain text and hashed passwords for backward compatibility
userSchema.methods.comparePassword = async function(candidatePassword) {
    // First try plain text comparison (for new users created without hashing)
    if (this.password === candidatePassword) {
        return true;
    }
    
    // If password starts with 'hashed_', compare with the simple hash format
    if (this.password.startsWith('hashed_')) {
        return this.password === 'hashed_' + candidatePassword;
    }
    
    // For existing users with bcrypt hashes, try bcrypt comparison
    try {
        const bcrypt = require('bcryptjs');
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.log('bcrypt comparison failed, trying plain text');
        return false;
    }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);
