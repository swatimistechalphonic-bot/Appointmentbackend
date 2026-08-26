const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// Helper to get formatted local date string YYYY-MM-DD
const getTodayDateString = (dateObj = new Date()) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     MedicineItem:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Paracetamol"
 *         dosage:
 *           type: string
 *           example: "500 mg"
 *         frequency:
 *           type: string
 *           example: "Three times a day (1-1-1)"
 *         duration:
 *           type: string
 *           example: "5 Days"
 *         instructions:
 *           type: string
 *           example: "Post meals"
 *     Prescription:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         prescriptionId:
 *           type: string
 *           example: "RX-2026-001"
 *         patientName:
 *           type: string
 *           example: "Swati Verma"
 *         age:
 *           type: number
 *           example: 26
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other, "—"]
 *           example: "Female"
 *         doctorName:
 *           type: string
 *           example: "Dr. Rahul Sharma"
 *         diagnosis:
 *           type: string
 *           example: "Acute Viral Fever & Sore Throat"
 *         medicines:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MedicineItem'
 *         date:
 *           type: string
 *           example: "2026-08-26"
 *         followUp:
 *           type: string
 *           example: "2026-09-02"
 *         notes:
 *           type: string
 *           example: "Drink warm water and take complete bed rest."
 *         status:
 *           type: string
 *           enum: [Active, Completed, Cancelled]
 *           example: "Active"
 *     PrescriptionInput:
 *       type: object
 *       required:
 *         - patientName
 *         - diagnosis
 *       properties:
 *         patientName:
 *           type: string
 *           example: "Swati Verma"
 *         patientId:
 *           type: string
 *         age:
 *           type: number
 *           example: 26
 *         gender:
 *           type: string
 *           example: "Female"
 *         doctorId:
 *           type: string
 *         doctorName:
 *           type: string
 *           example: "Dr. Rahul Sharma"
 *         appointmentId:
 *           type: string
 *         diagnosis:
 *           type: string
 *           example: "Acute Viral Fever & Sore Throat"
 *         medicines:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MedicineItem'
 *         date:
 *           type: string
 *           example: "2026-08-26"
 *         followUp:
 *           type: string
 *           example: "2026-09-02"
 *         notes:
 *           type: string
 *           example: "Drink warm water and take complete bed rest."
 */

/**
 * @swagger
 * /api/prescriptions/stats:
 *   get:
 *     summary: Get prescription telemetry and statistics
 *     tags: [Prescriptions]
 *     responses:
 *       200:
 *         description: Prescription metrics overview
 */
router.get('/stats', async (req, res) => {
    try {
        const today = getTodayDateString();
        const prescriptions = await Prescription.find();

        const totalPrescriptions = prescriptions.length;
        const issuedToday = prescriptions.filter(p => p.date === today).length;
        const totalMedications = prescriptions.reduce((sum, p) => sum + (p.medicines ? p.medicines.length : 0), 0);
        const activePrescriptions = prescriptions.filter(p => p.status === 'Active').length;

        return res.status(200).json({
            success: true,
            data: {
                totalCount: totalPrescriptions,
                todayCount: issuedToday,
                totalMedicinesCount: totalMedications,
                activeCount: activePrescriptions
            }
        });
    } catch (error) {
        console.error('Error fetching prescription stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch prescription stats',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/prescriptions:
 *   get:
 *     summary: List and search digital prescriptions
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient name, diagnosis, or prescription ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Filter by date YYYY-MM-DD
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter by doctor ID
 *     responses:
 *       200:
 *         description: List of prescriptions
 */
router.get('/', async (req, res) => {
    try {
        const { search, date, doctorId } = req.query;
        let filter = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { prescriptionId: searchRegex },
                { patientName: searchRegex },
                { diagnosis: searchRegex },
                { doctorName: searchRegex }
            ];
        }

        if (date) {
            filter.date = date;
        }

        if (doctorId) {
            if (mongoose.Types.ObjectId.isValid(doctorId)) {
                filter.doctor = doctorId;
            } else {
                filter.doctorName = new RegExp(doctorId, 'i');
            }
        }

        const prescriptions = await Prescription.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch prescriptions',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get single prescription details
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription MongoDB ID or Prescription Code (e.g. RX-2026-001)
 *     responses:
 *       200:
 *         description: Prescription details
 *       404:
 *         description: Prescription not found
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let prescription;

        if (mongoose.Types.ObjectId.isValid(id)) {
            prescription = await Prescription.findById(id);
        }

        if (!prescription) {
            prescription = await Prescription.findOne({ prescriptionId: id });
        }

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: prescription
        });
    } catch (error) {
        console.error('Error fetching prescription details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch prescription details',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create a new digital prescription
 *     tags: [Prescriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrescriptionInput'
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', async (req, res) => {
    try {
        const {
            patientName,
            patientId,
            age,
            gender = 'Female',
            doctorId,
            doctorName = 'Dr. Rahul Sharma',
            appointmentId,
            diagnosis,
            medicines = [],
            date: inputDate,
            followUp = 'N/A',
            notes = 'No additional notes.',
            status = 'Active'
        } = req.body;

        if (!patientName || !diagnosis) {
            return res.status(400).json({
                success: false,
                message: 'Patient name and clinical diagnosis are required'
            });
        }

        const date = inputDate || getTodayDateString();
        const year = date.split('-')[0] || new Date().getFullYear();

        // Generate sequential unique Rx ID (e.g. RX-2026-001)
        const totalCount = await Prescription.countDocuments();
        const rxSequence = String(totalCount + 1).padStart(3, '0');
        const prescriptionId = `RX-${year}-${rxSequence}`;

        let patient = patientId && mongoose.Types.ObjectId.isValid(patientId) ? patientId : null;
        let doctor = doctorId && mongoose.Types.ObjectId.isValid(doctorId) ? doctorId : null;
        let appointment = appointmentId && mongoose.Types.ObjectId.isValid(appointmentId) ? appointmentId : null;

        // Clean medicines list (remove empty names)
        const cleanedMedicines = Array.isArray(medicines)
            ? medicines.filter(m => m && m.name && m.name.trim())
            : [];

        const newPrescription = new Prescription({
            prescriptionId,
            patient,
            patientName: patientName.trim(),
            age: Number(age) || 30,
            gender,
            doctor,
            doctorName: doctorName.trim(),
            appointment,
            diagnosis: diagnosis.trim(),
            medicines: cleanedMedicines,
            date,
            followUp,
            notes,
            status
        });

        await newPrescription.save();

        return res.status(201).json({
            success: true,
            message: `Prescription ${prescriptionId} created successfully`,
            data: newPrescription
        });
    } catch (error) {
        console.error('Error creating prescription:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create prescription',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   put:
 *     summary: Update an existing prescription
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription MongoDB ID or Prescription Code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrescriptionInput'
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *       404:
 *         description: Prescription not found
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let prescription;

        if (mongoose.Types.ObjectId.isValid(id)) {
            prescription = await Prescription.findById(id);
        }
        if (!prescription) {
            prescription = await Prescription.findOne({ prescriptionId: id });
        }

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        const allowedUpdates = [
            'patientName',
            'age',
            'gender',
            'doctorName',
            'diagnosis',
            'medicines',
            'followUp',
            'notes',
            'status'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                prescription[field] = req.body[field];
            }
        });

        await prescription.save();

        return res.status(200).json({
            success: true,
            message: `Prescription ${prescription.prescriptionId} updated successfully`,
            data: prescription
        });
    } catch (error) {
        console.error('Error updating prescription:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update prescription',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   delete:
 *     summary: Delete a prescription
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription MongoDB ID or Prescription Code
 *     responses:
 *       200:
 *         description: Prescription deleted successfully
 *       404:
 *         description: Prescription not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let deleted;

        if (mongoose.Types.ObjectId.isValid(id)) {
            deleted = await Prescription.findByIdAndDelete(id);
        }
        if (!deleted) {
            deleted = await Prescription.findOneAndDelete({ prescriptionId: id });
        }

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Prescription ${deleted.prescriptionId} deleted successfully`,
            data: deleted
        });
    } catch (error) {
        console.error('Error deleting prescription:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete prescription',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/prescriptions/patient/{patientId}:
 *   get:
 *     summary: Get prescription history for a patient
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient User ID or Name
 *     responses:
 *       200:
 *         description: Patient's prescriptions
 */
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        let filter = {};

        if (mongoose.Types.ObjectId.isValid(patientId)) {
            filter.$or = [
                { patient: patientId },
                { patientRef: patientId }
            ];
        } else {
            filter.patientName = new RegExp(patientId, 'i');
        }

        const prescriptions = await Prescription.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            patientId,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        console.error('Error fetching patient prescriptions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch patient prescriptions',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/prescriptions/doctor/{doctorId}:
 *   get:
 *     summary: Get prescriptions issued by a specific doctor
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor User ID or Name
 *     responses:
 *       200:
 *         description: Doctor's prescriptions
 */
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        let filter = {};

        if (mongoose.Types.ObjectId.isValid(doctorId)) {
            filter.doctor = doctorId;
        } else {
            filter.doctorName = new RegExp(doctorId, 'i');
        }

        const prescriptions = await Prescription.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            doctorId,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        console.error('Error fetching doctor prescriptions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor prescriptions',
            error: error.message
        });
    }
});

module.exports = router;
