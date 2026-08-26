const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        patientName: {
            type: String,
            required: true,
            trim: true
        },
        doctorName: {
            type: String,
            required: true,
            trim: true
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            default: null
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Card', 'UPI', 'Online', 'Insurance', 'Cheque'],
            default: 'Cash'
        },
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
            default: 'Pending'
        },
        transactionId: {
            type: String,
            default: ''
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        description: {
            type: String,
            default: ''
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

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
