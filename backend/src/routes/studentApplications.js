const express = require('express');
const StudentApplication = require('../models/StudentApplication');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Apply authentication and admin authorization
router.use(authenticateToken, requireAdmin);

// ======================
// STUDENT APPLICATION MANAGEMENT - CLEAN IMPLEMENTATION
// ======================

// GET all pending applications
router.get('/applications/pending', async (req, res) => {
    try {
        console.log('=== GET /applications/pending called ===');
        
        const applications = await StudentApplication.find({ status: 'PENDING' })
            .sort({ submittedAt: -1 })
            .limit(100);
            
        console.log(`Found ${applications.length} pending applications`);
        
        if (applications.length > 0) {
            console.log('Sample applications:', applications.slice(0, 2).map(app => ({
                id: app._id,
                name: app.name,
                status: app.status,
                submittedAt: app.submittedAt
            })));
        }
        
        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
        
    } catch (error) {
        console.error('Error fetching pending applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending applications',
            error: error.message
        });
    }
});

// GET all applications (for debugging)
router.get('/applications/all', async (req, res) => {
    try {
        console.log('=== GET /applications/all called ===');
        
        const applications = await StudentApplication.find({})
            .sort({ submittedAt: -1 })
            .limit(100);
            
        const statusCounts = await StudentApplication.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        console.log(`Total applications: ${applications.length}`);
        console.log('Status counts:', statusCounts);
        
        res.json({
            success: true,
            total: applications.length,
            statusCounts,
            data: applications
        });
        
    } catch (error) {
        console.error('Error fetching all applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
});

// POST create test application
router.post('/applications/create-test', async (req, res) => {
    try {
        console.log('=== POST /applications/create-test called ===');
        
        const timestamp = Date.now();
        const testApp = new StudentApplication({
            name: `Test Student ${timestamp.toString().slice(-4)}`,
            email: `test${timestamp}@test.com`,
            phone: '9876543210',
            caste: 'General',
            religion: 'Hindu',
            income: 50000,
            parentName: 'Test Parent',
            parentPhone: '9876543211',
            address: 'Test Address',
            emergencyContact: '9876543212',
            course: 'Computer Science',
            year: 1,
            rollNumber: `CS${timestamp.toString().slice(-6)}`,
            status: 'PENDING'
        });
        
        const saved = await testApp.save();
        console.log('Created test application:', {
            id: saved._id,
            name: saved.name,
            status: saved.status
        });
        
        res.json({
            success: true,
            message: 'Test application created',
            data: saved
        });
        
    } catch (error) {
        console.error('Error creating test application:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating test application',
            error: error.message
        });
    }
});

// POST force all to pending
router.post('/applications/force-pending', async (req, res) => {
    try {
        console.log('=== POST /applications/force-pending called ===');
        
        const result = await StudentApplication.updateMany(
            {},
            { $set: { status: 'PENDING' } }
        );
        
        const statusCounts = await StudentApplication.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        console.log(`Updated ${result.modifiedCount} applications to PENDING`);
        console.log('New status counts:', statusCounts);
        
        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} applications to PENDING`,
            modifiedCount: result.modifiedCount,
            statusCounts
        });
        
    } catch (error) {
        console.error('Error forcing applications to pending:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating applications',
            error: error.message
        });
    }
});

// GET dashboard stats
router.get('/dashboard/stats', async (req, res) => {
    try {
        console.log('=== GET /dashboard/stats called ===');
        
        const pendingCount = await StudentApplication.countDocuments({ status: 'PENDING' });
        const approvedCount = await StudentApplication.countDocuments({ status: 'APPROVED' });
        const rejectedCount = await StudentApplication.countDocuments({ status: 'REJECTED' });
        const totalCount = await StudentApplication.countDocuments();
        
        console.log('Dashboard stats:', {
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            total: totalCount
        });
        
        res.json({
            success: true,
            stats: {
                pendingApplications: pendingCount,
                approvedApplications: approvedCount,
                rejectedApplications: rejectedCount,
                totalApplications: totalCount
            }
        });
        
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
});

// POST approve application
router.post('/applications/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        
        const application = await StudentApplication.findByIdAndUpdate(
            id,
            {
                status: 'APPROVED',
                reviewedBy: req.user._id,
                reviewedAt: new Date(),
                reviewComments: comments || 'Application approved'
            },
            { new: true }
        );
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Application approved successfully',
            data: application
        });
        
    } catch (error) {
        console.error('Error approving application:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving application',
            error: error.message
        });
    }
});

// POST reject application
router.post('/applications/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const application = await StudentApplication.findByIdAndUpdate(
            id,
            {
                status: 'REJECTED',
                reviewedBy: req.user._id,
                reviewedAt: new Date(),
                reviewComments: reason || 'Application rejected'
            },
            { new: true }
        );
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Application rejected successfully',
            data: application
        });
        
    } catch (error) {
        console.error('Error rejecting application:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting application',
            error: error.message
        });
    }
});

module.exports = router;
