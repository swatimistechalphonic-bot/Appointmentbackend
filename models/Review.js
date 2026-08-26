const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userName: {
            type: String,
            default: 'Patient'
        },
        userAvatar: {
            type: String,
            default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        doctorName: {
            type: String,
            default: 'Dr. Specialist'
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: [true, 'Review comment is required'],
            trim: true
        },
        status: {
            type: String,
            enum: ['Approved', 'Pending', 'Rejected'],
            default: 'Approved'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
