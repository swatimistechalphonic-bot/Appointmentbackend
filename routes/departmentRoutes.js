const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Department = require('../models/Department');
const { protect } = require('../middleware/auth');

// Initial seed data for departments if collection is empty
const defaultDepartments = [
    { name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular diagnosis, and surgery.', icon: 'Heart', headOfDepartment: 'Dr. Toni Kover', totalDoctors: 12, status: 'Active' },
    { name: 'Orthopedic', description: 'Bone, joint replacement, trauma, and sports injury rehabilitation.', icon: 'Bone', headOfDepartment: 'Dr. Calvin Carlo', totalDoctors: 8, status: 'Active' },
    { name: 'Gynecology & Obstetrics', description: 'Maternal health, prenatal care, and women reproductive health.', icon: 'User', headOfDepartment: 'Dr. Cristino Murphy', totalDoctors: 15, status: 'Active' },
    { name: 'Neurology & Brain Care', description: 'Brain tumor, stroke management, and nervous system disorders.', icon: 'Activity', headOfDepartment: 'Dr. Jessica Taylor', totalDoctors: 10, status: 'Active' },
    { name: 'Psychotherapy & Mental Health', description: 'Psychological counseling, behavioral therapy, and mental health.', icon: 'Brain', headOfDepartment: 'Dr. Alia Reddy', totalDoctors: 6, status: 'Active' },
    { name: 'General Physician', description: 'Primary health care, routine medical checkups, and wellness care.', icon: 'Stethoscope', headOfDepartment: 'Dr. Rahul Sharma', totalDoctors: 20, status: 'Active' }
];

const seedDepartments = async () => {
    try {
        const count = await Department.countDocuments();
        if (count === 0) {
            await Department.insertMany(defaultDepartments);
            console.log('✅ Default Departments Seeded Successfully');
        }
    } catch (err) {
        console.error('Department seed error:', err.message);
    }
};

seedDepartments();

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *         headOfDepartment:
 *           type: string
 *         totalDoctors:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 *     DepartmentInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *         headOfDepartment:
 *           type: string
 *         totalDoctors:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Active, Inactive]
 */

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create a new department (Protected)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentInput'
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Invalid input or Department already exists
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, icon, headOfDepartment, totalDoctors, status } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Department name is required' });
        }

        const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Department with this name already exists' });
        }

        const department = new Department({
            name,
            description: description || '',
            icon: icon || 'Heart',
            headOfDepartment: headOfDepartment || 'Dr. Specialist',
            totalDoctors: totalDoctors !== undefined ? totalDoctors : 1,
            status: status || 'Active'
        });

        const savedDepartment = await department.save();

        res.status(201).json({
            success: true,
            message: 'Department created successfully!',
            department: savedDepartment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments (Protected)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search department by name or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of departments
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, async (req, res) => {
    try {
        const { search, status } = req.query;
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const departments = await Department.find(filter).sort({ name: 1 });

        res.json({
            success: true,
            count: departments.length,
            departments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get department details by ID (Protected)
 *     tags: [Departments]
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
 *         description: Department details
 *       404:
 *         description: Department not found
 */
router.get('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Department ID format' });
        }

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.json({
            success: true,
            department
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update department details by ID (Protected)
 *     tags: [Departments]
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
 *             $ref: '#/components/schemas/DepartmentInput'
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       404:
 *         description: Department not found
 */
router.put('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Department ID format' });
        }

        const { name, description, icon, headOfDepartment, totalDoctors, status } = req.body;
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (icon !== undefined) updateData.icon = icon;
        if (headOfDepartment !== undefined) updateData.headOfDepartment = headOfDepartment;
        if (totalDoctors !== undefined) updateData.totalDoctors = totalDoctors;
        if (status !== undefined) updateData.status = status;

        const updatedDepartment = await Department.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedDepartment) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.json({
            success: true,
            message: 'Department updated successfully!',
            department: updatedDepartment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete department by ID (Protected)
 *     tags: [Departments]
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
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid Department ID format' });
        }

        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
