const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send a chat message to a doctor or patient (Protected - Confirmed Appointment Only)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver
 *               - text
 *             properties:
 *               receiver:
 *                 type: string
 *                 description: Receiver User ID
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       403:
 *         description: Restricted - Confirmed appointment required
 *       401:
 *         description: Not authorized
 */
router.post('/send', protect, async (req, res) => {
    try {
        const { receiver, text } = req.body;
        const senderId = req.user?._id || req.user?.id;

        if (!receiver || !text) {
            return res.status(400).json({ success: false, message: 'Receiver ID and text message are required' });
        }

        let receiverUser = null;
        if (mongoose.Types.ObjectId.isValid(receiver)) {
            receiverUser = await User.findById(receiver);
        }

        // Business Rule: Check if sender has a CONFIRMED appointment
        const receiverDoctorName = receiverUser ? receiverUser.name : '';
        const confirmedBooking = await Appointment.findOne({
            $or: [
                { user: senderId, status: 'confirmed' },
                { doctorName: receiverDoctorName, status: 'confirmed' }
            ],
            status: 'confirmed'
        });

        // Allow if confirmed appointment exists OR user is admin
        if (!confirmedBooking && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Chat access restricted: You can only chat with doctors with whom you have a confirmed appointment.'
            });
        }

        const message = new Message({
            sender: senderId,
            receiver: receiverUser ? receiverUser._id : new mongoose.Types.ObjectId(),
            senderName: req.user?.name || 'User',
            receiverName: receiverUser ? receiverUser.name : 'Doctor Specialist',
            text,
            isRead: false
        });

        const savedMessage = await message.save();

        res.status(201).json({
            success: true,
            message: 'Message sent successfully!',
            chatMessage: savedMessage
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/chat/conversation/{userId}:
 *   get:
 *     summary: Get message history between current user and specified doctor/patient (Protected)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation history retrieved
 */
router.get('/conversation/:userId', protect, async (req, res) => {
    try {
        const currentUserId = req.user?._id || req.user?.id;
        const otherUserId = req.params.userId;

        let messages = [];

        if (mongoose.Types.ObjectId.isValid(otherUserId)) {
            messages = await Message.find({
                $or: [
                    { sender: currentUserId, receiver: otherUserId },
                    { sender: otherUserId, receiver: currentUserId }
                ]
            }).sort({ createdAt: 1 });
        }

        res.json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/chat/contacts:
 *   get:
 *     summary: Get chat contacts list (Doctors & Specialists) (Protected)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contacts list retrieved
 */
router.get('/contacts', protect, async (req, res) => {
    try {
        const currentUserId = req.user?._id || req.user?.id;

        // Query confirmed appointments for logged-in user
        const confirmedBookings = await Appointment.find({
            $or: [
                { user: currentUserId },
                { status: 'confirmed' }
            ],
            status: 'confirmed'
        });

        const confirmedDoctorNames = new Set(confirmedBookings.map(b => b.doctorName));

        const doctors = await User.find({ role: 'doctor' }).select('-password');

        const defaultContacts = [
            { id: 'doc1', name: 'Dr. Rahul Sharma', specialization: 'General Physician', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', online: true, lastMessage: 'Confirmed appointment active' },
            { id: 'doc2', name: 'Dr. Calvin Carlo', specialization: 'Orthopedic Specialist', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150', online: true, lastMessage: 'Confirmed appointment active' },
            { id: 'doc3', name: 'Dr. Cristino Murphy', specialization: 'Gynecology & Obstetrics', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', online: false, lastMessage: 'Confirmed appointment active' },
            { id: 'doc4', name: 'Dr. Alia Reddy', specialization: 'Psychotherapy & Mental Health', avatar: 'https://images.unsplash.com/photo-1594824813566-7885a6a0b221?w=150', online: true, lastMessage: 'Confirmed appointment active' },
            { id: 'doc5', name: 'Dr. Jessica Taylor', specialization: 'Neurology & Brain Care', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150', online: false, lastMessage: 'Confirmed appointment active' }
        ];

        let availableContacts = doctors.length > 0
            ? doctors.map(d => ({
                _id: d._id,
                name: d.name,
                specialization: d.specialization || 'Medical Specialist',
                avatar: d.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
                online: true,
                isConfirmed: confirmedDoctorNames.has(d.name) || confirmedBookings.length > 0,
                lastMessage: 'Confirmed consultation active'
            }))
            : defaultContacts.map(d => ({ ...d, isConfirmed: true }));

        // Filter contacts to only confirmed doctors if non-admin user
        if (req.user?.role !== 'admin' && confirmedDoctorNames.size > 0) {
            availableContacts = availableContacts.filter(c => confirmedDoctorNames.has(c.name) || c.isConfirmed);
        }

        res.json({
            success: true,
            hasConfirmedAppointments: confirmedBookings.length > 0 || req.user?.role === 'admin',
            contacts: availableContacts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/chat/read/{senderId}:
 *   put:
 *     summary: Mark messages from sender as read (Protected)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put('/read/:senderId', protect, async (req, res) => {
    try {
        const currentUserId = req.user?._id || req.user?.id;
        const senderId = req.params.senderId;

        if (mongoose.Types.ObjectId.isValid(senderId)) {
            await Message.updateMany(
                { sender: senderId, receiver: currentUserId, isRead: false },
                { $set: { isRead: true } }
            );
        }

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
