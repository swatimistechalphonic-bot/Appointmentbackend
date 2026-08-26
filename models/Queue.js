const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, 'Token identifier is required'],
            trim: true
        },
        tokenNumber: {
            type: Number,
            required: [true, 'Token number is required']
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        patientRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            default: null
        },
        patientName: {
            type: String,
            required: [true, 'Patient name is required'],
            trim: true
        },
        patientPhone: {
            type: String,
            default: ''
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        doctorName: {
            type: String,
            default: 'General Physician'
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            default: null
        },
        date: {
            type: String,
            required: [true, 'Queue date is required'], // Format: YYYY-MM-DD
            index: true
        },
        timeSlot: {
            type: String,
            default: ''
        },
        checkInTime: {
            type: String,
            default: () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        },
        checkInTimestamp: {
            type: Date,
            default: Date.now
        },
        startTime: {
            type: Date,
            default: null
        },
        endTime: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ['Waiting', 'In Consultation', 'Completed', 'Skipped', 'Cancelled'],
            default: 'Waiting',
            index: true
        },
        priority: {
            type: String,
            enum: ['Normal', 'Urgent', 'Emergency'],
            default: 'Normal'
        },
        notes: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

// Compound index to quickly fetch today's queue for a doctor or clinic
queueSchema.index({ date: 1, status: 1 });
queueSchema.index({ date: 1, doctor: 1 });

module.exports = mongoose.model('Queue', queueSchema);
