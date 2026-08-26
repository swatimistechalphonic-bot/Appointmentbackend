require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
    console.warn('DNS setServers failed:', err.message);
}

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/caresync';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // ── Clear existing test data ──────────────────────────────────────────────
    await Promise.all([
      db.collection('users').deleteMany({ email: /caresync-seed/i }),
      db.collection('organizations').deleteMany({ slug: /caresync-demo/i }),
    ]);
    console.log('🧹 Cleared previous seed data');

    // ── Create Demo Organization ──────────────────────────────────────────────
    const org = await db.collection('organizations').insertOne({
      name: 'CareSync Demo Clinic',
      slug: 'caresync-demo-clinic',
      type: 'clinic',
      address: '123 Healthway Blvd, Sector 62',
      city: 'Noida',
      state: 'UP',
      country: 'India',
      phone: '+91 120 4455660',
      email: 'admin@caresync-demo.in',
      subscriptionPlan: 'professional',
      isActive: true,
      settings: { timezone: 'Asia/Kolkata', currency: 'INR', workingHours: '09:00-18:00', workingDays: ['Mon','Tue','Wed','Thu','Fri','Sat'] },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('🏥 Demo organization created:', org.insertedId);

    // ── Create Seeded Users ───────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('Demo@12345', 12);
    const users = await db.collection('users').insertMany([
      {
        name: 'Super Admin',
        email: 'superadmin@caresync-seed.in',
        password: hashedPassword,
        role: 'super_admin',
        phone: '+91 9800000001',
        organization: org.insertedId,
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Admin Swati',
        email: 'admin@caresync-seed.in',
        password: hashedPassword,
        role: 'admin',
        phone: '+91 9800000002',
        organization: org.insertedId,
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Dr. Rahul Sharma',
        email: 'doctor@caresync-seed.in',
        password: hashedPassword,
        role: 'doctor',
        phone: '+91 9800000003',
        specialization: 'General Physician',
        organization: org.insertedId,
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Swati Verma',
        email: 'patient@caresync-seed.in',
        password: hashedPassword,
        role: 'patient',
        phone: '+91 9800000004',
        organization: org.insertedId,
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Riya Receptionist',
        email: 'receptionist@caresync-seed.in',
        password: hashedPassword,
        role: 'receptionist',
        phone: '+91 9800000005',
        organization: org.insertedId,
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log(`👥 ${users.insertedCount} users seeded`);

    console.log('\n─────────────────────────────────────────────────────────');
    console.log('✅ SEED COMPLETE! Demo Credentials (password: Demo@12345)');
    console.log('─────────────────────────────────────────────────────────');
    console.log('  Super Admin  → superadmin@caresync-seed.in');
    console.log('  Admin        → admin@caresync-seed.in');
    console.log('  Doctor       → doctor@caresync-seed.in');
    console.log('  Patient      → patient@caresync-seed.in');
    console.log('  Receptionist → receptionist@caresync-seed.in');
    console.log('─────────────────────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
