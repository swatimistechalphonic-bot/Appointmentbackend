const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
    {
        labTestId: {
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
            ref: 'User',
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
        doctorName: {
            type: String,
            required: [true, 'Doctor name is required'],
            trim: true
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        testType: {
            type: String,
            required: [true, 'Test type is required']
        },
        priority: {
            type: String,
            enum: ['Normal', 'Urgent', 'Critical'],
            default: 'Normal'
        },
        requestDate: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
            default: 'Pending'
        },
        parameters: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        flag: {
            type: String,
            enum: ['Normal', 'Abnormal', 'Critical'],
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

module.exports = mongoose.models.LabTest || mongoose.model('LabTest', labTestSchema);
