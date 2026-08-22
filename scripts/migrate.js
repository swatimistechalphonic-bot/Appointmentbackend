require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connectDB = require('../db');
const Migration = require('../models/Migration');

const migrationsDir = path.join(__dirname, '../migrations');

const runMigrations = async () => {
    try {
        console.log('🚀 Starting Database Migration Runner...');
        await connectDB();

        if (!fs.existsSync(migrationsDir)) {
            fs.mkdirSync(migrationsDir, { recursive: true });
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.js'))
            .sort();

        const executedMigrations = await Migration.find().select('name');
        const executedNames = new Set(executedMigrations.map(m => m.name));

        const pendingFiles = files.filter(file => !executedNames.has(file));

        if (pendingFiles.length === 0) {
            console.log('✨ All migrations are up to date! No pending migrations.');
            process.exit(0);
        }

        const lastMigration = await Migration.findOne().sort({ batch: -1 });
        const nextBatch = (lastMigration ? lastMigration.batch : 0) + 1;

        console.log(`📦 Running Batch #${nextBatch} (${pendingFiles.length} pending migrations)...`);

        for (const file of pendingFiles) {
            const filePath = path.join(migrationsDir, file);
            console.log(`⏳ Executing migration: ${file}...`);
            
            const migrationModule = require(filePath);
            if (typeof migrationModule.up === 'function') {
                await migrationModule.up();
            }

            await Migration.create({
                name: file,
                batch: nextBatch
            });

            console.log(`✅ Completed migration: ${file}`);
        }

        console.log(`🎉 Batch #${nextBatch} executed successfully! All database migrations complete.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration Error:', error);
        process.exit(1);
    }
};

runMigrations();
