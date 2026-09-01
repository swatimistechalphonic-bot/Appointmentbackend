const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       required:
 *         - title
 *         - owner
 *       properties:
 *         documentId:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *           enum: [Intake & Consent, Lab Results, Identity Proof, Clinical Reports, Medical Certifications, Insurance & Billing, Other]
 *         owner:
 *           type: string
 *         fileType:
 *           type: string
 *         fileSize:
 *           type: string
 *         fileUrl:
 *           type: string
 *         uploadedAt:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Verified, Pending Review, Archived]
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/documents/stats:
 *   get:
 *     summary: Get document repository stats
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Success stats
 */
router.get('/stats', async (req, res) => {
    try {
        const [total, verified, pending, archived] = await Promise.all([
            Document.countDocuments(),
            Document.countDocuments({ status: 'Verified' }),
            Document.countDocuments({ status: 'Pending Review' }),
            Document.countDocuments({ status: 'Archived' }),
        ]);
        return res.json({ success: true, data: { total, verified, pending, archived } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Retrieve documents with search & category filter
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 *   post:
 *     summary: Upload / Create a new document record
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Document'
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
router.get('/', async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let filter = {};
        if (search) {
            const re = new RegExp(search, 'i');
            filter.$or = [{ documentId: re }, { title: re }, { owner: re }, { notes: re }];
        }
        if (category && category !== 'All') filter.category = category;
        if (status && status !== 'All') filter.status = status;

        const docs = await Document.find(filter).sort({ createdAt: -1 });
        return res.json({ success: true, data: docs, count: docs.length });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, category, owner, fileType, fileSize, fileUrl, notes, status, patient } = req.body;
        if (!title || !owner) {
            return res.status(400).json({ success: false, message: 'Document title and owner/patient name are required' });
        }

        const count = await Document.countDocuments();
        const documentId = `DOC-${String(count + 1001).padStart(4, '0')}`;
        const uploadedAt = new Date().toISOString().split('T')[0];

        const doc = await Document.create({
            documentId,
            title,
            category: category || 'Clinical Reports',
            owner,
            patient: patient || null,
            fileType: fileType || 'PDF',
            fileSize: fileSize || '1.5 MB',
            fileUrl: fileUrl || '',
            uploadedAt,
            status: status || 'Verified',
            notes: notes || ''
        });

        return res.status(201).json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get single document by ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document detail
 *   put:
 *     summary: Update document status or details
 *     tags: [Documents]
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
 *             $ref: '#/components/schemas/Document'
 *     responses:
 *       200:
 *         description: Updated document
 *   delete:
 *     summary: Delete a document record
 *     tags: [Documents]
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
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
        return res.json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
        return res.json({ success: true, data: doc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const doc = await Document.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
        return res.json({ success: true, message: 'Document deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
