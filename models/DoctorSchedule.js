const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  doctorName: {
    type: String,
    required: true
  },
  workingDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  shiftStartTime: {
    type: String,
    default: '09:00 AM'
  },
  shiftEndTime: {
    type: String,
    default: '05:00 PM'
  },
  slotDurationMinutes: {
    type: Number,
    default: 30
  },
  breakStartTime: {
    type: String,
    default: '01:00 PM'
  },
  breakEndTime: {
    type: String,
    default: '02:00 PM'
  },
  maxPatientsPerSlot: {
    type: Number,
    default: 1
  },
  roomNumber: {
    type: String,
    default: 'Room-101'
  },
  status: {
    type: String,
    enum: ['active', 'on-leave', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.models.DoctorSchedule || mongoose.model('DoctorSchedule', doctorScheduleSchema);
