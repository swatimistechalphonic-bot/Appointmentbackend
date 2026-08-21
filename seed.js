require('dotenv').config();
if (!process.env.RENDER && process.env.NODE_ENV !== 'production') {
    try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (err) {
        // ignore
    }
}

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

const seedUsers = [
    {
        name: 'Swati Verma',
        email: 'swati@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'user'
    },
    {
        name: 'Dr. Rahul Sharma',
        email: 'dr.rahul@example.com',
        password: 'password123',
        phone: '9811223344',
        role: 'doctor'
    },
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '9900112233',
        role: 'admin'
    }
];

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing collections
        await User.deleteMany();
        await Appointment.deleteMany();
        console.log('Cleared existing users and appointments collections.');

        // Hash passwords and insert users
        const salt = await bcrypt.genSalt(10);
        const createdUsers = [];
        for (let u of seedUsers) {
            u.password = await bcrypt.hash(u.password, salt);
            const userObj = await User.create(u);
            createdUsers.push(userObj);
            console.log(`Inserted user: ${userObj.name} (${userObj.email})`);
        }

        const patient = createdUsers.find(u => u.role === 'user');
        const doctor = createdUsers.find(u => u.role === 'doctor');

        if (patient && doctor) {
            const seedAppointments = [
                {
                    user: patient._id,
                    doctor: doctor._id,
                    doctorName: doctor.name,
                    specialization: 'Cardiologist',
                    date: '2026-08-25',
                    timeSlot: '10:00 AM - 10:30 AM',
                    status: 'confirmed',
                    reason: 'Regular heart checkup',
                    amount: 500,
                    paymentStatus: 'paid'
                },
                {
                    user: patient._id,
                    doctor: doctor._id,
                    doctorName: doctor.name,
                    specialization: 'General Physician',
                    date: '2026-08-28',
                    timeSlot: '02:00 PM - 02:30 PM',
                    status: 'pending',
                    reason: 'Seasonal flu and headache',
                    amount: 300,
                    paymentStatus: 'pending'
                }
            ];

            for (let appt of seedAppointments) {
                await Appointment.create(appt);
                console.log(`Inserted appointment for ${patient.name} with ${doctor.name} on ${appt.date}`);
            }
        }

        console.log('🎉 Sample dummy users & appointments added to MongoDB successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error.message);
        process.exit(1);
    }
};

seedDatabase();
