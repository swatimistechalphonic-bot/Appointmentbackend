const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/reports/analytics:
 *   get:
 *     summary: Get high-level clinical system report & analytics (Protected)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report analytics retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/analytics', protect, async (req, res) => {
    try {
        const totalAppointments = await Appointment.countDocuments();
        const totalPatients = await Patient.countDocuments();
        const totalDoctors = await User.countDocuments({ role: 'doctor' });

        const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
        const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
        const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
        const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

        // Total Revenue Aggregation
        const revenueAgg = await Appointment.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const rawRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
        const totalRevenue = `₹${rawRevenue.toLocaleString('en-IN')}`;

        res.json({
            success: true,
            reportSummary: {
                totalAppointments,
                totalPatients,
                totalDoctors,
                completedAppointments,
                pendingAppointments,
                confirmedAppointments,
                cancelledAppointments,
                rawRevenue,
                totalRevenue,
                completionRate: totalAppointments > 0 ? `${((completedAppointments / totalAppointments) * 100).toFixed(1)}%` : '0%'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/reports/revenue-trends:
 *   get:
 *     summary: Get revenue trends report grouped by date (Protected)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue trends report retrieved
 */
router.get('/revenue-trends', protect, async (req, res) => {
    try {
        const revenueTrends = await Appointment.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: "$date",
                    revenue: { $sum: "$amount" },
                    consultationsCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            revenueTrends
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/reports/appointment-status:
 *   get:
 *     summary: Get appointment status distribution report (Protected)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointment status breakdown retrieved
 */
router.get('/appointment-status', protect, async (req, res) => {
    try {
        const statusBreakdown = await Appointment.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            statusBreakdown
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/reports/doctor-performance:
 *   get:
 *     summary: Get performance reports for doctors (Protected)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor performance report retrieved
 */
router.get('/doctor-performance', protect, async (req, res) => {
    try {
        const doctorPerformance = await Appointment.aggregate([
            {
                $group: {
                    _id: "$doctorName",
                    totalConsultations: { $sum: 1 },
                    completedVisits: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    totalRevenueGenerated: {
                        $sum: { $cond: [{ $ne: ["$status", "cancelled"] }, "$amount", 0] }
                    }
                }
            },
            { $sort: { totalConsultations: -1 } }
        ]);

        res.json({
            success: true,
            doctorPerformance
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/reports/patient-demographics:
 *   get:
 *     summary: Get patient demographic reports (gender, blood group, age distribution) (Protected)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient demographic report retrieved
 */
router.get('/patient-demographics', protect, async (req, res) => {
    try {
        const genderDistribution = await Patient.aggregate([
            {
                $group: {
                    _id: "$gender",
                    count: { $sum: 1 }
                }
            }
        ]);

        const bloodGroupDistribution = await Patient.aggregate([
            {
                $group: {
                    _id: "$bloodGroup",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            demographics: {
                genderDistribution,
                bloodGroupDistribution
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
