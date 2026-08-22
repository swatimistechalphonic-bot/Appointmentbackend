const mongoose = require('mongoose');

module.exports = {
    up: async () => {
        console.log('  ↳ Building MongoDB Collection Indexes for Users, Appointments, Patients, and Departments...');
        const db = mongoose.connection.db;

        // Create indexes on Appointments collection
        await db.collection('appointments').createIndex({ user: 1, createdAt: -1 });
        await db.collection('appointments').createIndex({ status: 1 });
        await db.collection('appointments').createIndex({ date: 1 });

        // Create indexes on Users collection
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ role: 1 });

        // Create indexes on Patients collection
        await db.collection('patients').createIndex({ name: 'text', email: 'text', phone: 'text' });

        // Create indexes on Departments collection
        await db.collection('departments').createIndex({ name: 1 }, { unique: true });

        console.log('  ↳ Mongo Indexes created successfully!');
    },

    down: async () => {
        console.log('  ↳ Dropping indexes...');
    }
};
