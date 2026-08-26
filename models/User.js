const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        phone: {
            type: String,
            default: ''
        },
        role: {
            type: String,
            enum: ['user', 'doctor', 'admin', 'super_admin', 'receptionist', 'patient'],
            default: 'user'
        },
        bio: {
            type: String,
            default: ''
        },
        specialization: {
            type: String,
            default: ''
        },
        avatar: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        otp: {
            type: String,
            default: null
        },
        otpExpires: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

