const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         age:
 *           type: number
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *         bloodGroup:
 *           type: string
 *         address:
 *           type: string
 *         medicalHistory:
 *           type: string
 *         lastVisit:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Approved, Pending, Cancelled]
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     PatientInput:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - age
 *       properties:
 *         name:
 *           type: string
 *           example: "Calvin Carlo"
 *         email:
 *           type: string
 *           example: "calvin@gmail.com"
 *         phone:
 *           type: string
 *           example: "+1 555-0192"
 *         age:
 *           type: number
 *           example: 34
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *           example: "Male"
 *         bloodGroup:
 *           type: string
 *           example: "B+"
 *         address:
 *           type: string
 *           example: "123 Main St, New York"
 *         medicalHistory:
 *           type: string
 *           example: "No known allergies"
 *         lastVisit:
 *           type: string
 *           example: "Today"
 *         status:
 *           type: string
 *           enum: [Approved, Pending, Cancelled]
 *           example: "Approved"
 */

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Add a new patient record (Protected)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientInput'
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Missing required fields or invalid input
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post('/', protect, async (req, res) => {
    try {
        const { name, email, phone, age, gender, bloodGroup, address, medicalHistory, lastVisit, status } = req.body;

        if (!name || !phone || age === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide patient name, phone, and age'
            });
        }

        const newPatient = new Patient({
            name,
            email: email || '',
            phone,
            age,
            gender: gender || 'Male',
            bloodGroup: bloodGroup || 'O+',
            address: address || '',
            medicalHistory: medicalHistory || '',
            lastVisit: lastVisit || 'Today',
            status: status || 'Approved'
        });

        const savedPatient = await newPatient.save();

        res.status(201).json({
            success: true,
            message: 'Patient record created successfully!',
            patient: savedPatient
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patient records with optional search (Protected)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search patients by name, email, or phone
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/', protect, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const patients = await Patient.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get single patient record by ID (Protected)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient details retrieved
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Patient ID format' });
        }

        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        res.json({
            success: true,
            patient
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient record details (Protected)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/PatientInput'
 *     responses:
 *       200:
 *         description: Patient record updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Patient ID format' });
        }

        const { name, email, phone, age, gender, bloodGroup, address, medicalHistory, lastVisit, status } = req.body;
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (age !== undefined) updateData.age = age;
        if (gender !== undefined) updateData.gender = gender;
        if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
        if (address !== undefined) updateData.address = address;
        if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory;
        if (lastVisit !== undefined) updateData.lastVisit = lastVisit;
        if (status !== undefined) updateData.status = status;

        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        res.json({
            success: true,
            message: 'Patient record updated successfully!',
            patient: updatedPatient
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete a patient record (Protected)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient record deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Patient ID format' });
        }

        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        res.json({
            success: true,
            message: 'Patient record deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
