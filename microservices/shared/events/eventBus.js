const { EventEmitter } = require('events');

/**
 * CareSync Internal Event Bus
 * Used for in-process event-driven communication between modules.
 *
 * Events emitted:
 *   - appointment.booked     → triggers notification, audit log
 *   - appointment.cancelled  → triggers notification
 *   - queue.token_called     → triggers notification
 *   - prescription.issued    → triggers notification, audit log
 *   - payment.received       → triggers billing invoice
 *   - user.registered        → triggers welcome email
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Allow many services to listen
  }

  /**
   * Publish an event with a payload
   * @param {string} event - Event name (e.g. 'appointment.booked')
   * @param {object} payload - Data to pass to listeners
   */
  publish(event, payload) {
    console.log(`[EventBus] → ${event}`, JSON.stringify(payload, null, 2));
    this.emit(event, payload);
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} handler - Handler function
   */
  subscribe(event, handler) {
    this.on(event, handler);
  }
}

// Singleton instance shared across the process
const eventBus = new EventBus();

// ── Core Domain Event Names ──────────────────────────────────────────────────
const EVENTS = Object.freeze({
  // User
  USER_REGISTERED:          'user.registered',
  USER_LOGGED_IN:           'user.logged_in',
  USER_UPDATED:             'user.updated',
  USER_DELETED:             'user.deleted',

  // Appointment
  APPOINTMENT_BOOKED:       'appointment.booked',
  APPOINTMENT_CONFIRMED:    'appointment.confirmed',
  APPOINTMENT_COMPLETED:    'appointment.completed',
  APPOINTMENT_CANCELLED:    'appointment.cancelled',
  APPOINTMENT_RESCHEDULED:  'appointment.rescheduled',

  // Queue
  QUEUE_TOKEN_GENERATED:    'queue.token_generated',
  QUEUE_TOKEN_CALLED:       'queue.token_called',
  QUEUE_COMPLETED:          'queue.completed',
  QUEUE_SKIPPED:            'queue.skipped',

  // Prescription
  PRESCRIPTION_ISSUED:      'prescription.issued',
  PRESCRIPTION_UPDATED:     'prescription.updated',
  PRESCRIPTION_CANCELLED:   'prescription.cancelled',

  // Payment
  PAYMENT_RECEIVED:         'payment.received',
  PAYMENT_FAILED:           'payment.failed',
  INVOICE_GENERATED:        'invoice.generated',

  // Notification
  NOTIFICATION_SEND:        'notification.send',

  // Audit
  AUDIT_LOG:                'audit.log',
});

module.exports = { eventBus, EVENTS };
