const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Medicine name is required'],
            trim: true
        },
        dosage: {
            type: String,
            default: ''
        },
        frequency: {
            type: String,
            default: 'Once daily'
        },
        duration: {
            type: String,
            default: '5 Days'
        },
        instructions: {
            type: String,
            default: 'Post meals'
        }
    },
    { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
    {
        prescriptionId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
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
        age: {
            type: Number,
            default: 30
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', '—'],
            default: 'Female'
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        doctorName: {
            type: String,
            required: [true, 'Doctor name is required'],
            trim: true
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            default: null
        },
        diagnosis: {
            type: String,
            required: [true, 'Clinical diagnosis is required'],
            trim: true
        },
        medicines: {
            type: [medicineItemSchema],
            default: []
        },
        date: {
            type: String,
            required: true,
            index: true
        },
        followUp: {
            type: String,
            default: 'N/A'
        },
        notes: {
            type: String,
            default: 'No additional notes.'
        },
        status: {
            type: String,
            enum: ['Active', 'Completed', 'Cancelled'],
            default: 'Active'
        }
    },
    {
        timestamps: true
    }
);

prescriptionSchema.index({ patientName: 'text', diagnosis: 'text', prescriptionId: 'text' });
prescriptionSchema.index({ date: 1, doctor: 1 });

module.exports = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
