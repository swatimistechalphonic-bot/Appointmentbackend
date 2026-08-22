const User = require('../models/User');
const bcrypt = require('bcrypt');

const defaultDoctors = [
    { name: 'Dr. Rahul Sharma', email: 'rahul@doctris.com', phone: '9811223344', role: 'doctor', specialization: 'General Physician', bio: 'Compassionate General Physician managing acute illness and routine wellness.' },
    { name: 'Dr. Calvin Carlo', email: 'calvin@doctris.com', phone: '9822334455', role: 'doctor', specialization: 'Orthopedic Specialist', bio: 'Senior Orthopedic surgeon specializing in joint replacement.' },
    { name: 'Dr. Cristino Murphy', email: 'cristino@doctris.com', phone: '9833445566', role: 'doctor', specialization: 'Gynecology & Obstetrics', bio: 'Expert Obstetrician focusing on women reproductive health.' },
    { name: 'Dr. Alia Reddy', email: 'alia@doctris.com', phone: '9844556677', role: 'doctor', specialization: 'Psychotherapy & Mental Health', bio: 'Licensed Psychiatrist specialized in cognitive behavioral therapy.' }
];

module.exports = {
    up: async () => {
        console.log('  ↳ Seeding default Doctor accounts...');
        const hashedPassword = await bcrypt.hash('doctor123', 10);

        for (const doc of defaultDoctors) {
            await User.updateOne(
                { email: doc.email },
                { $setOnInsert: { ...doc, password: hashedPassword } },
                { upsert: true }
            );
        }
        console.log('  ↳ Default Doctor Accounts Migration complete!');
    },

    down: async () => {
        console.log('  ↳ Removing seeded doctors...');
    }
};
