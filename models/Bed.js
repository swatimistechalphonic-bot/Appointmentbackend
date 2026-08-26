const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
    {
        bedId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        ward: {
            type: String,
            required: [true, 'Ward category/location is required'],
            trim: true
        },
        bedNumber: {
            type: String,
            required: [true, 'Bed number is required'],
            trim: true
        },
        patientName: {
            type: String,
            default: null
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        age: {
            type: Number,
            default: null
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', '—'],
            default: '—'
        },
        doctorName: {
            type: String,
            default: null
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        admitDate: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ['Available', 'Occupied', 'Cleaning'],
            default: 'Available',
            index: true
        },
        diagnosis: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Bed || mongoose.model('Bed', bedSchema);
