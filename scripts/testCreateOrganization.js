const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { registerMicroservices } = require('../microservices/gateway');

try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
    console.warn('DNS setServers failed:', err.message);
}

const app = express();
app.use(cors());
app.use(express.json());
registerMicroservices(app);

async function run() {
    let server;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await new Promise((resolve) => {
            server = app.listen(5113, () => {
                console.log('Test server listening on port 5113');
                resolve();
            });
        });

        console.log('Sending request to create a new organization...');
        const res = await fetch('http://127.0.0.1:5113/api/organizations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'CareSync Test Hospital',
                type: 'hospital',
                address: '456 Healthcare Lane',
                city: 'Delhi',
                state: 'Delhi',
                phone: '+91 11 22334455',
                email: 'contact@caresync-test.in'
            })
        });

        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (server) server.close();
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Organization creation test error:', err);
        if (server) server.close();
        await mongoose.disconnect();
        process.exit(1);
    }
}

run();
