const express = require('express');
const router = express.Router();
const DischargeSummary = require('../models/DischargeSummary');

/**
 * @swagger
 * components:
 *   schemas:
 *     DischargeSummary:
 *       type: object
 *       required:
 *         - patientName
 *         - diagnosis
 *       properties:
 *         id:
 *           type: string
 *           description: Unique sequential ID (auto-generated)
 *         patientName:
 *           type: string
 *         age:
 *           type: number
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *         admissionDate:
 *           type: string
 *         dischargeDate:
 *           type: string
 *         attendingDoctor:
 *           type: string
 *         diagnosis:
 *           type: string
 *         hospitalCourse:
 *           type: string
 *         advice:
 *           type: string
 *         medications:
 *           type: string
 *         followUpDate:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Draft, Finalized]
 */

/**
 * @swagger
 * /api/discharge-summaries/stats:
 *   get:
 *     summary: Retrieve discharge summary stats
 *     tags: [Discharge Summaries]
 *     responses:
 *       200:
 *         description: Success stats
 */
router.get('/stats', async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const [total, today, finalized] = await Promise.all([
            DischargeSummary.countDocuments(),
            DischargeSummary.countDocuments({ dischargeDate: todayStr }),
            DischargeSummary.countDocuments({ status: 'Finalized' })
        ]);
        return res.json({ success: true, data: { total, today, finalized } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/discharge-summaries:
 *   get:
 *     summary: List all discharge summaries
 *     tags: [Discharge Summaries]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, diagnosis, or physician
 *     responses:
 *       200:
 *         description: List of summaries
 *   post:
 *     summary: Generate a new discharge summary
 *     tags: [Discharge Summaries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DischargeSummary'
 *     responses:
 *       201:
 *         description: Summary generated successfully
 */
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let filter = {};
        if (search) {
            const re = new RegExp(search, 'i');
            filter.$or = [{ id: re }, { patientName: re }, { diagnosis: re }, { attendingDoctor: re }];
        }
        const docs = await DischargeSummary.find(filter).sort({ createdAt: -1 });
        return res.json({ success: true, data: docs, count: docs.length });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { patientName, age, gender, admissionDate, dischargeDate, attendingDoctor, diagnosis, hospitalCourse, advice, medications, followUpDate, status } = req.body;
        if (!patientName || !diagnosis) {
            return res.status(400).json({ success: false, message: 'patientName and diagnosis are required' });
        }

        const count = await DischargeSummary.countDocuments();
        const id = `DS-${String(count + 7001).padStart(4, '0')}`;

        const doc = await DischargeSummary.create({
            id,
            patientName,
            age: Number(age) || 30,
            gender: gender || 'Male',
            admissionDate: admissionDate || new Date().toISOString().split('T')[0],
            dischargeDate: dischargeDate || new Date().toISOString().split('T')[0],
            attendingDoctor: attendingDoctor || 'Dr. Rahul Sharma (Cardiologist)',
            diagnosis,
            hospitalCourse: hospitalCourse || 'Patient responded well to inpatient clinical protocol.',
            advice: advice || 'Follow dietary guidelines and take prescribed medications regularly.',
            medications: medications || 'Prescribed discharge medications listed.',
            followUpDate: followUpDate || 'In 7 Days',
            status: status || 'Finalized'
        });

        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/discharge-summaries/{id}:
 *   get:
 *     summary: Get single discharge summary by ID
 *     tags: [Discharge Summaries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single summary detail
 *   put:
 *     summary: Update a discharge summary
 *     tags: [Discharge Summaries]
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
 *             $ref: '#/components/schemas/DischargeSummary'
 *     responses:
 *       200:
 *         description: Updated summary
 *   delete:
 *     summary: Delete a discharge summary
 *     tags: [Discharge Summaries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted confirmation
 */
router.get('/:id', async (req, res) => {
    try {
        const doc = await DischargeSummary.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Discharge summary not found' });
        return res.json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const doc = await DischargeSummary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ success: false, message: 'Discharge summary not found' });
        return res.json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const doc = await DischargeSummary.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Discharge summary not found' });
        return res.json({ success: true, message: 'Discharge summary deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
