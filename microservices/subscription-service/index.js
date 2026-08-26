const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { sendSuccess, sendError } = require('../shared/utils/responseHelper');
const { HTTP_STATUS, SUBSCRIPTION_PLANS } = require('../shared/constants');

// ── Subscription Schema ───────────────────────────────────────────────────────
const subscriptionSchema = new mongoose.Schema({
  organization:   { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, unique: true },
  plan:           { type: String, enum: Object.values(SUBSCRIPTION_PLANS), default: SUBSCRIPTION_PLANS.FREE },
  status:         { type: String, enum: ['active', 'trialing', 'expired', 'cancelled', 'past_due'], default: 'trialing' },
  billingCycle:   { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  startDate:      { type: Date, default: Date.now },
  expiryDate:     { type: Date, default: null },
  trialEndsAt:    { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }, // 14-day trial
  autoRenew:      { type: Boolean, default: true },
  maxDoctors:     { type: Number, default: 1 },
  maxPatients:    { type: Number, default: 100 },
  features: {
    queue:            { type: Boolean, default: true },
    prescriptions:    { type: Boolean, default: true },
    telemedicine:     { type: Boolean, default: false },
    analytics:        { type: Boolean, default: false },
    multipleLocations:{ type: Boolean, default: false },
    customBranding:   { type: Boolean, default: false },
    apiAccess:        { type: Boolean, default: false },
  },
  paymentHistory: [{
    amount:    Number,
    currency:  { type: String, default: 'INR' },
    paidAt:    Date,
    invoiceId: String,
    method:    String,
  }],
}, { timestamps: true });

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

const PLAN_CONFIG = {
  free:         { maxDoctors: 1, maxPatients: 50,   price: 0 },
  starter:      { maxDoctors: 3, maxPatients: 500,  price: 999 },
  professional: { maxDoctors: 10, maxPatients: 5000, price: 2999 },
  enterprise:   { maxDoctors: 999, maxPatients: 999999, price: 9999 },
};

router.get('/', async (req, res) => {
  try {
    const subs = await Subscription.find().populate('organization', 'name email').sort({ createdAt: -1 });
    return sendSuccess(res, { subscriptions: subs, count: subs.length }, 'Subscriptions fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

router.get('/plans', (req, res) => {
  return sendSuccess(res, { plans: PLAN_CONFIG }, 'Available subscription plans');
});

router.get('/:organizationId', async (req, res) => {
  try {
    const sub = await Subscription.findOne({ organization: req.params.organizationId });
    if (!sub) return sendError(res, 'No subscription found for this organization.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, sub, 'Subscription fetched');
  } catch (err) {
    return sendError(res, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { organization, plan = 'free', billingCycle = 'monthly' } = req.body;
    if (!organization) return sendError(res, 'Organization ID required.', HTTP_STATUS.BAD_REQUEST);
    const config = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
    const sub = await Subscription.create({ organization, plan, billingCycle, ...config });
    return sendSuccess(res, sub, 'Subscription created', HTTP_STATUS.CREATED);
  } catch (err) {
    return sendError(res, err.message);
  }
});

router.put('/:id/upgrade', async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;
    const config = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
    const expiryDate = billingCycle === 'yearly'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const sub = await Subscription.findByIdAndUpdate(req.params.id, { plan, billingCycle, expiryDate, status: 'active', ...config }, { new: true });
    if (!sub) return sendError(res, 'Subscription not found.', HTTP_STATUS.NOT_FOUND);
    return sendSuccess(res, sub, `Upgraded to ${plan} plan`);
  } catch (err) {
    return sendError(res, err.message);
  }
});

module.exports = { serviceName: 'Subscription & SaaS Billing Service', basePath: '/api/subscriptions', router };
