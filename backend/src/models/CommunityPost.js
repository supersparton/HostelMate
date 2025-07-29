const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: function() { return !this.adminPost; }
    },
    adminPost: {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        adminName: String
    },
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
        type: String,
        required: [true, 'Post description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    type: {
        type: String,
        enum: ['SUGGESTION', 'PROBLEM', 'SOLUTION', 'DISCUSSION'],
        required: true
    },
    category: {
        type: String,
        enum: ['FOOD', 'FACILITIES', 'RULES', 'EVENTS', 'MAINTENANCE', 'GENERAL'],
        required: true
    },
    votes: {
        upvotes: {
            type: Number,
            default: 0
        },
        downvotes: {
            type: Number,
            default: 0
        },
        voters: [{
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            voteType: { type: String, enum: ['UP', 'DOWN'] },
            votedAt: { type: Date, default: Date.now }
        }]
    },
    comments: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        adminName: String,
        comment: { type: String, maxlength: 500 },
        commentedAt: { type: Date, default: Date.now }
    }],
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['ACTIVE', 'RESOLVED', 'CLOSED', 'ARCHIVED'],
        default: 'ACTIVE'
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    adminResponse: {
        message: String,
        respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        respondedAt: Date
    }
}, {
    timestamps: true
});

// Calculate net votes
communityPostSchema.virtual('netVotes').get(function() {
    return this.votes.upvotes - this.votes.downvotes;
});

// Index for efficient querying
communityPostSchema.index({ type: 1, category: 1, status: 1 });
communityPostSchema.index({ 'votes.upvotes': -1 }); // For sorting by popularity
communityPostSchema.index({ createdAt: -1 }); // For sorting by recency

// Ensure virtual fields are included in JSON output
communityPostSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
