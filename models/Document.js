const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        documentId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        title: {
            type: String,
            required: [true, 'Document title is required'],
            trim: true
        },
        category: {
            type: String,
            enum: ['Intake & Consent', 'Lab Results', 'Identity Proof', 'Clinical Reports', 'Medical Certifications', 'Insurance & Billing', 'Other'],
            default: 'Clinical Reports'
        },
        owner: {
            type: String,
            required: [true, 'Document owner / patient name is required'],
            trim: true
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            default: null
        },
        fileType: {
            type: String,
            default: 'PDF'
        },
        fileSize: {
            type: String,
            default: '1.5 MB'
        },
        fileUrl: {
            type: String,
            default: ''
        },
        uploadedAt: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Verified', 'Pending Review', 'Archived'],
            default: 'Verified'
        },
        notes: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);
