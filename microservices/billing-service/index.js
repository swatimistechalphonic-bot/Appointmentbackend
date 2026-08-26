const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../shared/utils/responseHelper');
const { HTTP_STATUS } = require('../shared/constants');

// ── Billing Invoice Schema ────────────────────────────────────────────────────
const billingSchema = new mongoose.Schema({
  invoiceNumber:  { type: String, required: true, unique: true },
  patient:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName:    { type: String, required: true },
  organization:   { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  appointment:    { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  doctor:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  doctorName:     { type: String, default: '' },
  lineItems: [{
    description:  { type: String, required: true },
    quantity:     { type: Number, default: 1 },
    unitPrice:    { type: Number, required: true },
    total:        { type: Number, required: true },
  }],
  subtotal:       { type: Number, required: true },
  tax:            { type: Number, default: 0 },
  discount:       { type: Number, default: 0 },
  totalAmount:    { type: Number, required: true },
  currency:       { type: String, default: 'INR' },
  status:         { type: String, enum: ['draft', 'issued', 'paid', 'overdue', 'cancelled'], default: 'issued' },
  dueDate:        { type: String, default: '' },
  paidAt:         { type: Date, default: null },
  notes:          { type: String, default: '' },
}, { timestamps: true });

const Billing = mongoose.models.Billing || mongoose.model('Billing', billingSchema);

const generateInvoiceNumber = async () => {
  const count = await Billing.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

// GET /api/billing
router.get('/', async (req, res) => {
  try {
    const { patientId, status, search } = req.query;
    let filter = {};
    if (patientId) filter.patient = patientId;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { invoiceNumber: new RegExp(search, 'i') },
      { patientName: new RegExp(search, 'i') }
    ];
    const invoices = await Billing.find(filter).sort({ createdAt: -1 });
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);
    return sendSuccess(res, { invoices, totalRevenue, count: invoices.length }, 'Invoices fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// GET /api/billing/:id
router.get('/:id', async (req, res) => {
  try {
    const inv = await Billing.findById(req.params.id);
    if (!inv) return sendError(res, 'Invoice not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, inv, 'Invoice fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// POST /api/billing
router.post('/', async (req, res) => {
  try {
    const { patientName, patient, lineItems, tax = 0, discount = 0, doctorName, appointment, doctor } = req.body;
    if (!patientName || !patient || !lineItems?.length)
      return sendError(res, 'patient, patientName, and lineItems are required.', HTTP_STATUS.BAD_REQUEST);

    const subtotal = lineItems.reduce((sum, item) => sum + (item.unitPrice * (item.quantity || 1)), 0);
    const totalAmount = subtotal + tax - discount;
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Billing.create({
      invoiceNumber, patient, patientName, lineItems, subtotal, tax, discount, totalAmount, doctorName, appointment, doctor
    });
    return sendSuccess(res, invoice, `Invoice ${invoiceNumber} created`, HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

// PATCH /api/billing/:id/pay
router.patch('/:id/pay', async (req, res) => {
  try {
    const invoice = await Billing.findByIdAndUpdate(req.params.id, { status: 'paid', paidAt: new Date() }, { new: true });
    if (!invoice) return sendError(res, 'Invoice not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, invoice, 'Invoice marked as paid');
  } catch (err) {
    return sendError(res, err.message);
  }
});

// DELETE /api/billing/:id
router.delete('/:id', async (req, res) => {
  try {
    const inv = await Billing.findByIdAndDelete(req.params.id);
    if (!inv) return sendError(res, 'Invoice not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, null, 'Invoice deleted');
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Billing & Invoice Service', basePath: '/api/billing', router };
