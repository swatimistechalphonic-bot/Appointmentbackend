const express = require('express');
const router = express.Router();
const Vaccination = require('../models/Vaccination');

const seedInitialVaccinations = async () => {
    try {
        const count = await Vaccination.countDocuments();
        if (count === 0) {
            const initialVaccinations = [
                {
                    id: 'VAC-9001',
                    patientName: 'Aarav Gupta',
                    age: '6 Months',
                    vaccineName: 'OPV & DTP Booster 1',
                    doseNumber: 'Dose 2 of 3',
                    dueDate: '2026-08-20',
                    administeredDate: '2026-08-20',
                    administeredBy: 'Nurse Mary Joseph',
                    status: 'Completed'
                },
                {
                    id: 'VAC-9002',
                    patientName: 'Ananya Sharma',
                    age: '12 Months',
                    vaccineName: 'MMR (Measles, Mumps, Rubella)',
                    doseNumber: 'Dose 1 of 2',
                    dueDate: '2026-08-28',
                    administeredDate: null,
                    administeredBy: 'Pending Appointment',
                    status: 'Scheduled'
                },
                {
                    id: 'VAC-9003',
                    patientName: 'Rohan Mehta',
                    age: '5 Years',
                    vaccineName: 'Typhoid Conjugate Vaccine',
                    doseNumber: 'Booster Dose',
                    dueDate: '2026-08-15',
                    administeredDate: null,
                    administeredBy: 'Overdue Notice Sent',
                    status: 'Overdue'
                },
                {
                    id: 'VAC-9004',
                    patientName: 'Priya Verma',
                    age: '28 Years',
                    vaccineName: 'Hepatitis B Recombinant',
                    doseNumber: 'Dose 3 of 3',
                    dueDate: '2026-08-24',
                    administeredDate: '2026-08-24',
                    administeredBy: 'Nurse Mary Joseph',
                    status: 'Completed'
                }
            ];
            await Vaccination.insertMany(initialVaccinations);
        }
    } catch (err) {
        console.error('Vaccination seed error:', err);
    }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Vaccination:
 *       type: object
 *       required:
 *         - patientName
 *         - vaccineName
 *         - dueDate
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ID (auto-generated)
 *         patientName:
 *           type: string
 *         age:
 *           type: string
 *           description: Current age milestone (e.g. 6 Months)
 *         vaccineName:
 *           type: string
 *         doseNumber:
 *           type: string
 *         dueDate:
 *           type: string
 *         administeredDate:
 *           type: string
 *         administeredBy:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Scheduled, Completed, Overdue]
 */

/**
 * @swagger
 * /api/vaccinations/stats:
 *   get:
 *     summary: Get vaccination immunization statistics
 *     tags: [Vaccinations]
 *     responses:
 *       200:
 *         description: Success stats
 */
router.get('/stats', async (req, res) => {
    try {
        await seedInitialVaccinations();
        const [total, completed, scheduled, overdue] = await Promise.all([
            Vaccination.countDocuments(),
            Vaccination.countDocuments({ status: 'Completed' }),
            Vaccination.countDocuments({ status: 'Scheduled' }),
            Vaccination.countDocuments({ status: 'Overdue' })
        ]);
        return res.json({ success: true, data: { total, completed, scheduled, overdue } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/vaccinations:
 *   get:
 *     summary: Retrieve vaccination records with filter search
 *     tags: [Vaccinations]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [All, Scheduled, Completed, Overdue]
 *     responses:
 *       200:
 *         description: List of vaccination records
 *   post:
 *     summary: Create / schedule a patient vaccination record
 *     tags: [Vaccinations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vaccination'
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.get('/', async (req, res) => {
    try {
        await seedInitialVaccinations();
        const { search, status } = req.query;
        let filter = {};
        if (search) {
            const re = new RegExp(search, 'i');
            filter.$or = [{ id: re }, { patientName: re }, { vaccineName: re }];
        }
        if (status && status !== 'All') {
            filter.status = status;
        }
        const docs = await Vaccination.find(filter).sort({ createdAt: -1 });
        return res.json({ success: true, data: docs, count: docs.length });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { patientName, age, vaccineName, doseNumber, dueDate, administeredDate, administeredBy, status } = req.body;
        if (!patientName || !vaccineName || !dueDate) {
            return res.status(400).json({ success: false, message: 'patientName, vaccineName, and dueDate are required' });
        }

        const count = await Vaccination.countDocuments();
        const id = `VAC-${String(count + 9001).padStart(4, '0')}`;

        const doc = await Vaccination.create({
            id,
            patientName,
            age: age || '6 Months',
            vaccineName,
            doseNumber: doseNumber || 'Dose 1',
            dueDate,
            administeredDate: administeredDate || null,
            administeredBy: administeredBy || (administeredDate ? 'Nurse Mary Joseph' : 'Pending Appointment'),
            status: status || (administeredDate ? 'Completed' : 'Scheduled')
        });

        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/vaccinations/{id}:
 *   get:
 *     summary: Get vaccination record detail
 *     tags: [Vaccinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single record detail
 *   put:
 *     summary: Update vaccination status or administered date
 *     tags: [Vaccinations]
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
 *             $ref: '#/components/schemas/Vaccination'
 *     responses:
 *       200:
 *         description: Updated record details
 *   delete:
 *     summary: Delete a vaccination record
 *     tags: [Vaccinations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted
 */
router.get('/:id', async (req, res) => {
    try {
        const doc = await Vaccination.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Vaccination record not found' });
        return res.json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const doc = await Vaccination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ success: false, message: 'Vaccination record not found' });
        return res.json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const doc = await Vaccination.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Vaccination record not found' });
        return res.json({ success: true, message: 'Vaccination record deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
