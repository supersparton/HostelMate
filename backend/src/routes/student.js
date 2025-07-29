const express = require('express');
const Student = require('../models/Student');
const Menu = require('../models/Menu');
const LeaveApplication = require('../models/LeaveApplication');
const Attendance = require('../models/Attendance');
const Complaint = require('../models/Complaint');
const CommunityPost = require('../models/CommunityPost');
const MealBooking = require('../models/MealBooking');
const QRCode = require('qrcode');
const { authenticateToken, requireStudent } = require('../middleware/auth');
const { 
    validateLeaveApplication, 
    validateComplaint, 
    validateCommunityPost,
    validateObjectId,
    handleValidationErrors 
} = require('../middleware/validation');
const moment = require('moment');

const router = express.Router();

// Apply authentication and student authorization to all routes
router.use(authenticateToken, requireStudent);

// Middleware to get current student
const getCurrentStudent = async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user._id })
            .populate('userId', 'name email phone');
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }
        
        req.student = student;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student profile',
            error: error.message
        });
    }
};

router.use(getCurrentStudent);

// ======================
// DASHBOARD
// ======================

// Get student dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const today = moment().format('YYYY-MM-DD');
        const thisWeek = {
            start: moment().startOf('week').format('YYYY-MM-DD'),
            end: moment().endOf('week').format('YYYY-MM-DD')
        };

        // Get current week menu
        const menu = await Menu.findOne({
            weekStartDate: { 
                $gte: moment().startOf('week').toDate(),
                $lte: moment().endOf('week').toDate() 
            }
        });

        // Today's meal bookings
        const todayMeals = await MealBooking.find({
            studentId: req.student._id,
            date: today
        });

        // Recent attendance (last 7 days)
        const recentAttendance = await Attendance.find({
            studentId: req.student._id,
            date: { $gte: moment().subtract(7, 'days').format('YYYY-MM-DD') }
        }).sort({ timestamp: -1 }).limit(10);

        // Pending leave applications
        const pendingLeaves = await LeaveApplication.find({
            studentId: req.student._id,
            status: 'PENDING'
        }).sort({ createdAt: -1 });

        // Open complaints
        const openComplaints = await Complaint.find({
            studentId: req.student._id,
            status: { $in: ['OPEN', 'IN_PROGRESS'] }
        }).sort({ createdAt: -1 });

        // Weekly attendance summary
        const weeklyAttendance = await Attendance.aggregate([
            {
                $match: {
                    studentId: req.student._id,
                    date: { $gte: thisWeek.start, $lte: thisWeek.end }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                student: req.student,
                menu,
                todayMeals,
                recentAttendance,
                pendingLeaves,
                openComplaints,
                weeklyAttendance: {
                    dinner: weeklyAttendance.find(w => w._id === 'DINNER')?.count || 0,
                    gateEntries: weeklyAttendance.filter(w => ['GATE_IN', 'GATE_OUT'].includes(w._id)).reduce((sum, w) => sum + w.count, 0)
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

// ======================
// MENU & MEAL BOOKING
// ======================

// Get current week menu
router.get('/menu', async (req, res) => {
    try {
        // Get the current week's Monday date (same logic as frontend)
        const currentWeekStart = moment().startOf('week');
        const startDate = currentWeekStart.format('YYYY-MM-DD');
        
        console.log('Student GET - Looking for menu for week starting:', startDate);
        console.log('Student GET - Current week start moment:', currentWeekStart.toDate());

        // Find the most recent menu (temporary fix)
        const menu = await Menu.findOne().sort({ createdAt: -1 });
        
        console.log('Student GET - Found any menu:', menu ? 'Yes' : 'No');
        if (menu) {
            console.log('Student GET - Menu week start:', menu.weekStartDate);
            console.log('Student GET - Menu week start formatted:', moment(menu.weekStartDate).format('YYYY-MM-DD'));
        }

        if (!menu) {
            return res.json({
                success: true,
                data: { 
                    menu: null,
                    message: 'Menu not available for this week'
                }
            });
        }

        // Get student's meal bookings for this week
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            weekDates.push(moment().startOf('week').add(i, 'days').format('YYYY-MM-DD'));
        }

        const bookings = await MealBooking.find({
            studentId: req.student._id,
            date: { $in: weekDates }
        });

        res.json({
            success: true,
            data: {
                menu,
                bookings
            }
        });

    } catch (error) {
        console.error('Student GET - Error fetching menu:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching menu',
            error: error.message
        });
    }
});

// Book meals for next day
router.post('/meals/book', async (req, res) => {
    try {
        const { date, meals } = req.body; // meals: ['breakfast', 'lunch', 'dinner']
        
        if (!date || !Array.isArray(meals)) {
            return res.status(400).json({
                success: false,
                message: 'Date and meals array are required'
            });
        }

        const bookingDate = moment(date);
        const today = moment();
        const tomorrow = moment().add(1, 'day');

        // Check if booking is for tomorrow or later
        if (bookingDate.isBefore(tomorrow, 'day')) {
            return res.status(400).json({
                success: false,
                message: 'Meals can only be booked for tomorrow onwards'
            });
        }

        // Check if booking is not too far in advance (max 7 days)
        if (bookingDate.isAfter(moment().add(7, 'days'), 'day')) {
            return res.status(400).json({
                success: false,
                message: 'Meals can only be booked up to 7 days in advance'
            });
        }

        const dateStr = bookingDate.format('YYYY-MM-DD');
        const validMeals = ['breakfast', 'lunch', 'dinner'];
        const bookingResults = [];

        for (const mealType of meals) {
            if (!validMeals.includes(mealType)) {
                continue;
            }

            try {
                const booking = await MealBooking.findOneAndUpdate(
                    {
                        studentId: req.student._id,
                        date: dateStr,
                        mealType
                    },
                    {
                        studentId: req.student._id,
                        date: dateStr,
                        mealType,
                        isBooked: true,
                        bookingTime: new Date()
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );

                bookingResults.push({
                    mealType,
                    success: true,
                    booking
                });
            } catch (error) {
                bookingResults.push({
                    mealType,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: 'Meal booking completed',
            data: { bookingResults }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error booking meals',
            error: error.message
        });
    }
});

// Cancel meal booking
router.delete('/meals/cancel/:date/:mealType', async (req, res) => {
    try {
        const { date, mealType } = req.params;
        
        const bookingDate = moment(date);
        const cutoffTime = moment().add(1, 'day').startOf('day').add(8, 'hours'); // 8 AM next day

        // Check if it's past the cancellation cutoff
        if (moment().isAfter(cutoffTime) && bookingDate.isSame(moment().add(1, 'day'), 'day')) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel meal after 8 AM on the previous day'
            });
        }

        const booking = await MealBooking.findOneAndUpdate(
            {
                studentId: req.student._id,
                date: bookingDate.format('YYYY-MM-DD'),
                mealType
            },
            { isBooked: false },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Meal booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Meal booking cancelled successfully',
            data: { booking }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling meal booking',
            error: error.message
        });
    }
});

// ======================
// QR CODE & ATTENDANCE
// ======================

// Generate QR code for student
router.get('/qr-code', async (req, res) => {
    try {
        const qrData = {
            studentId: req.student._id,
            studentCode: req.student.qrCode,
            timestamp: Date.now(),
            roomNumber: req.student.roomNumber
        };

        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

        res.json({
            success: true,
            data: {
                qrCode: qrCodeDataURL,
                qrData
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating QR code',
            error: error.message
        });
    }
});

// Scan QR code for attendance
router.post('/attendance/scan', async (req, res) => {
    try {
        const { type, location = 'MAIN_GATE' } = req.body;

        if (!['DINNER', 'GATE_IN', 'GATE_OUT'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance type'
            });
        }

        const today = moment().format('YYYY-MM-DD');
        const now = new Date();

        // Check for dinner time restrictions
        if (type === 'DINNER') {
            const currentHour = moment().hour();
            if (currentHour < 19 || currentHour > 21) { // 7 PM - 9 PM
                return res.status(400).json({
                    success: false,
                    message: 'Dinner attendance can only be marked between 7 PM and 9 PM'
                });
            }

            // Check if already marked for dinner today
            const existingDinnerAttendance = await Attendance.findOne({
                studentId: req.student._id,
                date: today,
                type: 'DINNER'
            });

            if (existingDinnerAttendance) {
                return res.status(400).json({
                    success: false,
                    message: 'Dinner attendance already marked for today'
                });
            }

            // Check if meal was booked
            const mealBooking = await MealBooking.findOne({
                studentId: req.student._id,
                date: today,
                mealType: 'dinner',
                isBooked: true
            });

            if (!mealBooking) {
                return res.status(400).json({
                    success: false,
                    message: 'Dinner was not booked for today'
                });
            }

            // Mark meal as consumed
            mealBooking.isConsumed = true;
            mealBooking.consumedAt = now;
            await mealBooking.save();
        }

        // Create attendance record
        const attendance = new Attendance({
            studentId: req.student._id,
            type,
            timestamp: now,
            date: today,
            qrCodeUsed: req.student.qrCode,
            location
        });

        await attendance.save();

        // Update student status for gate entries
        if (type === 'GATE_OUT') {
            req.student.isInHostel = false;
            await req.student.save();
        } else if (type === 'GATE_IN') {
            req.student.isInHostel = true;
            await req.student.save();
        }

        res.json({
            success: true,
            message: `${type} attendance marked successfully`,
            data: { attendance }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking attendance',
            error: error.message
        });
    }
});

// Get attendance history
router.get('/attendance', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            type, 
            startDate, 
            endDate 
        } = req.query;

        let filter = { studentId: req.student._id };
        
        if (type) filter.type = type;
        
        if (startDate && endDate) {
            filter.date = { 
                $gte: moment(startDate).format('YYYY-MM-DD'),
                $lte: moment(endDate).format('YYYY-MM-DD')
            };
        } else {
            // Default to last 30 days
            filter.date = { 
                $gte: moment().subtract(30, 'days').format('YYYY-MM-DD') 
            };
        }

        const attendance = await Attendance.find(filter)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Attendance.countDocuments(filter);

        res.json({
            success: true,
            data: {
                attendance,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance history',
            error: error.message
        });
    }
});

// ======================
// LEAVE APPLICATIONS
// ======================

// Get student's leave applications
router.get('/leaves', async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        let filter = { studentId: req.student._id };
        if (status) filter.status = status;

        const leaves = await LeaveApplication.find(filter)
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await LeaveApplication.countDocuments(filter);

        res.json({
            success: true,
            data: {
                leaves,
                leaveBalance: req.student.leaveBalance,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave applications',
            error: error.message
        });
    }
});

// Apply for leave
router.post('/leaves', validateLeaveApplication, handleValidationErrors, async (req, res) => {
    try {
        const { fromDate, toDate, reason, emergencyContact } = req.body;

        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        const leaveDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        // Check leave balance
        if (leaveDays > req.student.leaveBalance) {
            return res.status(400).json({
                success: false,
                message: `Insufficient leave balance. Available: ${req.student.leaveBalance} days, Requested: ${leaveDays} days`
            });
        }

        // Check for overlapping leaves
        const overlappingLeave = await LeaveApplication.findOne({
            studentId: req.student._id,
            status: { $in: ['PENDING', 'APPROVED'] },
            $or: [
                {
                    fromDate: { $lte: endDate },
                    toDate: { $gte: startDate }
                }
            ]
        });

        if (overlappingLeave) {
            return res.status(400).json({
                success: false,
                message: 'You have an overlapping leave application'
            });
        }

        // Check minimum advance notice (24 hours)
        const advanceNotice = (startDate - new Date()) / (1000 * 60 * 60);
        if (advanceNotice < 24) {
            return res.status(400).json({
                success: false,
                message: 'Leave applications must be submitted at least 24 hours in advance'
            });
        }

        const leaveApplication = new LeaveApplication({
            studentId: req.student._id,
            fromDate: startDate,
            toDate: endDate,
            reason,
            emergencyContact
        });

        await leaveApplication.save();

        res.json({
            success: true,
            message: 'Leave application submitted successfully',
            data: { 
                leaveApplication,
                estimatedDays: leaveDays
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting leave application',
            error: error.message
        });
    }
});

// Cancel leave application
router.delete('/leaves/:leaveId', validateObjectId('leaveId'), handleValidationErrors, async (req, res) => {
    try {
        const { leaveId } = req.params;

        const leaveApplication = await LeaveApplication.findOne({
            _id: leaveId,
            studentId: req.student._id
        });

        if (!leaveApplication) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        if (leaveApplication.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Can only cancel pending leave applications'
            });
        }

        await LeaveApplication.findByIdAndDelete(leaveId);

        res.json({
            success: true,
            message: 'Leave application cancelled successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling leave application',
            error: error.message
        });
    }
});

// ======================
// COMPLAINTS
// ======================

// Get student's complaints
router.get('/complaints', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category } = req.query;
        
        let filter = { studentId: req.student._id };
        if (status) filter.status = status;
        if (category) filter.category = category;

        const complaints = await Complaint.find(filter)
            .populate('resolvedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Complaint.countDocuments(filter);

        res.json({
            success: true,
            data: {
                complaints,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching complaints',
            error: error.message
        });
    }
});

// Submit complaint
router.post('/complaints', validateComplaint, handleValidationErrors, async (req, res) => {
    try {
        const { title, description, category, priority = 'MEDIUM' } = req.body;

        const complaint = new Complaint({
            studentId: req.student._id,
            title,
            description,
            category,
            priority,
            roomNumber: req.student.roomNumber
        });

        await complaint.save();

        res.json({
            success: true,
            message: 'Complaint submitted successfully',
            data: { complaint }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting complaint',
            error: error.message
        });
    }
});

// ======================
// COMMUNITY FORUM
// ======================

// Get community posts
router.get('/community', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            type, 
            category, 
            sortBy = 'recent' // recent, popular, votes
        } = req.query;
        
        let filter = { status: 'ACTIVE' };
        if (type) filter.type = type;
        if (category) filter.category = category;

        let sortOption = { createdAt: -1 }; // Default: recent
        if (sortBy === 'popular') {
            sortOption = { 'votes.upvotes': -1 };
        } else if (sortBy === 'votes') {
            sortOption = { 'votes.upvotes': -1, 'votes.downvotes': 1 };
        }

        const posts = await CommunityPost.find(filter)
            .populate({
                path: 'studentId',
                populate: {
                    path: 'userId',
                    select: 'name'
                }
            })
            .populate('adminResponse.respondedBy', 'name')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CommunityPost.countDocuments(filter);

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching community posts',
            error: error.message
        });
    }
});

// Create community post
router.post('/community', validateCommunityPost, handleValidationErrors, async (req, res) => {
    try {
        const { title, description, type, category, isAnonymous = false } = req.body;

        const post = new CommunityPost({
            studentId: req.student._id,
            title,
            description,
            type,
            category,
            isAnonymous
        });

        await post.save();

        // Populate the post before sending response
        await post.populate({
            path: 'studentId',
            populate: {
                path: 'userId',
                select: 'name'
            }
        });

        res.json({
            success: true,
            message: 'Post created successfully',
            data: { post }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating post',
            error: error.message
        });
    }
});

// Vote on community post
router.post('/community/:postId/vote', validateObjectId('postId'), handleValidationErrors, async (req, res) => {
    try {
        const { postId } = req.params;
        const { voteType } = req.body; // 'UP' or 'DOWN'

        if (!['UP', 'DOWN'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote type. Use UP or DOWN'
            });
        }

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if student already voted
        const existingVoteIndex = post.votes.voters.findIndex(
            voter => voter.studentId.toString() === req.student._id.toString()
        );

        if (existingVoteIndex !== -1) {
            const existingVote = post.votes.voters[existingVoteIndex];
            
            // If same vote type, remove the vote
            if (existingVote.voteType === voteType) {
                post.votes.voters.splice(existingVoteIndex, 1);
                if (voteType === 'UP') {
                    post.votes.upvotes = Math.max(0, post.votes.upvotes - 1);
                } else {
                    post.votes.downvotes = Math.max(0, post.votes.downvotes - 1);
                }
            } else {
                // Change vote type
                existingVote.voteType = voteType;
                existingVote.votedAt = new Date();
                
                if (voteType === 'UP') {
                    post.votes.upvotes += 1;
                    post.votes.downvotes = Math.max(0, post.votes.downvotes - 1);
                } else {
                    post.votes.downvotes += 1;
                    post.votes.upvotes = Math.max(0, post.votes.upvotes - 1);
                }
            }
        } else {
            // New vote
            post.votes.voters.push({
                studentId: req.student._id,
                voteType,
                votedAt: new Date()
            });
            
            if (voteType === 'UP') {
                post.votes.upvotes += 1;
            } else {
                post.votes.downvotes += 1;
            }
        }

        await post.save();

        res.json({
            success: true,
            message: 'Vote recorded successfully',
            data: {
                votes: {
                    upvotes: post.votes.upvotes,
                    downvotes: post.votes.downvotes,
                    netVotes: post.votes.upvotes - post.votes.downvotes
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording vote',
            error: error.message
        });
    }
});

// Add comment to community post
router.post('/community/:postId/comment', validateObjectId('postId'), handleValidationErrors, async (req, res) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot be empty'
            });
        }

        if (comment.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot exceed 500 characters'
            });
        }

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        post.comments.push({
            studentId: req.student._id,
            comment: comment.trim(),
            commentedAt: new Date()
        });

        await post.save();

        // Populate the new comment
        await post.populate({
            path: 'comments.studentId',
            populate: {
                path: 'userId',
                select: 'name'
            }
        });

        const newComment = post.comments[post.comments.length - 1];

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: { comment: newComment }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
});

// Get student's own posts
router.get('/community/my-posts', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const posts = await CommunityPost.find({ 
            studentId: req.student._id 
        })
        .populate('adminResponse.respondedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await CommunityPost.countDocuments({ 
            studentId: req.student._id 
        });

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching your posts',
            error: error.message
        });
    }
});

// ======================
// LEAVE APPLICATION MANAGEMENT
// ======================

// Submit leave application
router.post('/leave-applications', validateLeaveApplication, handleValidationErrors, async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, reason } = req.body;
        
        console.log('Student submitting leave application:', {
            studentId: req.student._id,
            leaveType,
            fromDate,
            toDate,
            reason
        });

        // Validate dates
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (from < today) {
            return res.status(400).json({
                success: false,
                message: 'From date cannot be in the past'
            });
        }

        if (to < from) {
            return res.status(400).json({
                success: false,
                message: 'To date cannot be earlier than from date'
            });
        }

        // Calculate total days
        const totalDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

        // Check for overlapping leave applications
        const overlappingLeave = await LeaveApplication.findOne({
            studentId: req.student._id,
            status: { $in: ['PENDING', 'APPROVED'] },
            $or: [
                {
                    fromDate: { $lte: to },
                    toDate: { $gte: from }
                }
            ]
        });

        if (overlappingLeave) {
            return res.status(400).json({
                success: false,
                message: 'You already have a leave application for overlapping dates',
                conflictingLeave: {
                    id: overlappingLeave._id,
                    fromDate: overlappingLeave.fromDate,
                    toDate: overlappingLeave.toDate,
                    status: overlappingLeave.status
                }
            });
        }

        // Create leave application
        const leaveApplication = new LeaveApplication({
            studentId: req.student._id,
            userId: req.user._id,
            leaveType,
            fromDate: from,
            toDate: to,
            reason,
            status: 'PENDING'
        });

        console.log('About to save leave application:', {
            studentId: leaveApplication.studentId,
            userId: leaveApplication.userId,
            leaveType: leaveApplication.leaveType,
            fromDate: leaveApplication.fromDate,
            toDate: leaveApplication.toDate,
            reason: leaveApplication.reason
        });

        let savedLeave;
        try {
            savedLeave = await leaveApplication.save();
            console.log('Leave application saved successfully with ID:', savedLeave._id);
        } catch (saveError) {
            console.error('Error saving leave application:', saveError);
            return res.status(500).json({
                success: false,
                message: 'Error saving leave application',
                error: saveError.message
            });
        }

        // Populate the saved application for response
        const populatedLeave = await LeaveApplication.findById(savedLeave._id)
            .populate('studentId', 'name studentId roomNumber')
            .populate('userId', 'email');

        console.log('Populated leave application:', populatedLeave);

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: populatedLeave
        });
    } catch (error) {
        console.error('Error submitting leave application:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting leave application',
            error: error.message
        });
    }
});

// Get student's leave applications
router.get('/leave-applications', async (req, res) => {
    try {
        const { page = 1, limit = 20, status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        console.log('Fetching leave applications for student:', req.student._id);

        const filter = { studentId: req.student._id };
        
        // Temporarily remove status filter
        // if (status && status !== 'ALL') {
        //     filter.status = status;
        // }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Remove pagination temporarily to see all data
        const leaveApplications = await LeaveApplication.find(filter)
            .populate('approvedBy', 'name email')
            .sort(sortOptions);
            // .limit(limit * 1)
            // .skip((page - 1) * limit);

        console.log('Found leave applications for student:', leaveApplications.length);

        const total = await LeaveApplication.countDocuments(filter);

        // Get statistics
        const stats = await LeaveApplication.aggregate([
            { $match: { studentId: req.student._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const statusCounts = {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 0
        };
        
        stats.forEach(stat => {
            statusCounts[stat._id] = stat.count;
        });

        res.json({
            success: true,
            data: {
                leaveApplications,
                totalCount: total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
                statistics: statusCounts
            }
        });
    } catch (error) {
        console.error('Error fetching leave applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave applications',
            error: error.message
        });
    }
});

// Get specific leave application by ID
router.get('/leave-applications/:id', validateObjectId('id'), async (req, res) => {
    try {
        const leaveApplication = await LeaveApplication.findOne({
            _id: req.params.id,
            studentId: req.student._id
        })
        .populate('approvedBy', 'name email');

        if (!leaveApplication) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        res.json({
            success: true,
            data: leaveApplication
        });
    } catch (error) {
        console.error('Error fetching leave application:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave application',
            error: error.message
        });
    }
});

// Cancel leave application (only if pending)
router.delete('/leave-applications/:id', validateObjectId('id'), async (req, res) => {
    try {
        const leaveApplication = await LeaveApplication.findOne({
            _id: req.params.id,
            studentId: req.student._id,
            status: 'PENDING'
        });

        if (!leaveApplication) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found or cannot be cancelled'
            });
        }

        await LeaveApplication.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Leave application cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling leave application:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling leave application',
            error: error.message
        });
    }
});

// Get leave application QR codes (only for approved applications)
router.get('/leave-applications/:id/qr-codes', validateObjectId('id'), async (req, res) => {
    try {
        const leaveApplication = await LeaveApplication.findOne({
            _id: req.params.id,
            studentId: req.student._id,
            status: 'APPROVED'
        });

        if (!leaveApplication) {
            return res.status(404).json({
                success: false,
                message: 'Approved leave application not found'
            });
        }

        if (!leaveApplication.entryQRCode || !leaveApplication.exitQRCode) {
            return res.status(400).json({
                success: false,
                message: 'QR codes not generated for this leave application'
            });
        }

        // Regenerate QR codes from stored tokens
        const QRCode = require('qrcode');
        const entryQRImage = await QRCode.toDataURL(leaveApplication.entryQRCode.code);
        const exitQRImage = await QRCode.toDataURL(leaveApplication.exitQRCode.code);

        res.json({
            success: true,
            data: {
                leaveApplicationId: leaveApplication._id,
                leaveType: leaveApplication.leaveType,
                fromDate: leaveApplication.fromDate,
                toDate: leaveApplication.toDate,
                qrCodes: {
                    entryQR: {
                        qrCode: entryQRImage,
                        used: leaveApplication.entryQRCode.used,
                        usedAt: leaveApplication.entryQRCode.usedAt,
                        purpose: 'Exit Hostel - Show this when leaving'
                    },
                    exitQR: {
                        qrCode: exitQRImage,
                        used: leaveApplication.exitQRCode.used,
                        usedAt: leaveApplication.exitQRCode.usedAt,
                        purpose: 'Enter Hostel - Show this when returning'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching QR codes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching QR codes',
            error: error.message
        });
    }
});

// Get leave calendar for student
router.get('/leave-calendar', async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month } = req.query;
        
        const filter = { 
            studentId: req.student._id,
            status: 'APPROVED'
        };

        // If month is specified, filter by month
        if (month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            filter.$or = [
                {
                    fromDate: { $lte: endDate },
                    toDate: { $gte: startDate }
                }
            ];
        } else {
            // Filter by year
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            filter.$or = [
                {
                    fromDate: { $lte: endDate },
                    toDate: { $gte: startDate }
                }
            ];
        }

        const leaveApplications = await LeaveApplication.find(filter)
            .select('leaveType fromDate toDate totalDays reason')
            .sort({ fromDate: 1 });

        res.json({
            success: true,
            data: {
                year: parseInt(year),
                month: month ? parseInt(month) : null,
                leaveApplications
            }
        });
    } catch (error) {
        console.error('Error fetching leave calendar:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave calendar',
            error: error.message
        });
    }
});

module.exports = router;
