const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');

try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
    console.warn('DNS setServers failed:', err.message);
}

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'superadmin@caresync-seed.in';
        const password = 'Demo@12345';

        const user = await User.findOne({ email });
        if (!user) {
            console.error('❌ User not found in database!');
            process.exit(1);
        }

        console.log('User found:', {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log('✅ Password match: SUCCESS');
        } else {
            console.error('❌ Password match: FAILED');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Test error:', err);
        process.exit(1);
    }
}

test();
