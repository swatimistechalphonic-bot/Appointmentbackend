const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect } = require('../middleware/auth');

// Seed default system settings if none exist
const defaultSettings = {
    appName: 'DocAdmin',
    appSubtitle: 'Doctor Appointment System',
    logoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
    faviconUrl: '',
    primaryColor: '#0066FF',
    contactEmail: 'support@docadmin.com',
    contactPhone: '+1 (555) 019-2834',
    footerText: '© 2026 DocAdmin. All rights reserved.'
};

const seedSettings = async () => {
    try {
        const settings = await Setting.findOne();
        if (!settings) {
            await Setting.create(defaultSettings);
            console.log('✅ Default System Settings & Dynamic Logo Seeded Successfully');
        } else if (!settings.logoUrl) {
            settings.logoUrl = defaultSettings.logoUrl;
            await settings.save();
        }
    } catch (err) {
        console.error('Settings seed error:', err.message);
    }
};

seedSettings();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Fetch system settings and dynamic logo URL
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: System settings retrieved
 */
router.get('/', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create(defaultSettings);
        } else if (!settings.logoUrl) {
            settings.logoUrl = defaultSettings.logoUrl;
            await settings.save();
        }

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update global system settings and dynamic app logo (Protected)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appName:
 *                 type: string
 *               appSubtitle:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               faviconUrl:
 *                 type: string
 *               primaryColor:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               footerText:
 *                 type: string
 *     responses:
 *       200:
 *         description: System settings and dynamic logo updated successfully
 *       401:
 *         description: Not authorized
 */
router.put('/', protect, async (req, res) => {
    try {
        const { appName, appSubtitle, logoUrl, faviconUrl, primaryColor, contactEmail, contactPhone, footerText } = req.body;

        const updateData = {};
        if (appName !== undefined) updateData.appName = appName;
        if (appSubtitle !== undefined) updateData.appSubtitle = appSubtitle;
        if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
        if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl;
        if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
        if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
        if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
        if (footerText !== undefined) updateData.footerText = footerText;

        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({ ...defaultSettings, ...updateData });
        } else {
            settings = await Setting.findByIdAndUpdate(
                settings._id,
                { $set: updateData },
                { new: true, runValidators: true }
            );
        }

        res.json({
            success: true,
            message: 'System settings and dynamic logo updated successfully!',
            settings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
