const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send a chat message to a doctor or patient (Protected)
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
 *       400:
 *         description: Missing fields or invalid ID
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
        const doctors = await User.find({ role: 'doctor' }).select('-password');

        const defaultContacts = [
            { id: 'doc1', name: 'Dr. Rahul Sharma', specialization: 'General Physician', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', online: true, lastMessage: 'Hello! How can I help you today?' },
            { id: 'doc2', name: 'Dr. Calvin Carlo', specialization: 'Orthopedic Specialist', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150', online: true, lastMessage: 'Please bring your X-ray reports.' },
            { id: 'doc3', name: 'Dr. Cristino Murphy', specialization: 'Gynecology & Obstetrics', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', online: false, lastMessage: 'Your prescription has been updated.' },
            { id: 'doc4', name: 'Dr. Alia Reddy', specialization: 'Psychotherapy & Mental Health', avatar: 'https://images.unsplash.com/photo-1594824813566-7885a6a0b221?w=150', online: true, lastMessage: 'See you in our next session!' },
            { id: 'doc5', name: 'Dr. Jessica Taylor', specialization: 'Neurology & Brain Care', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150', online: false, lastMessage: 'Take rest and drink plenty of fluids.' }
        ];

        const mergedContacts = doctors.length > 0
            ? doctors.map(d => ({
                _id: d._id,
                name: d.name,
                specialization: d.specialization || 'Medical Specialist',
                avatar: d.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
                online: true,
                lastMessage: 'Available for consultation'
            }))
            : defaultContacts;

        res.json({
            success: true,
            contacts: mergedContacts
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
