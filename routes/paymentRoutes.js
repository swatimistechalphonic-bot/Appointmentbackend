const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

// ------------------------------------
// Auto-seed sample payment records
// ------------------------------------
const seedPayments = async () => {
    try {
        const count = await Payment.countDocuments();
        if (count === 0) {
            const samplePayments = [
                { patientName: 'Rajesh Kumar', doctorName: 'Dr. Calvin Carlo', amount: 1500, paymentMethod: 'UPI', paymentStatus: 'Paid', transactionId: 'TXN2026001', description: 'Orthopedic Consultation', paymentDate: new Date('2026-08-10') },
                { patientName: 'Priya Sharma', doctorName: 'Dr. Toni Kover', amount: 2500, paymentMethod: 'Card', paymentStatus: 'Paid', transactionId: 'TXN2026002', description: 'Cardiology Follow-up', paymentDate: new Date('2026-08-12') },
                { patientName: 'Amit Singh', doctorName: 'Dr. Alia Reddy', amount: 800, paymentMethod: 'Cash', paymentStatus: 'Pending', transactionId: '', description: 'Mental Health Session', paymentDate: new Date('2026-08-15') },
                { patientName: 'Sunita Verma', doctorName: 'Dr. Jessica Taylor', amount: 3200, paymentMethod: 'Online', paymentStatus: 'Paid', transactionId: 'TXN2026003', description: 'Neurology Consultation', paymentDate: new Date('2026-08-16') },
                { patientName: 'Ravi Patel', doctorName: 'Dr. Cristino Murphy', amount: 1800, paymentMethod: 'Insurance', paymentStatus: 'Pending', transactionId: 'INS2026001', description: 'Gynecology Check-up', paymentDate: new Date('2026-08-18') },
                { patientName: 'Meena Joshi', doctorName: 'Dr. Rahul Sharma', amount: 500, paymentMethod: 'Cash', paymentStatus: 'Paid', transactionId: '', description: 'General Physician Consultation', paymentDate: new Date('2026-08-20') },
                { patientName: 'Sanjay Gupta', doctorName: 'Dr. Calvin Carlo', amount: 4500, paymentMethod: 'Card', paymentStatus: 'Failed', transactionId: 'TXN2026004', description: 'Knee Replacement Pre-Op', paymentDate: new Date('2026-08-21') },
                { patientName: 'Kavita Rao', doctorName: 'Dr. Toni Kover', amount: 1200, paymentMethod: 'UPI', paymentStatus: 'Refunded', transactionId: 'TXN2026005', description: 'ECG & Heart Screening', paymentDate: new Date('2026-08-22') },
            ];
            await Payment.insertMany(samplePayments);
            console.log('✅ Sample Payment Records Seeded Successfully');
        }
    } catch (err) {
        console.error('Payment seed error:', err.message);
    }
};
seedPayments();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment Management APIs
 */

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Get payment summary stats (Protected)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics summary
 */
router.get('/stats', protect, async (req, res) => {
    try {
        const all = await Payment.find();
        const totalRevenue = all.filter(p => p.paymentStatus === 'Paid').reduce((sum, p) => sum + p.amount, 0);
        const totalPaid = all.filter(p => p.paymentStatus === 'Paid').length;
        const totalPending = all.filter(p => p.paymentStatus === 'Pending').length;
        const totalFailed = all.filter(p => p.paymentStatus === 'Failed').length;
        const totalRefunded = all.filter(p => p.paymentStatus === 'Refunded').length;

        res.json({
            success: true,
            stats: {
                totalPayments: all.length,
                totalRevenue,
                totalRevenueFormatted: `₹${totalRevenue.toLocaleString('en-IN')}`,
                totalPaid,
                totalPending,
                totalFailed,
                totalRefunded
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payment records with optional search/filter (Protected)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient or doctor name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Paid, Pending, Failed, Refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *         description: Filter by payment method
 *     responses:
 *       200:
 *         description: List of payment records
 */
router.get('/', protect, async (req, res) => {
    try {
        const { search, status, method } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { patientName: { $regex: search, $options: 'i' } },
                { doctorName: { $regex: search, $options: 'i' } },
                { transactionId: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) filter.paymentStatus = status;
        if (method) filter.paymentMethod = method;

        const payments = await Payment.find(filter).sort({ paymentDate: -1 });

        res.json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get a single payment by ID (Protected)
 *     tags: [Payments]
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
 *         description: Payment record found
 *       404:
 *         description: Payment not found
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }
        res.json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Record a new payment (Protected)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientName
 *               - doctorName
 *               - amount
 *             properties:
 *               patientName:
 *                 type: string
 *               doctorName:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Card, UPI, Online, Insurance, Cheque]
 *               paymentStatus:
 *                 type: string
 *                 enum: [Paid, Pending, Failed, Refunded]
 *               transactionId:
 *                 type: string
 *               description:
 *                 type: string
 *               paymentDate:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 */
router.post('/', protect, async (req, res) => {
    try {
        const { patientName, doctorName, amount, paymentMethod, paymentStatus, transactionId, description, paymentDate, notes } = req.body;

        if (!patientName || !doctorName || amount === undefined) {
            return res.status(400).json({ success: false, message: 'patientName, doctorName, and amount are required' });
        }

        const payment = new Payment({
            patientName,
            doctorName,
            amount: Number(amount),
            paymentMethod: paymentMethod || 'Cash',
            paymentStatus: paymentStatus || 'Pending',
            transactionId: transactionId || `TXN${Date.now()}`,
            description: description || '',
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            notes: notes || ''
        });

        const savedPayment = await payment.save();

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully!',
            payment: savedPayment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     summary: Update a payment record (Protected)
 *     tags: [Payments]
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
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               amount:
 *                 type: number
 *               transactionId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *       404:
 *         description: Payment not found
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const { patientName, doctorName, amount, paymentMethod, paymentStatus, transactionId, description, paymentDate, notes } = req.body;
        const updateData = {};

        if (patientName !== undefined) updateData.patientName = patientName;
        if (doctorName !== undefined) updateData.doctorName = doctorName;
        if (amount !== undefined) updateData.amount = Number(amount);
        if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
        if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
        if (transactionId !== undefined) updateData.transactionId = transactionId;
        if (description !== undefined) updateData.description = description;
        if (paymentDate !== undefined) updateData.paymentDate = new Date(paymentDate);
        if (notes !== undefined) updateData.notes = notes;

        const updated = await Payment.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        res.json({
            success: true,
            message: 'Payment updated successfully!',
            payment: updated
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     summary: Delete a payment record (Protected)
 *     tags: [Payments]
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
 *         description: Payment deleted successfully
 *       404:
 *         description: Payment not found
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.json({ success: true, message: 'Payment record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
