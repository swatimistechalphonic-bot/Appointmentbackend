const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
    {
        appName: {
            type: String,
            default: 'DocAdmin'
        },
        appSubtitle: {
            type: String,
            default: 'Doctor Appointment System'
        },
        logoUrl: {
            type: String,
            default: ''
        },
        faviconUrl: {
            type: String,
            default: ''
        },
        primaryColor: {
            type: String,
            default: '#0066FF'
        },
        contactEmail: {
            type: String,
            default: 'support@docadmin.com'
        },
        contactPhone: {
            type: String,
            default: '+1 (555) 019-2834'
        },
        footerText: {
            type: String,
            default: '© 2026 DocAdmin. All rights reserved.'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Setting', settingSchema);
