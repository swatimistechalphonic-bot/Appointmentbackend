const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Department name is required'],
            trim: true,
            unique: true
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        icon: {
            type: String,
            default: 'Heart'
        },
        headOfDepartment: {
            type: String,
            default: 'Dr. Specialist'
        },
        totalDoctors: {
            type: Number,
            default: 1
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Department', departmentSchema);
