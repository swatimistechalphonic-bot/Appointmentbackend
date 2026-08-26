/**
 * CareSync Shared Constants
 * Centralized definitions for roles, statuses, and enums used across all microservices.
 */

// User Roles
const ROLES = Object.freeze({
  SUPER_ADMIN:    'super_admin',
  ADMIN:          'admin',
  DOCTOR:         'doctor',
  RECEPTIONIST:   'receptionist',
  PATIENT:        'patient',
  STAFF:          'staff',
});

// Appointment Statuses
const APPOINTMENT_STATUS = Object.freeze({
  PENDING:    'pending',
  CONFIRMED:  'confirmed',
  COMPLETED:  'completed',
  CANCELLED:  'cancelled',
  NO_SHOW:    'no_show',
  RESCHEDULED:'rescheduled',
});

// Queue Statuses
const QUEUE_STATUS = Object.freeze({
  WAITING:        'Waiting',
  IN_CONSULTATION:'In Consultation',
  COMPLETED:      'Completed',
  SKIPPED:        'Skipped',
  CANCELLED:      'Cancelled',
});

// Prescription Statuses
const PRESCRIPTION_STATUS = Object.freeze({
  ACTIVE:     'Active',
  COMPLETED:  'Completed',
  CANCELLED:  'Cancelled',
});

// Payment Statuses
const PAYMENT_STATUS = Object.freeze({
  PENDING:    'pending',
  PAID:       'paid',
  REFUNDED:   'refunded',
  FAILED:     'failed',
});

// Subscription Plans
const SUBSCRIPTION_PLANS = Object.freeze({
  FREE:         'free',
  STARTER:      'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE:   'enterprise',
});

// HTTP Status Codes
const HTTP_STATUS = Object.freeze({
  OK:                     200,
  CREATED:                201,
  BAD_REQUEST:            400,
  UNAUTHORIZED:           401,
  FORBIDDEN:              403,
  NOT_FOUND:              404,
  CONFLICT:               409,
  INTERNAL_SERVER_ERROR:  500,
  BAD_GATEWAY:            502,
  SERVICE_UNAVAILABLE:    503,
});

// Notification Types
const NOTIFICATION_TYPE = Object.freeze({
  APPOINTMENT_BOOKED:   'appointment_booked',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  QUEUE_CALLED:         'queue_called',
  PRESCRIPTION_ISSUED:  'prescription_issued',
  PAYMENT_RECEIVED:     'payment_received',
  REPORT_READY:         'report_ready',
});

module.exports = {
  ROLES,
  APPOINTMENT_STATUS,
  QUEUE_STATUS,
  PRESCRIPTION_STATUS,
  PAYMENT_STATUS,
  SUBSCRIPTION_PLANS,
  HTTP_STATUS,
  NOTIFICATION_TYPE,
};
