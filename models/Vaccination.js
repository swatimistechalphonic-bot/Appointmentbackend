const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema(
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
            type: String,
            required: [true, 'Age string is required']
        },
        vaccineName: {
            type: String,
            required: [true, 'Vaccine name is required']
        },
        doseNumber: {
            type: String,
            default: 'Dose 1'
        },
        dueDate: {
            type: String,
            required: [true, 'Due date is required']
        },
        administeredDate: {
            type: String,
            default: null
        },
        administeredBy: {
            type: String,
            default: 'Pending Appointment'
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Overdue'],
            default: 'Scheduled'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Vaccination || mongoose.model('Vaccination', vaccinationSchema);
