const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required']
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Doctor ID is required']
        },
        doctorName: {
            type: String,
            default: ''
        },
        specialization: {
            type: String,
            default: ''
        },
        date: {
            type: String,
            required: [true, 'Appointment date is required']
        },
        timeSlot: {
            type: String,
            required: [true, 'Time slot is required']
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending'
        },
        reason: {
            type: String,
            default: ''
        },
        notes: {
            type: String,
            default: ''
        },
        amount: {
            type: Number,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
