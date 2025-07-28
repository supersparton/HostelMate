const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const publicRoutes = require('./routes/public');
const studentApplicationRoutes = require('./routes/studentApplications');

// Import services
const RoomService = require('./services/roomService');
const emailService = require('./services/emailService');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
async function connectDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB Atlas');
        
        // Initialize services after successful connection
        await initializeServices();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('💡 Please check your MongoDB Atlas connection string in .env file');
        process.exit(1);
    }
}

// Initialize database connection
connectDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', studentApplicationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global Error:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Initialize all services
async function initializeServices() {
    try {
        console.log('🚀 Initializing HostelMate services...');
        
        // Create default admin user
        await createDefaultAdmin();
        
        // Initialize hostel rooms
        await RoomService.initializeRooms();
        
        // Test email service
        await emailService.testConnection();
        
        console.log('✅ All services initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing services:', error);
    }
}

// Create default admin user
async function createDefaultAdmin() {
    try {
        const User = require('./models/User');
        const existingAdmin = await User.findOne({ role: 'ADMIN' });
        
        if (!existingAdmin) {
            await User.create({
                name: 'System Administrator',
                email: process.env.ADMIN_EMAIL,
                phone: '1234567890',
                role: 'ADMIN',
                password: process.env.ADMIN_PASSWORD, // Let the model middleware hash it
                isActive: true
            });
            
            console.log('✅ Default admin user created');
            console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL}`);
            console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD}`);
        }
    } catch (error) {
        console.error('❌ Error creating default admin:', error.message);
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 HostelMate Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
