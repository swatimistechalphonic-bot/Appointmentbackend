const express = require('express');
const router = express.Router();
const Bed = require('../models/Bed');

/**
 * @swagger
 * components:
 *   schemas:
 *     Bed:
 *       type: object
 *       required:
 *         - ward
 *         - bedNumber
 *       properties:
 *         bedId:
 *           type: string
 *         ward:
 *           type: string
 *         bedNumber:
 *           type: string
 *         patientName:
 *           type: string
 *         age:
 *           type: number
 *         gender:
 *           type: string
 *         doctorName:
 *           type: string
 *         admitDate:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Available, Occupied, Cleaning]
 *         diagnosis:
 *           type: string
 */

/**
 * @swagger
 * /api/beds/stats:
 *   get:
 *     summary: Retrieve bed occupancy stats
 *     tags: [Beds]
 *     responses:
 *       200:
 *         description: Success stats
 */
router.get('/stats', async (req, res) => {
    try {
        const [total, occupied, available, cleaning] = await Promise.all([
            Bed.countDocuments(),
            Bed.countDocuments({ status: 'Occupied' }),
            Bed.countDocuments({ status: 'Available' }),
            Bed.countDocuments({ status: 'Cleaning' }),
        ]);
        const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0.0';
        return res.json({ success: true, data: { total, occupied, available, cleaning, occupancyRate } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/beds:
 *   get:
 *     summary: List all beds with optional filters
 *     tags: [Beds]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: ward
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [All, Available, Occupied, Cleaning]
 *     responses:
 *       200:
 *         description: List of beds
 *   post:
 *     summary: Register a new bed slot
 *     tags: [Beds]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ward
 *               - bedNumber
 *             properties:
 *               ward:
 *                 type: string
 *               bedNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bed created
 */
router.get('/', async (req, res) => {
    try {
        const { search, ward, status } = req.query;
        let filter = {};
        if (search) {
            const re = new RegExp(search, 'i');
            filter.$or = [{ bedNumber: re }, { ward: re }, { patientName: re }, { diagnosis: re }];
        }
        if (ward && ward !== 'All') filter.ward = ward;
        if (status && status !== 'All') filter.status = status;

        const beds = await Bed.find(filter).sort({ ward: 1, bedNumber: 1 });
        return res.json({ success: true, data: beds, count: beds.length });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { ward, bedNumber, status } = req.body;
        if (!ward || !bedNumber) {
            return res.status(400).json({ success: false, message: 'ward and bedNumber are required' });
        }

        const count = await Bed.countDocuments();
        const bedId = `BED-${String(count + 101).padStart(3, '0')}`;

        const bed = await Bed.create({ bedId, ward, bedNumber, status: status || 'Available' });
        return res.status(201).json({ success: true, data: bed });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/beds/{id}/admit:
 *   post:
 *     summary: Admit a patient to a bed
 *     tags: [Beds]
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
 *             type: object
 *             required:
 *               - patientName
 *               - diagnosis
 *             properties:
 *               patientName:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               doctorName:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient admitted
 */
router.post('/:id/admit', async (req, res) => {
    try {
        const { patientName, age, gender, doctorName, diagnosis, patient, doctor } = req.body;
        if (!patientName || !diagnosis) {
            return res.status(400).json({ success: false, message: 'patientName and diagnosis are required' });
        }

        const bed = await Bed.findById(req.params.id);
        if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
        if (bed.status === 'Occupied') {
            return res.status(400).json({ success: false, message: 'Bed is already occupied' });
        }

        const admitDate = new Date().toISOString().split('T')[0];
        const updated = await Bed.findByIdAndUpdate(
            req.params.id,
            {
                patientName,
                patient: patient || null,
                age,
                gender,
                doctorName,
                doctor: doctor || null,
                diagnosis,
                admitDate,
                status: 'Occupied'
            },
            { new: true }
        );

        return res.json({ success: true, data: updated, message: `${patientName} admitted to ${bed.bedNumber}` });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/beds/{id}/discharge:
 *   post:
 *     summary: Discharge a patient from a bed
 *     tags: [Beds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient discharged
 */
router.post('/:id/discharge', async (req, res) => {
    try {
        const bed = await Bed.findById(req.params.id);
        if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
        if (bed.status !== 'Occupied') {
            return res.status(400).json({ success: false, message: 'Bed is not currently occupied' });
        }

        const patientName = bed.patientName;
        const updated = await Bed.findByIdAndUpdate(
            req.params.id,
            {
                patientName: null,
                patient: null,
                age: null,
                gender: '—',
                doctorName: null,
                doctor: null,
                diagnosis: '',
                admitDate: null,
                status: 'Cleaning'
            },
            { new: true }
        );

        return res.json({ success: true, data: updated, message: `${patientName} discharged. Bed marked for cleaning.` });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/beds/{id}/transfer:
 *   post:
 *     summary: Transfer a patient to another bed
 *     tags: [Beds]
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
 *             type: object
 *             required:
 *               - targetBedId
 *             properties:
 *               targetBedId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient transferred
 */
router.post('/:id/transfer', async (req, res) => {
    try {
        const { targetBedId } = req.body;
        if (!targetBedId) return res.status(400).json({ success: false, message: 'targetBedId is required' });

        const sourceBed = await Bed.findById(req.params.id);
        const targetBed = await Bed.findById(targetBedId);

        if (!sourceBed) return res.status(404).json({ success: false, message: 'Source bed not found' });
        if (!targetBed) return res.status(404).json({ success: false, message: 'Target bed not found' });
        if (sourceBed.status !== 'Occupied') return res.status(400).json({ success: false, message: 'Source bed is not occupied' });
        if (targetBed.status === 'Occupied') return res.status(400).json({ success: false, message: 'Target bed is already occupied' });

        const { patientName, patient, age, gender, doctorName, doctor, diagnosis } = sourceBed;

        await Bed.findByIdAndUpdate(targetBedId, { patientName, patient, age, gender, doctorName, doctor, diagnosis, admitDate: sourceBed.admitDate, status: 'Occupied' });
        await Bed.findByIdAndUpdate(req.params.id, {
            patientName: null, patient: null, age: null, gender: '—', doctorName: null, doctor: null, diagnosis: '', admitDate: null, status: 'Cleaning'
        });

        return res.json({ success: true, message: `${patientName} transferred from ${sourceBed.bedNumber} to ${targetBed.bedNumber}` });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/beds/{id}:
 *   get:
 *     summary: Get single bed detail
 *     tags: [Beds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success bed
 *   put:
 *     summary: Update bed configuration
 *     tags: [Beds]
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
 *             $ref: '#/components/schemas/Bed'
 *     responses:
 *       200:
 *         description: Bed updated
 *   delete:
 *     summary: Remove a bed slot
 *     tags: [Beds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bed deleted
 */
router.get('/:id', async (req, res) => {
    try {
        const bed = await Bed.findById(req.params.id);
        if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
        return res.json({ success: true, data: bed });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
        return res.json({ success: true, data: bed });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const bed = await Bed.findByIdAndDelete(req.params.id);
        if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });
        return res.json({ success: true, message: 'Bed deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
