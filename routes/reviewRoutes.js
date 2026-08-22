const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// Initial seed data for reviews if collection is empty
const defaultReviews = [
    { userName: 'Swati Verma', doctorName: 'Dr. Rahul Sharma', rating: 5, comment: 'Dr. Rahul is extremely patient and attentive. Highly recommended consultation!', status: 'Approved' },
    { userName: 'Priya Patel', doctorName: 'Dr. Calvin Carlo', rating: 5, comment: 'Excellent orthopedic diagnosis and knee replacement guidance. Painless experience.', status: 'Approved' },
    { userName: 'Karan Mehta', doctorName: 'Dr. Cristino Murphy', rating: 4, comment: 'Very professional gynecological care and friendly clinic environment.', status: 'Approved' },
    { userName: 'Simran Kaur', doctorName: 'Dr. Alia Reddy', rating: 5, comment: 'Great psychotherapy session. Helped me significantly with anxiety management.', status: 'Approved' },
    { userName: 'Arjun Singh', doctorName: 'Dr. Jessica Taylor', rating: 5, comment: 'Brilliant neurosurgeon. Detailed explanation of treatment options and follow-up.', status: 'Approved' }
];

const seedReviews = async () => {
    try {
        const count = await Review.countDocuments();
        if (count === 0) {
            await Review.insertMany(defaultReviews);
            console.log('✅ Default Doctor Reviews Seeded Successfully');
        }
    } catch (err) {
        console.error('Review seed error:', err.message);
    }
};

seedReviews();

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userName:
 *           type: string
 *         doctorName:
 *           type: string
 *         rating:
 *           type: number
 *         comment:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Approved, Pending, Rejected]
 *     ReviewInput:
 *       type: object
 *       required:
 *         - rating
 *         - comment
 *       properties:
 *         doctor:
 *           type: string
 *         doctorName:
 *           type: string
 *         rating:
 *           type: number
 *         comment:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Approved, Pending, Rejected]
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new doctor review & rating (Protected)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Invalid input or rating
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, async (req, res) => {
    try {
        const { doctor, doctorName, rating, comment, status } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating is required and must be between 1 and 5 stars' });
        }
        if (!comment) {
            return res.status(400).json({ success: false, message: 'Review comment is required' });
        }

        const review = new Review({
            user: req.user?._id || req.user?.id,
            userName: req.user?.name || 'Patient',
            userAvatar: req.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            doctor: doctor && mongoose.Types.ObjectId.isValid(doctor) ? doctor : undefined,
            doctorName: doctorName || 'Dr. Specialist',
            rating: Number(rating),
            comment,
            status: status || 'Approved'
        });

        const savedReview = await review.save();

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully!',
            review: savedReview
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all doctor reviews with optional filters (Protected)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter reviews by Doctor User ID
 *       - in: query
 *         name: doctorName
 *         schema:
 *           type: string
 *         description: Filter reviews by Doctor Name
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Filter by Star Rating
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Approved, Pending, Rejected]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of reviews
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, async (req, res) => {
    try {
        const { doctorId, doctorName, rating, status, search } = req.query;
        const filter = {};

        if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
            filter.doctor = doctorId;
        }

        if (doctorName) {
            filter.doctorName = { $regex: doctorName, $options: 'i' };
        }

        if (rating) {
            filter.rating = Number(rating);
        }

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { doctorName: { $regex: search, $options: 'i' } },
                { comment: { $regex: search, $options: 'i' } }
            ];
        }

        const reviews = await Review.find(filter)
            .populate('user', 'name email phone avatar')
            .populate('doctor', 'name email phone specialization')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/reviews/doctor/{doctorId}:
 *   get:
 *     summary: Get reviews for a specific doctor (Protected)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor reviews retrieved
 */
router.get('/doctor/:doctorId', protect, async (req, res) => {
    try {
        const filter = {};
        if (mongoose.Types.ObjectId.isValid(req.params.doctorId)) {
            filter.doctor = req.params.doctorId;
        } else {
            filter.doctorName = { $regex: req.params.doctorId, $options: 'i' };
        }

        const reviews = await Review.find(filter).sort({ createdAt: -1 });

        // Calculate Average Rating
        const avgAgg = await Review.aggregate([
            { $match: filter },
            { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]);

        const averageRating = avgAgg.length > 0 ? Number(avgAgg[0].avgRating.toFixed(1)) : 5.0;

        res.json({
            success: true,
            count: reviews.length,
            averageRating,
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get review by ID (Protected)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
router.get('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Review ID format' });
        }

        const review = await Review.findById(req.params.id)
            .populate('user', 'name email phone avatar')
            .populate('doctor', 'name email phone specialization');

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        res.json({
            success: true,
            review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update review comment, rating or status (Protected)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       404:
 *         description: Review not found
 */
router.put('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Review ID format' });
        }

        const { rating, comment, status, doctorName } = req.body;
        const updateData = {};

        if (rating !== undefined) updateData.rating = Number(rating);
        if (comment !== undefined) updateData.comment = comment;
        if (status !== undefined) updateData.status = status;
        if (doctorName !== undefined) updateData.doctorName = doctorName;

        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        res.json({
            success: true,
            message: 'Review updated successfully!',
            review: updatedReview
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete review by ID (Protected)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Review ID format' });
        }

        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
