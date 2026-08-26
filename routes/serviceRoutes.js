const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         serviceId:
 *           type: string
 *         name:
 *           type: string
 *         category:
 *           type: string
 *           enum: [General, Cardiology, Orthopedics, Neurology, Gynecology, Radiology, Pathology, Dental, Emergency]
 *         price:
 *           type: number
 *         duration:
 *           type: number
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/services/stats:
 *   get:
 *     summary: Retrieve hospital service stats
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Success stats
 */
router.get('/stats', async (req, res) => {
    try {
        const [total, active, inactive] = await Promise.all([
            Service.countDocuments(),
            Service.countDocuments({ isActive: true }),
            Service.countDocuments({ isActive: false }),
        ]);
        const allServices = await Service.find({}, 'price');
        const totalRevenue = allServices.reduce((sum, s) => sum + (s.price || 0), 0);
        return res.json({ success: true, data: { total, active, inactive, totalRevenue } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: List all hospital services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [All, General, Cardiology, Orthopedics, Neurology, Gynecology, Radiology, Pathology, Dental, Emergency]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [All, Active, Inactive]
 *     responses:
 *       200:
 *         description: List of services
 *   post:
 *     summary: Add a new clinical service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created
 */
router.get('/', async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let filter = {};
        if (search) {
            filter.name = new RegExp(search, 'i');
        }
        if (category && category !== 'All') filter.category = category;
        if (status === 'Active') filter.isActive = true;
        if (status === 'Inactive') filter.isActive = false;

        const services = await Service.find(filter).sort({ name: 1 });
        return res.json({ success: true, data: services, count: services.length });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, category, price, duration, description, isActive } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ success: false, message: 'name and price are required' });
        }

        const count = await Service.countDocuments();
        const serviceId = `SRV-${String(count + 1).padStart(3, '0')}`;

        const service = await Service.create({
            serviceId,
            name,
            category: category || 'General',
            price: Number(price),
            duration: duration ? Number(duration) : null,
            description: description || '',
            isActive: isActive !== undefined ? isActive : true
        });

        return res.status(201).json({ success: true, data: service });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get single service detail
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success service detail
 *   put:
 *     summary: Update service configuration
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated
 *   delete:
 *     summary: Delete a hospital service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted
 */
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        return res.json({ success: true, data: service });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        return res.json({ success: true, data: service });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        return res.json({ success: true, message: 'Service deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
