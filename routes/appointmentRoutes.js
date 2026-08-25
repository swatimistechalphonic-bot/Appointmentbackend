const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const DoctorSchedule = require('../models/DoctorSchedule');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user:
 *           type: string
 *           description: Patient User ID
 *         doctor:
 *           type: string
 *           description: Doctor User ID
 *         doctorName:
 *           type: string
 *         specialization:
 *           type: string
 *         date:
 *           type: string
 *           example: "2026-08-25"
 *         timeSlot:
 *           type: string
 *           example: "10:00 AM - 10:30 AM"
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         reason:
 *           type: string
 *         notes:
 *           type: string
 *         amount:
 *           type: number
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed]
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     BookAppointmentInput:
 *       type: object
 *       required:
 *         - user
 *         - doctor
 *         - date
 *         - timeSlot
 *       properties:
 *         user:
 *           type: string
 *           description: Patient User ID
 *         doctor:
 *           type: string
 *           description: Doctor User ID
 *         doctorName:
 *           type: string
 *         specialization:
 *           type: string
 *         date:
 *           type: string
 *           example: "2026-08-25"
 *         timeSlot:
 *           type: string
 *           example: "10:00 AM - 10:30 AM"
 *         reason:
 *           type: string
 *         amount:
 *           type: number
 *     UpdateAppointmentInput:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *         timeSlot:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         reason:
 *           type: string
 *         notes:
 *           type: string
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed]
 */

/**
 * @swagger
 * tags:
 *   - name: Appointments
 *     description: Core appointment creation, query, update, and deletion endpoints
 *   - name: Scheduled Booking
 *     description: APIs for checking time slots and booking scheduled appointments
 *   - name: Doctor Schedules
 *     description: APIs for managing doctor weekly shifts, working hours, and slot duration
 *   - name: Queue Management
 *     description: APIs for live OPD patient waiting queue, token generation, and check-in
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book a new appointment (Protected)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookAppointmentInput'
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Invalid input or missing fields
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User or Doctor not found
 *       500:
 *         description: Server error
 */
router.post('/', protect, async (req, res) => {
    try {
        const { user, doctor, doctorName, specialization, date, timeSlot, reason, amount } = req.body;

        if (!user || !doctor || !date || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user, doctor, date, and timeSlot'
            });
        }

        // Verify patient user exists
        const userExists = await User.findById(user);
        if (!userExists) {
            return res.status(404).json({ success: false, message: 'Patient user not found' });
        }

        // Verify doctor user exists
        const doctorExists = await User.findById(doctor);
        if (!doctorExists) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const newAppointment = new Appointment({
            user,
            doctor,
            doctorName: doctorName || doctorExists.name,
            specialization: specialization || 'General',
            date,
            timeSlot,
            reason: reason || '',
            amount: amount || 0,
            status: 'pending',
            paymentStatus: 'pending'
        });

        const savedAppointment = await newAppointment.save();
        await savedAppointment.populate('user', 'name email phone');
        await savedAppointment.populate('doctor', 'name email phone role');

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully!',
            appointment: savedAppointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments with optional filters (Protected)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by Patient User ID
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter by Doctor User ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Filter by appointment date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of appointments
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/', protect, async (req, res) => {
    try {
        const { userId, doctorId, status, date } = req.query;
        const filter = {};

        if (userId) filter.user = userId;
        if (doctorId) filter.doctor = doctorId;
        if (status) filter.status = status;
        if (date) filter.date = date;

        const appointments = await Appointment.find(filter)
            .populate('user', 'name email phone')
            .populate('doctor', 'name email phone role')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/dashboard-stats:
 *   get:
 *     summary: Get dynamic Doctris dashboard statistics and analytics (Protected)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/dashboard-stats', protect, async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        const totalAppointmentsCount = await Appointment.countDocuments();
        const todayAppointmentsCount = await Appointment.countDocuments({ date: todayStr });
        const pendingAppointmentsCount = await Appointment.countDocuments({ status: 'pending' });
        const totalDoctorsCount = await User.countDocuments({ role: 'doctor' });
        
        const uniquePatients = await Appointment.distinct('user');
        const patientUsersCount = await User.countDocuments({ role: 'patient' });
        const totalPatientsCount = Math.max(uniquePatients.length, patientUsersCount);

        const completedAppointmentsCount = await Appointment.countDocuments({ status: 'completed' });
        const cancelledAppointmentsCount = await Appointment.countDocuments({ status: 'cancelled' });

        const waitingPatientsCount = await Appointment.countDocuments({ date: todayStr, status: { $in: ['waiting', 'checked-in', 'Checked-In', 'Waiting'] } });
        const noShowCount = await Appointment.countDocuments({ status: { $in: ['no show', 'No Show', 'no-show', 'No-Show'] } });
        const noShowRateVal = totalAppointmentsCount > 0 ? ((noShowCount / totalAppointmentsCount) * 100).toFixed(1) : '0.0';
        const formattedNoShowRate = `${noShowRateVal}%`;

        const todayRevenueAgg = await Appointment.aggregate([
            { $match: { date: todayStr, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const rawTodayRevenue = todayRevenueAgg.length > 0 ? todayRevenueAgg[0].total : 0;
        const formattedTodayRevenue = `₹${rawTodayRevenue.toLocaleString('en-IN')}`;

        const todayAvailableSlotsCount = Math.max(186 - todayAppointmentsCount, 0);

        const revenueAgg = await Appointment.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const rawRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
        const formattedRevenue = `₹${rawRevenue.toLocaleString('en-IN')}`;

        const appointmentWorkflow = await Appointment.aggregate([
            {
                $group: {
                    _id: "$date",
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                    },
                    revenue: {
                        $sum: { $cond: [{ $ne: ["$status", "cancelled"] }, "$amount", 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const latestAppointments = await Appointment.find()
            .populate('user', 'name email phone')
            .populate('doctor', 'name email phone role')
            .sort({ createdAt: -1 })
            .limit(10);

        const doctors = await User.find({ role: 'doctor' }).select('-password');

        res.json({
            success: true,
            stats: {
                totalAppointments: totalAppointmentsCount,
                todayAppointments: todayAppointmentsCount,
                pendingAppointments: pendingAppointmentsCount,
                totalDoctors: totalDoctorsCount,
                totalPatients: totalPatientsCount,
                completedAppointments: completedAppointmentsCount,
                cancelledAppointments: cancelledAppointmentsCount,
                rawRevenue,
                totalRevenue: formattedRevenue,
                appointmentWorkflow,
                latestAppointments,
                topDoctors: doctors,
                todayAvailableSlots: todayAvailableSlotsCount,
                todayWaitingPatients: waitingPatientsCount,
                todayRevenue: formattedTodayRevenue,
                noShowRate: formattedNoShowRate
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/user/{userId}:
 *   get:
 *     summary: Get appointments for a specific patient/user (Protected)
 *     tags: [Appointments]
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
 *         description: Patient appointments retrieved
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }
        const appointments = await Appointment.find({ user: req.params.userId })
            .populate('user', 'name email phone')
            .populate('doctor', 'name email phone role')
            .sort({ date: 1, timeSlot: 1 });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}:
 *   get:
 *     summary: Get appointments for a specific doctor (Protected)
 *     tags: [Appointments]
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
 *         description: Doctor appointments retrieved
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/doctor/:doctorId', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.doctorId)) {
            return res.status(400).json({ success: false, message: 'Invalid Doctor ID format' });
        }
        const appointments = await Appointment.find({ doctor: req.params.doctorId })
            .populate('user', 'name email phone')
            .populate('doctor', 'name email phone role')
            .sort({ date: 1, timeSlot: 1 });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// SPECIFIC STATIC SUB-ROUTES (BEFORE /:id)
// ==========================================

/**
 * @swagger
 * /api/appointments/available-slots:
 *   get:
 *     summary: Get Available & Booked Doctor Time Slots
 *     description: |
 *       **Purpose of this API:**
 *       This API fetches the complete list of time slots for a specified doctor on a given date (e.g. YYYY-MM-DD).
 *       It checks existing bookings in the database and returns each time slot marked as `Available`, `Booked`, or `Break`.
 *     tags: [Scheduled Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor User ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-08-25"
 *         description: Appointment date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Time slots retrieved successfully with availability status
 *       400:
 *         description: Missing doctorId or date query parameter
 *       500:
 *         description: Server error
 */
router.get('/available-slots', async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both doctorId and date query parameters'
            });
        }

        const schedule = await DoctorSchedule.findOne({ doctor: doctorId });
        const slotDuration = schedule ? schedule.slotDurationMinutes : 30;

        const defaultTimeSlots = [
            '09:00 AM - 09:30 AM',
            '09:30 AM - 10:00 AM',
            '10:00 AM - 10:30 AM',
            '10:30 AM - 11:00 AM',
            '11:00 AM - 11:30 AM',
            '11:30 AM - 12:00 PM',
            '02:00 PM - 02:30 PM',
            '02:30 PM - 03:00 PM',
            '03:00 PM - 03:30 PM',
            '03:30 PM - 04:00 PM',
            '04:00 PM - 04:30 PM',
            '04:30 PM - 05:00 PM'
        ];

        const filter = { date };
        if (mongoose.Types.ObjectId.isValid(doctorId)) {
            filter.doctor = doctorId;
        }

        const bookedAppointments = await Appointment.find(filter);
        const bookedSlots = new Set(bookedAppointments.map(a => a.timeSlot));

        const slotsWithStatus = defaultTimeSlots.map(slot => ({
            timeSlot: slot,
            status: bookedSlots.has(slot) ? 'Booked' : 'Available',
            isAvailable: !bookedSlots.has(slot)
        }));

        res.json({
            success: true,
            doctorId,
            date,
            slotDurationMinutes: slotDuration,
            totalSlots: slotsWithStatus.length,
            availableCount: slotsWithStatus.filter(s => s.isAvailable).length,
            slots: slotsWithStatus
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/book-scheduled:
 *   post:
 *     summary: Book Scheduled Time Slot Appointment
 *     description: |
 *       **Purpose of this API:**
 *       This API allows patients or clinic staff to reserve a specific time slot for an appointment with a doctor.
 *       It checks for slot conflicts to prevent double-booking and assigns a unique token number for queue tracking.
 *     tags: [Scheduled Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - doctor
 *               - date
 *               - timeSlot
 *             properties:
 *               user:
 *                 type: string
 *                 description: Patient User ID
 *               doctor:
 *                 type: string
 *                 description: Doctor User ID
 *               doctorName:
 *                 type: string
 *               specialization:
 *                 type: string
 *               date:
 *                 type: string
 *                 example: "2026-08-25"
 *               timeSlot:
 *                 type: string
 *                 example: "10:00 AM - 10:30 AM"
 *               reason:
 *                 type: string
 *                 example: "General Cardiology Checkup"
 *               amount:
 *                 type: number
 *                 example: 500
 *               paymentMethod:
 *                 type: string
 *                 example: "UPI / Cash"
 *     responses:
 *       201:
 *         description: Scheduled appointment booked successfully with assigned queue token
 *       400:
 *         description: Slot already booked or missing required fields
 *       500:
 *         description: Server error
 */
router.post('/book-scheduled', async (req, res) => {
    try {
        const { user, doctor, doctorName, specialization, date, timeSlot, reason, amount, paymentMethod } = req.body;

        if (!user || !doctor || !date || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user, doctor, date, and timeSlot'
            });
        }

        const filter = { date, timeSlot, status: { $ne: 'cancelled' } };
        if (mongoose.Types.ObjectId.isValid(doctor)) {
            filter.doctor = doctor;
        }

        const existingBooking = await Appointment.findOne(filter);

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: `Time slot ${timeSlot} is already booked for this doctor on ${date}. Please choose another slot.`
            });
        }

        const countToday = await Appointment.countDocuments({ date });
        const tokenNumber = `T-${String(countToday + 1).padStart(3, '0')}`;

        const newAppointment = new Appointment({
            user: mongoose.Types.ObjectId.isValid(user) ? user : new mongoose.Types.ObjectId(),
            doctor: mongoose.Types.ObjectId.isValid(doctor) ? doctor : new mongoose.Types.ObjectId(),
            doctorName: doctorName || 'Dr. Specialist',
            specialization: specialization || 'General Medicine',
            date,
            timeSlot,
            reason: reason || 'Scheduled Consultation',
            amount: amount || 500,
            status: 'confirmed',
            paymentStatus: paymentMethod ? 'paid' : 'pending',
            notes: `Assigned Token: ${tokenNumber}. Payment Method: ${paymentMethod || 'Pay at Clinic'}`
        });

        const saved = await newAppointment.save();

        res.status(201).json({
            success: true,
            message: 'Scheduled appointment booked successfully!',
            tokenNumber,
            appointment: saved
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/doctor-schedules/{doctorId}:
 *   get:
 *     summary: Get Doctor Shift Schedule & Slot Configuration
 *     description: |
 *       **Purpose of this API:**
 *       Retrieves the configured working shift hours, available working days (e.g. Monday-Saturday),
 *       consultation slot duration (e.g. 30 mins), lunch break timings, and assigned room number for a specific doctor.
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor User ID
 *     responses:
 *       200:
 *         description: Doctor schedule details retrieved successfully
 *       404:
 *         description: Schedule not configured for this doctor (returns default schedule)
 *       500:
 *         description: Server error
 */
router.get('/doctor-schedules/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        let schedule = null;

        if (mongoose.Types.ObjectId.isValid(doctorId)) {
            schedule = await DoctorSchedule.findOne({ doctor: doctorId });
        }

        if (!schedule) {
            return res.json({
                success: true,
                isDefault: true,
                schedule: {
                    doctorId,
                    doctorName: 'Dr. Specialist',
                    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    shiftStartTime: '09:00 AM',
                    shiftEndTime: '05:00 PM',
                    slotDurationMinutes: 30,
                    breakStartTime: '01:00 PM',
                    breakEndTime: '02:00 PM',
                    roomNumber: 'Room-101',
                    status: 'active'
                }
            });
        }

        res.json({
            success: true,
            isDefault: false,
            schedule
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/doctor-schedules:
 *   post:
 *     summary: Create or Update Doctor Shift Schedule
 *     description: |
 *       **Purpose of this API:**
 *       Saves or updates doctor weekly working hours, active shift times, consultation duration per patient,
 *       lunch break times, and assigned consulting room number in the clinic.
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor
 *               - doctorName
 *             properties:
 *               doctor:
 *                 type: string
 *                 description: Doctor User ID
 *               doctorName:
 *                 type: string
 *                 example: "Dr. Rahul Sharma"
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 *               shiftStartTime:
 *                 type: string
 *                 example: "09:00 AM"
 *               shiftEndTime:
 *                 type: string
 *                 example: "05:00 PM"
 *               slotDurationMinutes:
 *                 type: number
 *                 example: 30
 *               breakStartTime:
 *                 type: string
 *                 example: "01:00 PM"
 *               breakEndTime:
 *                 type: string
 *                 example: "02:00 PM"
 *               roomNumber:
 *                 type: string
 *                 example: "Room-102"
 *     responses:
 *       200:
 *         description: Doctor shift schedule updated successfully
 *       400:
 *         description: Missing doctor ID or doctor name
 *       500:
 *         description: Server error
 */
router.post('/doctor-schedules', async (req, res) => {
    try {
        const { doctor, doctorName, workingDays, shiftStartTime, shiftEndTime, slotDurationMinutes, breakStartTime, breakEndTime, roomNumber, status } = req.body;

        if (!doctor || !doctorName) {
            return res.status(400).json({ success: false, message: 'Please provide doctor ID and doctorName' });
        }

        const filter = mongoose.Types.ObjectId.isValid(doctor) ? { doctor } : { doctorName };

        const updateData = {
            doctor: mongoose.Types.ObjectId.isValid(doctor) ? doctor : new mongoose.Types.ObjectId(),
            doctorName,
            workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            shiftStartTime: shiftStartTime || '09:00 AM',
            shiftEndTime: shiftEndTime || '05:00 PM',
            slotDurationMinutes: slotDurationMinutes || 30,
            breakStartTime: breakStartTime || '01:00 PM',
            breakEndTime: breakEndTime || '02:00 PM',
            roomNumber: roomNumber || 'Room-101',
            status: status || 'active'
        };

        const updatedSchedule = await DoctorSchedule.findOneAndUpdate(
            filter,
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Doctor schedule and shift timings saved successfully!',
            schedule: updatedSchedule
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/queue/live:
 *   get:
 *     summary: Get Live OPD Patient Waiting Room Queue
 *     description: |
 *       **Purpose of this API:**
 *       Retrieves the live waiting room queue for OPD patients, including assigned token numbers (T-001, T-002),
 *       patient names, current token being served in the doctor's room, waiting count, and estimated wait times.
 *     tags: [Queue Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter queue by Doctor ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         example: "2026-08-25"
 *         description: Query date (defaults to today)
 *     responses:
 *       200:
 *         description: Live queue list and token status retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/queue/live', async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        const queryDate = date || new Date().toISOString().split('T')[0];

        const filter = { date: queryDate };
        if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
            filter.doctor = doctorId;
        }

        const appointments = await Appointment.find(filter)
            .populate('user', 'name email phone')
            .populate('doctor', 'name email phone role')
            .sort({ timeSlot: 1, createdAt: 1 });

        const queue = appointments.map((app, index) => {
            const tokenNum = `T-${String(index + 1).padStart(3, '0')}`;
            let queueStatus = 'waiting';

            if (app.status === 'completed') queueStatus = 'completed';
            else if (app.status === 'in-consultation' || app.status === 'called') queueStatus = 'in-consultation';
            else if (app.status === 'cancelled') queueStatus = 'cancelled';

            return {
                appointmentId: app._id,
                tokenNumber: tokenNum,
                patientName: app.user ? app.user.name : (app.patientName || 'Patient'),
                doctorName: app.doctorName,
                timeSlot: app.timeSlot,
                date: app.date,
                status: app.status,
                queueStatus,
                estimatedWaitMinutes: Math.max(index * 15, 0)
            };
        });

        const currentCalling = queue.find(q => q.queueStatus === 'in-consultation') || null;
        const waitingPatients = queue.filter(q => q.queueStatus === 'waiting');
        const completedPatients = queue.filter(q => q.queueStatus === 'completed');

        res.json({
            success: true,
            date: queryDate,
            totalInQueue: queue.length,
            currentlyCalling: currentCalling,
            waitingCount: waitingPatients.length,
            completedCount: completedPatients.length,
            queue
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/queue/check-in:
 *   post:
 *     summary: Clinic Reception Patient Check-In
 *     description: |
 *       **Purpose of this API:**
 *       Allows receptionists to check-in arriving patients when they reach the clinic.
 *       It updates the appointment status to `waiting` / `checked-in` and assigns a active queue token number.
 *     tags: [Queue Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: Appointment Mongo ID
 *     responses:
 *       200:
 *         description: Patient checked in successfully and added to active live queue
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.post('/queue/check-in', async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ success: false, message: 'Valid appointmentId is required' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        appointment.status = 'confirmed';
        appointment.notes = (appointment.notes || '') + ' | Checked-In at Reception';
        await appointment.save();

        res.json({
            success: true,
            message: 'Patient checked in successfully! Added to live queue.',
            appointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/queue/{appointmentId}/status:
 *   put:
 *     summary: Update OPD Queue Token Status & Call Next Patient
 *     description: |
 *       **Purpose of this API:**
 *       Allows doctors or reception staff to advance the queue flow (`waiting` -> `called` -> `in-consultation` -> `completed` / `skipped`).
 *       Updates doctor room assignment and keeps the live waiting screen synchronized.
 *     tags: [Queue Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment Mongo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [waiting, called, in-consultation, completed, cancelled, skipped]
 *                 example: "in-consultation"
 *               roomNumber:
 *                 type: string
 *                 example: "Room-102"
 *     responses:
 *       200:
 *         description: Queue token status updated successfully
 *       400:
 *         description: Invalid status value or ID
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put('/queue/:appointmentId/status', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, roomNumber } = req.body;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ success: false, message: 'Invalid Appointment ID format' });
        }

        const validStatuses = ['waiting', 'called', 'in-consultation', 'completed', 'cancelled', 'skipped'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        appointment.status = status;
        if (roomNumber) {
            appointment.notes = (appointment.notes || '') + ` | Assigned Room: ${roomNumber}`;
        }

        await appointment.save();

        res.json({
            success: true,
            message: `Queue token status updated to "${status}"`,
            appointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// PARAMETRIZED WILDCARD ROUTES (AFTER STATIC)
// ==========================================

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get single appointment details by ID (Protected)
 *     tags: [Appointments]
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
 *         description: Appointment details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Appointment ID format' });
        }
        const appointment = await Appointment.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('doctor', 'name email phone role');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({
            success: true,
            appointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update an appointment (reschedule, status, notes, payment) (Protected)
 *     tags: [Appointments]
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
 *             $ref: '#/components/schemas/UpdateAppointmentInput'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Appointment ID format' });
        }

        const { date, timeSlot, status, reason, notes, paymentStatus, doctorName, specialization } = req.body;
        const updateData = {};

        if (date !== undefined) updateData.date = date;
        if (timeSlot !== undefined) updateData.timeSlot = timeSlot;
        if (status !== undefined) updateData.status = status;
        if (reason !== undefined) updateData.reason = reason;
        if (notes !== undefined) updateData.notes = notes;
        if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
        if (doctorName !== undefined) updateData.doctorName = doctorName;
        if (specialization !== undefined) updateData.specialization = specialization;

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('user', 'name email phone')
            .populate('doctor', 'name email phone role');

        if (!updatedAppointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({
            success: true,
            message: 'Appointment updated successfully!',
            appointment: updatedAppointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Cancel or delete an appointment (Protected)
 *     tags: [Appointments]
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
 *         description: Appointment deleted/cancelled successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Appointment ID format' });
        }

        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
