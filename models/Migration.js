const mongoose = require('mongoose');

const migrationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        batch: {
            type: Number,
            required: true
        },
        executedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Migration', migrationSchema);
