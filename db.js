const mongoose = require('mongoose');

// Only set custom DNS servers in local development environment (avoid breaking Render cloud DNS)
if (!process.env.RENDER && process.env.NODE_ENV !== 'production') {
    try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (err) {
        console.warn('Custom DNS setServers failed, using default DNS:', err.message);
    }
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
        });
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
};

module.exports = connectDB;