const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Patient name is required'],
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ''
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
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
        bloodGroup: {
            type: String,
            default: 'O+'
        },
        address: {
            type: String,
            default: ''
        },
        medicalHistory: {
            type: String,
            default: ''
        },
        lastVisit: {
            type: String,
            default: 'Today'
        },
        status: {
            type: String,
            enum: ['Approved', 'Pending', 'Cancelled'],
            default: 'Approved'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
