const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        serviceId: {
            type: String,
            unique: true,
            trim: true,
            index: true
        },
        name: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true
        },
        category: {
            type: String,
            default: 'General',
            enum: ['General', 'Cardiology', 'Orthopedics', 'Neurology', 'Gynecology', 'Radiology', 'Pathology', 'Dental', 'Emergency']
        },
        price: {
            type: Number,
            required: [true, 'Service price is required'],
            min: 0
        },
        duration: {
            type: Number,        // in minutes
            default: null
        },
        description: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);
