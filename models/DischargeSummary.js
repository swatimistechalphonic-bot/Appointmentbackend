const mongoose = require('mongoose');

const dischargeSummarySchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        patientName: {
            type: String,
            required: [true, 'Patient name is required'],
            trim: true
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            default: null
        },
        age: {
            type: Number,
            required: [true, 'Age is required']
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            default: 'Male'
        },
        admissionDate: {
            type: String,
            required: [true, 'Admission date is required']
        },
        dischargeDate: {
            type: String,
            required: [true, 'Discharge date is required']
        },
        attendingDoctor: {
            type: String,
            required: [true, 'Attending doctor is required'],
            trim: true
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        diagnosis: {
            type: String,
            required: [true, 'Diagnosis is required'],
            trim: true
        },
        hospitalCourse: {
            type: String,
            default: ''
        },
        advice: {
            type: String,
            default: ''
        },
        medications: {
            type: String,
            default: ''
        },
        followUpDate: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['Draft', 'Finalized'],
            default: 'Finalized'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.DischargeSummary || mongoose.model('DischargeSummary', dischargeSummarySchema);
