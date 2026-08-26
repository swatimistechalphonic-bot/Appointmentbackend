const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');

/**
 * @swagger
 * components:
 *   schemas:
 *     LabTest:
 *       type: object
 *       required:
 *         - patientName
 *         - age
 *         - testType
 *         - doctorName
 *       properties:
 *         labTestId:
 *           type: string
 *         patientName:
 *           type: string
 *         age:
 *           type: number
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *         doctorName:
 *           type: string
 *         testType:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [Normal, Urgent, Critical]
 *         requestDate:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Pending, In Progress, Completed, Cancelled]
 *         parameters:
 *           type: object
 *         flag:
 *           type: string
 *           enum: [Normal, Abnormal, Critical]
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/labs/stats:
 *   get:
 *     summary: Retrieve lab test stats
 *     tags: [Lab Tests]
 *     responses:
 *       200:
 *         description: Success stats
 */
router.get('/stats', async (req, res) => {
    try {
        const [total, pending, inProgress, completed, cancelled] = await Promise.all([
            LabTest.countDocuments(),
            LabTest.countDocuments({ status: 'Pending' }),
            LabTest.countDocuments({ status: 'In Progress' }),
            LabTest.countDocuments({ status: 'Completed' }),
            LabTest.countDocuments({ status: 'Cancelled' }),
        ]);
        return res.json({ success: true, data: { total, pending, inProgress, completed, cancelled } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/labs:
 *   get:
 *     summary: List all lab tests with optional filters
 *     tags: [Lab Tests]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [All, Pending, In Progress, Completed, Cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [All, Normal, Urgent, Critical]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of lab tests
 *   post:
 *     summary: Create a new lab test order
 *     tags: [Lab Tests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabTest'
 *     responses:
 *       201:
 *         description: Created order
 */
router.get('/', async (req, res) => {
    try {
        const { search, status, priority, date } = req.query;
        let filter = {};
        if (search) {
            const re = new RegExp(search, 'i');
            filter.$or = [{ labTestId: re }, { patientName: re }, { testType: re }, { doctorName: re }];
        }
        if (status && status !== 'All') filter.status = status;
        if (priority && priority !== 'All') filter.priority = priority;
        if (date) filter.requestDate = date;

        const labs = await LabTest.find(filter).sort({ createdAt: -1 });
        return res.json({ success: true, data: labs, count: labs.length });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { patientName, age, gender, doctorName, testType, priority, patient, doctor } = req.body;
        if (!patientName || !age || !testType || !doctorName) {
            return res.status(400).json({ success: false, message: 'patientName, age, testType, and doctorName are required' });
        }

        const count = await LabTest.countDocuments();
        const year = new Date().getFullYear();
        const labTestId = `LAB-${year}-${String(count + 1).padStart(3, '0')}`;
        const requestDate = new Date().toISOString().split('T')[0];

        const lab = await LabTest.create({
            labTestId,
            patientName,
            patient: patient || null,
            age,
            gender,
            doctorName,
            doctor: doctor || null,
            testType,
            priority: priority || 'Normal',
            requestDate,
            status: 'Pending',
            parameters: {},
            flag: 'Normal'
        });

        return res.status(201).json({ success: true, data: lab });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/labs/{id}:
 *   get:
 *     summary: Get single lab test details
 *     tags: [Lab Tests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success lab
 *   put:
 *     summary: Update lab test result/status
 *     tags: [Lab Tests]
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
 *             $ref: '#/components/schemas/LabTest'
 *     responses:
 *       200:
 *         description: Lab test updated
 *   delete:
 *     summary: Cancel/Delete a lab test order
 *     tags: [Lab Tests]
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
        const lab = await LabTest.findById(req.params.id);
        if (!lab) return res.status(404).json({ success: false, message: 'Lab test not found' });
        return res.json({ success: true, data: lab });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const lab = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!lab) return res.status(404).json({ success: false, message: 'Lab test not found' });
        return res.json({ success: true, data: lab });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const lab = await LabTest.findByIdAndDelete(req.params.id);
        if (!lab) return res.status(404).json({ success: false, message: 'Lab test not found' });
        return res.json({ success: true, message: 'Lab test deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
