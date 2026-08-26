const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Patient = require('../models/Patient');

// Helper to get formatted date YYYY-MM-DD in local time
const getTodayDateString = (dateObj = new Date()) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to format time
const formatCurrentTime = (dateObj = new Date()) => {
    return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

/**
 * @swagger
 * components:
 *   schemas:
 *     QueueItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         token:
 *           type: string
 *           example: "T-01"
 *         tokenNumber:
 *           type: number
 *           example: 1
 *         patientName:
 *           type: string
 *           example: "Rahul Sharma"
 *         patientPhone:
 *           type: string
 *           example: "+91 9876543210"
 *         doctorName:
 *           type: string
 *           example: "Dr. Amit Verma"
 *         date:
 *           type: string
 *           example: "2026-08-26"
 *         timeSlot:
 *           type: string
 *           example: "10:30 AM"
 *         checkInTime:
 *           type: string
 *           example: "10:15 AM"
 *         status:
 *           type: string
 *           enum: [Waiting, In Consultation, Completed, Skipped, Cancelled]
 *           example: "Waiting"
 *         priority:
 *           type: string
 *           enum: [Normal, Urgent, Emergency]
 *           example: "Normal"
 *         notes:
 *           type: string
 *     QueueCheckInInput:
 *       type: object
 *       properties:
 *         appointmentId:
 *           type: string
 *           description: Optional ID of the existing appointment
 *         patientName:
 *           type: string
 *           example: "Rahul Sharma"
 *         patientId:
 *           type: string
 *         patientPhone:
 *           type: string
 *         doctorId:
 *           type: string
 *         doctorName:
 *           type: string
 *           example: "Dr. Amit Verma"
 *         date:
 *           type: string
 *           example: "2026-08-26"
 *         timeSlot:
 *           type: string
 *           example: "10:30 AM"
 *         priority:
 *           type: string
 *           enum: [Normal, Urgent, Emergency]
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/queue/today:
 *   get:
 *     summary: Queue statistics for today
 *     tags: [Queue Management]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Date in YYYY-MM-DD format (defaults to today)
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter queue stats by doctor ID
 *     responses:
 *       200:
 *         description: Today's queue metrics and counts
 */
router.get('/today', async (req, res) => {
    try {
        const queryDate = req.query.date || getTodayDateString();
        const filter = { date: queryDate };

        if (req.query.doctorId && mongoose.Types.ObjectId.isValid(req.query.doctorId)) {
            filter.doctor = req.query.doctorId;
        }

        const items = await Queue.find(filter);

        const totalQueue = items.length;
        const inConsultation = items.filter(q => q.status === 'In Consultation').length;
        const waiting = items.filter(q => q.status === 'Waiting').length;
        const completed = items.filter(q => q.status === 'Completed').length;
        const skipped = items.filter(q => q.status === 'Skipped').length;
        const cancelled = items.filter(q => q.status === 'Cancelled').length;

        return res.status(200).json({
            success: true,
            date: queryDate,
            data: {
                totalQueue,
                inConsultation,
                waiting,
                completed,
                skipped,
                cancelled
            }
        });
    } catch (error) {
        console.error('Error fetching today queue stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch queue stats',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/check-in/today:
 *   get:
 *     summary: Today's appointments scheduled for check-in
 *     tags: [Queue Management]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Date in YYYY-MM-DD format (defaults to today)
 *     responses:
 *       200:
 *         description: List of scheduled appointments with queue check-in status
 */
router.get('/check-in/today', async (req, res) => {
    try {
        const queryDate = req.query.date || getTodayDateString();

        // 1. Fetch appointments for this date (or any confirmed/pending active appointments if none for exact date)
        let appointments = await Appointment.find({ date: queryDate })
            .populate('user', 'name email phone')
            .populate('doctor', 'name specialization email')
            .sort({ timeSlot: 1, createdAt: 1 });

        if (appointments.length === 0) {
            appointments = await Appointment.find({ status: { $in: ['confirmed', 'pending'] } })
                .populate('user', 'name email phone')
                .populate('doctor', 'name specialization email')
                .limit(10)
                .sort({ createdAt: -1 });
        }

        // 2. Fetch existing queue entries for this date
        const queueEntries = await Queue.find({ date: queryDate });
        const checkedInApptIds = new Set(
            queueEntries
                .filter(q => q.appointment)
                .map(q => q.appointment.toString())
        );

        // 3. Format appointments for Receptionist desk
        const data = appointments.map(app => {
            const isCheckedIn = checkedInApptIds.has(app._id.toString());
            const queueItem = isCheckedIn
                ? queueEntries.find(q => q.appointment && q.appointment.toString() === app._id.toString())
                : null;

            const patientName = app.user?.name || 'Patient';
            const doctorName = app.doctor?.name
                ? (app.doctor.name.startsWith('Dr.') ? app.doctor.name : `Dr. ${app.doctor.name}`)
                : (app.doctorName || 'Doctor');

            return {
                id: app._id,
                appointmentId: app._id,
                patient: patientName,
                patientPhone: app.user?.phone || '',
                doctor: doctorName,
                doctorId: app.doctor?._id || null,
                time: app.timeSlot,
                status: app.status,
                isCheckedIn,
                token: queueItem ? queueItem.token : null,
                queueStatus: queueItem ? queueItem.status : null,
                checkInTime: queueItem ? queueItem.checkInTime : null
            };
        });

        return res.status(200).json({
            success: true,
            date: queryDate,
            count: data.length,
            data
        });
    } catch (error) {
        console.error('Error fetching today check-in appointments:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch check-in appointments',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/check-in:
 *   post:
 *     summary: Patient check-in + token generation
 *     tags: [Queue Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QueueCheckInInput'
 *     responses:
 *       201:
 *         description: Patient successfully checked in with generated token
 *       400:
 *         description: Validation error or already checked in
 */
router.post('/check-in', async (req, res) => {
    try {
        const {
            appointmentId,
            patientName: rawPatientName,
            patientId,
            patientPhone: rawPatientPhone,
            doctorId,
            doctorName: rawDoctorName,
            date: rawDate,
            timeSlot: rawTimeSlot,
            priority = 'Normal',
            notes = ''
        } = req.body;

        const date = rawDate || getTodayDateString();
        let patientName = rawPatientName || '';
        let patientPhone = rawPatientPhone || '';
        let doctorName = rawDoctorName || '';
        let doctor = doctorId && mongoose.Types.ObjectId.isValid(doctorId) ? doctorId : null;
        let patient = patientId && mongoose.Types.ObjectId.isValid(patientId) ? patientId : null;
        let appointment = null;
        let timeSlot = rawTimeSlot || '';

        // If appointmentId is supplied, lookup and link
        if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
            appointment = await Appointment.findById(appointmentId)
                .populate('user', 'name phone email')
                .populate('doctor', 'name specialization');

            if (appointment) {
                // Check if already checked in for this appointment
                const existingQueue = await Queue.findOne({ appointment: appointment._id });
                if (existingQueue) {
                    return res.status(200).json({
                        success: true,
                        message: 'Patient already checked in',
                        data: existingQueue
                    });
                }

                if (!patientName && appointment.user?.name) patientName = appointment.user.name;
                if (!patientPhone && appointment.user?.phone) patientPhone = appointment.user.phone;
                if (!patient && appointment.user?._id) patient = appointment.user._id;

                if (!doctorName && appointment.doctor?.name) {
                    doctorName = appointment.doctor.name.startsWith('Dr.') ? appointment.doctor.name : `Dr. ${appointment.doctor.name}`;
                } else if (!doctorName && appointment.doctorName) {
                    doctorName = appointment.doctorName;
                }
                if (!doctor && appointment.doctor?._id) doctor = appointment.doctor._id;
                if (!timeSlot && appointment.timeSlot) timeSlot = appointment.timeSlot;
            }
        }

        if (!patientName) {
            patientName = 'Walk-in Patient';
        }
        if (!doctorName) {
            doctorName = 'Assigned Doctor';
        }

        // Count existing queue entries on that date to assign sequential token
        const totalEntriesToday = await Queue.countDocuments({ date });
        const tokenNumber = totalEntriesToday + 1;
        const token = `T-${String(tokenNumber).padStart(2, '0')}`;
        const checkInTime = formatCurrentTime();

        const queueItem = new Queue({
            token,
            tokenNumber,
            patient,
            patientName,
            patientPhone,
            doctor,
            doctorName,
            appointment: appointment ? appointment._id : null,
            date,
            timeSlot,
            checkInTime,
            checkInTimestamp: new Date(),
            status: 'Waiting',
            priority,
            notes
        });

        await queueItem.save();

        return res.status(201).json({
            success: true,
            message: `Patient checked in successfully with Token ${token}`,
            data: queueItem
        });
    } catch (error) {
        console.error('Error during patient check-in:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process check-in',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/today/board:
 *   get:
 *     summary: Waiting room monitor board
 *     tags: [Queue Management]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Date in YYYY-MM-DD (defaults to today)
 *     responses:
 *       200:
 *         description: Waiting room monitor live queue list
 */
router.get('/today/board', async (req, res) => {
    try {
        const queryDate = req.query.date || getTodayDateString();
        const queueList = await Queue.find({ date: queryDate })
            .sort({ tokenNumber: 1, createdAt: 1 });

        const formatted = queueList.map(item => ({
            _id: item._id,
            token: item.token,
            tokenNumber: item.tokenNumber,
            patient: item.patientName,
            patientName: item.patientName,
            doctor: item.doctorName,
            doctorName: item.doctorName,
            checkInTime: item.checkInTime,
            status: item.status,
            priority: item.priority,
            timeSlot: item.timeSlot,
            appointmentId: item.appointment
        }));

        return res.status(200).json({
            success: true,
            date: queryDate,
            total: formatted.length,
            data: formatted
        });
    } catch (error) {
        console.error('Error fetching waiting room board:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch waiting room board',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/current:
 *   get:
 *     summary: Active consultation
 *     tags: [Queue Management]
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Optional doctor ID filter
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current active patient in consultation
 */
router.get('/current', async (req, res) => {
    try {
        const queryDate = req.query.date || getTodayDateString();
        const filter = {
            date: queryDate,
            status: 'In Consultation'
        };

        if (req.query.doctorId && mongoose.Types.ObjectId.isValid(req.query.doctorId)) {
            filter.doctor = req.query.doctorId;
        }

        const currentActive = await Queue.findOne(filter).sort({ startTime: -1, updatedAt: -1 });

        return res.status(200).json({
            success: true,
            date: queryDate,
            data: currentActive || null
        });
    } catch (error) {
        console.error('Error fetching current active consultation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch active consultation',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/call-next:
 *   post:
 *     summary: Next patient call
 *     tags: [Queue Management]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Next patient called and moved to In Consultation
 *       404:
 *         description: No waiting patient found
 */
router.post('/call-next', async (req, res) => {
    try {
        const queryDate = req.body.date || getTodayDateString();
        const filter = {
            date: queryDate,
            status: 'Waiting'
        };

        if (req.body.doctorId && mongoose.Types.ObjectId.isValid(req.body.doctorId)) {
            filter.doctor = req.body.doctorId;
        }

        // Auto-complete any currently active patient for this doctor/queue if exists
        const currentActiveFilter = {
            date: queryDate,
            status: 'In Consultation'
        };
        if (req.body.doctorId && mongoose.Types.ObjectId.isValid(req.body.doctorId)) {
            currentActiveFilter.doctor = req.body.doctorId;
        }

        await Queue.updateMany(currentActiveFilter, {
            status: 'Completed',
            endTime: new Date()
        });

        // Find the next waiting patient (sorted by tokenNumber / createdAt)
        const nextPatient = await Queue.findOne(filter).sort({ tokenNumber: 1, createdAt: 1 });

        if (!nextPatient) {
            return res.status(404).json({
                success: false,
                message: 'No patients currently waiting in the queue'
            });
        }

        nextPatient.status = 'In Consultation';
        nextPatient.startTime = new Date();
        await nextPatient.save();

        return res.status(200).json({
            success: true,
            message: `Called next patient: Token ${nextPatient.token} (${nextPatient.patientName})`,
            data: nextPatient
        });
    } catch (error) {
        console.error('Error calling next patient:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to call next patient',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/{id}/start:
 *   post:
 *     summary: Start consultation
 *     tags: [Queue Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue item ID or Token (e.g. T-01)
 *     responses:
 *       200:
 *         description: Consultation started
 *       404:
 *         description: Queue entry not found
 */
router.post('/:id/start', async (req, res) => {
    try {
        const { id } = req.params;
        let queueItem;

        if (mongoose.Types.ObjectId.isValid(id)) {
            queueItem = await Queue.findById(id);
        } else {
            queueItem = await Queue.findOne({
                token: id,
                date: req.body.date || getTodayDateString()
            });
        }

        if (!queueItem) {
            return res.status(404).json({
                success: false,
                message: 'Queue entry not found'
            });
        }

        queueItem.status = 'In Consultation';
        queueItem.startTime = new Date();
        await queueItem.save();

        return res.status(200).json({
            success: true,
            message: `Consultation started for Token ${queueItem.token}`,
            data: queueItem
        });
    } catch (error) {
        console.error('Error starting consultation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to start consultation',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/{id}/complete:
 *   post:
 *     summary: Complete consultation
 *     tags: [Queue Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue item ID or Token
 *     responses:
 *       200:
 *         description: Consultation completed
 *       404:
 *         description: Queue entry not found
 */
router.post('/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        let queueItem;

        if (mongoose.Types.ObjectId.isValid(id)) {
            queueItem = await Queue.findById(id);
        } else {
            queueItem = await Queue.findOne({
                token: id,
                date: req.body.date || getTodayDateString()
            });
        }

        if (!queueItem) {
            return res.status(404).json({
                success: false,
                message: 'Queue entry not found'
            });
        }

        queueItem.status = 'Completed';
        queueItem.endTime = new Date();
        await queueItem.save();

        // If linked to an appointment, mark appointment as completed
        if (queueItem.appointment) {
            await Appointment.findByIdAndUpdate(queueItem.appointment, { status: 'completed' });
        }

        return res.status(200).json({
            success: true,
            message: `Consultation completed for Token ${queueItem.token}`,
            data: queueItem
        });
    } catch (error) {
        console.error('Error completing consultation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to complete consultation',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/{id}/skip:
 *   post:
 *     summary: Skip patient
 *     tags: [Queue Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue item ID or Token
 *     responses:
 *       200:
 *         description: Patient skipped
 *       404:
 *         description: Queue entry not found
 */
router.post('/:id/skip', async (req, res) => {
    try {
        const { id } = req.params;
        let queueItem;

        if (mongoose.Types.ObjectId.isValid(id)) {
            queueItem = await Queue.findById(id);
        } else {
            queueItem = await Queue.findOne({
                token: id,
                date: req.body.date || getTodayDateString()
            });
        }

        if (!queueItem) {
            return res.status(404).json({
                success: false,
                message: 'Queue entry not found'
            });
        }

        queueItem.status = 'Skipped';
        await queueItem.save();

        return res.status(200).json({
            success: true,
            message: `Token ${queueItem.token} marked as Skipped`,
            data: queueItem
        });
    } catch (error) {
        console.error('Error skipping patient:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to skip patient',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/{id}/recall:
 *   post:
 *     summary: Recall skipped patient
 *     tags: [Queue Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue item ID or Token
 *     responses:
 *       200:
 *         description: Patient recalled back to Waiting queue
 *       404:
 *         description: Queue entry not found
 */
router.post('/:id/recall', async (req, res) => {
    try {
        const { id } = req.params;
        let queueItem;

        if (mongoose.Types.ObjectId.isValid(id)) {
            queueItem = await Queue.findById(id);
        } else {
            queueItem = await Queue.findOne({
                token: id,
                date: req.body.date || getTodayDateString()
            });
        }

        if (!queueItem) {
            return res.status(404).json({
                success: false,
                message: 'Queue entry not found'
            });
        }

        queueItem.status = 'Waiting';
        await queueItem.save();

        return res.status(200).json({
            success: true,
            message: `Token ${queueItem.token} recalled back to Waiting queue`,
            data: queueItem
        });
    } catch (error) {
        console.error('Error recalling patient:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to recall patient',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/{id}/cancel:
 *   post:
 *     summary: Cancel queue
 *     tags: [Queue Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue item ID or Token
 *     responses:
 *       200:
 *         description: Queue token cancelled
 *       404:
 *         description: Queue entry not found
 */
router.post('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        let queueItem;

        if (mongoose.Types.ObjectId.isValid(id)) {
            queueItem = await Queue.findById(id);
        } else {
            queueItem = await Queue.findOne({
                token: id,
                date: req.body.date || getTodayDateString()
            });
        }

        if (!queueItem) {
            return res.status(404).json({
                success: false,
                message: 'Queue entry not found'
            });
        }

        queueItem.status = 'Cancelled';
        await queueItem.save();

        return res.status(200).json({
            success: true,
            message: `Token ${queueItem.token} has been cancelled`,
            data: queueItem
        });
    } catch (error) {
        console.error('Error cancelling queue entry:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel queue token',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/doctor/{doctorId}:
 *   get:
 *     summary: Doctor's queue
 *     tags: [Queue Management]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor's User ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Date in YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Doctor's queue list and statistics
 */
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        const queryDate = req.query.date || getTodayDateString();

        let filter = { date: queryDate };
        if (mongoose.Types.ObjectId.isValid(doctorId)) {
            filter.doctor = doctorId;
        } else {
            filter.doctorName = new RegExp(doctorId, 'i');
        }

        const queueItems = await Queue.find(filter).sort({ tokenNumber: 1, createdAt: 1 });

        const stats = {
            total: queueItems.length,
            waiting: queueItems.filter(q => q.status === 'Waiting').length,
            inConsultation: queueItems.filter(q => q.status === 'In Consultation').length,
            completed: queueItems.filter(q => q.status === 'Completed').length,
            skipped: queueItems.filter(q => q.status === 'Skipped').length,
            cancelled: queueItems.filter(q => q.status === 'Cancelled').length
        };

        return res.status(200).json({
            success: true,
            doctorId,
            date: queryDate,
            stats,
            data: queueItems
        });
    } catch (error) {
        console.error('Error fetching doctor queue:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor queue',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/queue/patient/{patientId}:
 *   get:
 *     summary: Patient queue history
 *     tags: [Queue Management]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient User ID or Name
 *     responses:
 *       200:
 *         description: Patient queue history records
 */
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        let filter = {};

        if (mongoose.Types.ObjectId.isValid(patientId)) {
            filter.$or = [
                { patient: patientId },
                { patientRef: patientId }
            ];
        } else {
            filter.patientName = new RegExp(patientId, 'i');
        }

        const history = await Queue.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            patientId,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error('Error fetching patient queue history:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch patient queue history',
            error: error.message
        });
    }
});

module.exports = router;
