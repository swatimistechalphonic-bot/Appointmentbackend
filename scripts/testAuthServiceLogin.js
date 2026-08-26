const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authService = require('../microservices/auth-service');

try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
    console.warn('DNS setServers failed:', err.message);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authService.router);

async function run() {
    let server;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await new Promise((resolve) => {
            server = app.listen(5112, () => {
                console.log('Test auth-service server listening on port 5112');
                resolve();
            });
        });

        console.log('Sending login request for superadmin to auth-service...');
        const res = await fetch('http://127.0.0.1:5112/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@caresync-seed.in',
                password: 'Demo@12345'
            })
        });

        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (server) server.close();
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Server/API error:', err);
        if (server) server.close();
        await mongoose.disconnect();
        process.exit(1);
    }
}

run();
