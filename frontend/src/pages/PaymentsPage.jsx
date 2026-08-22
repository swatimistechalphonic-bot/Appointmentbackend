import React, { useState, useEffect } from 'react';
import { paymentApi } from '../services/api';
import {
  CreditCard,
  Search,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit,
  IndianRupee,
  TrendingUp,
  Clock,
  XCircle,
  RotateCcw,
  Calendar,
  User,
  Stethoscope
} from 'lucide-react';

const STATUS_COLORS = {
  Paid: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  Pending: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  Failed: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
  Refunded: { bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
};

const METHOD_ICONS = {
  Cash: '💵',
  Card: '💳',
  UPI: '📱',
  Online: '🌐',
  Insurance: '🏥',
  Cheque: '📄',
};

const StatCard = ({ label, value, icon, bg, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', padding: '1.25rem 1.5rem' }}>
    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ color: '#64748B', fontSize: '0.82rem', fontWeight: '600', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '1.45rem', fontWeight: '800', color: color || '#0F172A', margin: 0 }}>{value}</p>
    </div>
  </div>
);

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    patientName: '',
    doctorName: '',
    amount: '',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    transactionId: '',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Modal
  const [editPayment, setEditPayment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchAll();
  }, [searchTerm, statusFilter]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        paymentApi.getAllPayments({ search: searchTerm || undefined, status: statusFilter || undefined }),
        paymentApi.getStats()
      ]);

      if (paymentsRes.data?.success) setPayments(paymentsRes.data.payments);
      if (statsRes.data?.success) setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Fetch Payments Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!addForm.patientName || !addForm.doctorName || !addForm.amount) {
      setAddError('Patient name, doctor name, and amount are required');
      return;
    }
    setAddSubmitting(true);
    try {
      const res = await paymentApi.createPayment(addForm);
      if (res.data?.success) {
        setIsAddModalOpen(false);
        setAddForm({ patientName: '', doctorName: '', amount: '', paymentMethod: 'Cash', paymentStatus: 'Pending', transactionId: '', description: '', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
        fetchAll();
      }
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleOpenEdit = (payment) => {
    setEditPayment(payment);
    setEditForm({
      patientName: payment.patientName,
      doctorName: payment.doctorName,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      transactionId: payment.transactionId || '',
      description: payment.description || '',
      paymentDate: payment.paymentDate ? payment.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: payment.notes || ''
    });
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSubmitting(true);
    try {
      const res = await paymentApi.updatePayment(editPayment._id, editForm);
      if (res.data?.success) {
        setEditPayment(null);
        fetchAll();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Delete payment record for "${payment.patientName}"?`)) return;
    try {
      await paymentApi.deletePayment(payment._id);
      setPayments(prev => prev.filter(p => p._id !== payment._id));
      fetchAll();
    } catch (err) {
      alert('Failed to delete payment');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatAmount = (amt) => `₹${Number(amt).toLocaleString('en-IN')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Payment Management 💳
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Track, record, and manage all patient payment transactions</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="header-search" style={{ width: '240px' }}>
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search patient, doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-field"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.88rem', width: '140px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <StatCard
            label="Total Revenue"
            value={stats.totalRevenueFormatted}
            icon={<IndianRupee size={26} color="#0066FF" />}
            bg="#EFF6FF"
            color="#0066FF"
          />
          <StatCard
            label="Paid Payments"
            value={stats.totalPaid}
            icon={<CheckCircle2 size={26} color="#16A34A" />}
            bg="#DCFCE7"
            color="#16A34A"
          />
          <StatCard
            label="Pending Payments"
            value={stats.totalPending}
            icon={<Clock size={26} color="#D97706" />}
            bg="#FEF3C7"
            color="#D97706"
          />
          <StatCard
            label="Failed Payments"
            value={stats.totalFailed}
            icon={<XCircle size={26} color="#DC2626" />}
            bg="#FEE2E2"
            color="#DC2626"
          />
        </div>
      )}

      {/* Payments Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', margin: 0 }}>
            All Payment Records ({payments.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading payments...</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>No payment records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Patient', 'Doctor', 'Amount', 'Method', 'Date', 'Transaction ID', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '700', color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, idx) => {
                  const s = STATUS_COLORS[payment.paymentStatus] || STATUS_COLORS.Pending;
                  return (
                    <tr
                      key={payment._id}
                      style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color="#0066FF" />
                          </div>
                          <span style={{ fontWeight: '600', color: '#0F172A' }}>{payment.patientName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: '500' }}>{payment.doctorName}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>{formatAmount(payment.amount)}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                          <span>{METHOD_ICONS[payment.paymentMethod] || '💰'}</span>
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748B', whiteSpace: 'nowrap' }}>{formatDate(payment.paymentDate)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {payment.transactionId || '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.55rem', color: '#D97706', background: '#FFFBEB', borderColor: '#FDE68A' }}
                            title="Edit Payment"
                            onClick={() => handleOpenEdit(payment)}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.55rem', color: '#DC2626', background: '#FEF2F2', borderColor: '#FCA5A5' }}
                            title="Delete Payment"
                            onClick={() => handleDelete(payment)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD PAYMENT MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CreditCard size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Record New Payment</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {addError && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>
                <AlertCircle size={16} /> {addError}
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Patient Name *</label>
                  <input type="text" className="input-field" placeholder="e.g. Rajesh Kumar" value={addForm.patientName} onChange={e => setAddForm({ ...addForm, patientName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Doctor Name *</label>
                  <input type="text" className="input-field" placeholder="e.g. Dr. Calvin Carlo" value={addForm.doctorName} onChange={e => setAddForm({ ...addForm, doctorName: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input type="number" className="input-field" placeholder="e.g. 1500" min="0" value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Payment Date *</label>
                  <input type="date" className="input-field" value={addForm.paymentDate} onChange={e => setAddForm({ ...addForm, paymentDate: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select className="input-field" value={addForm.paymentMethod} onChange={e => setAddForm({ ...addForm, paymentMethod: e.target.value })}>
                    <option>Cash</option>
                    <option>Card</option>
                    <option>UPI</option>
                    <option>Online</option>
                    <option>Insurance</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Status</label>
                  <select className="input-field" value={addForm.paymentStatus} onChange={e => setAddForm({ ...addForm, paymentStatus: e.target.value })}>
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Failed</option>
                    <option>Refunded</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Transaction ID (Optional)</label>
                <input type="text" className="input-field" placeholder="e.g. TXN2026001" value={addForm.transactionId} onChange={e => setAddForm({ ...addForm, transactionId: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Description / Consultation Purpose</label>
                <input type="text" className="input-field" placeholder="e.g. Cardiology Consultation" value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea className="input-field" rows="2" placeholder="Any additional notes..." value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addSubmitting}>
                  {addSubmitting ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PAYMENT MODAL */}
      {editPayment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Edit size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Edit Payment</h2>
              </div>
              <button onClick={() => setEditPayment(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>
                <AlertCircle size={16} /> {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Patient Name</label>
                  <input type="text" className="input-field" value={editForm.patientName} onChange={e => setEditForm({ ...editForm, patientName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Doctor Name</label>
                  <input type="text" className="input-field" value={editForm.doctorName} onChange={e => setEditForm({ ...editForm, doctorName: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" className="input-field" min="0" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Payment Date</label>
                  <input type="date" className="input-field" value={editForm.paymentDate} onChange={e => setEditForm({ ...editForm, paymentDate: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select className="input-field" value={editForm.paymentMethod} onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })}>
                    <option>Cash</option>
                    <option>Card</option>
                    <option>UPI</option>
                    <option>Online</option>
                    <option>Insurance</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Status</label>
                  <select className="input-field" value={editForm.paymentStatus} onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value })}>
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Failed</option>
                    <option>Refunded</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Transaction ID</label>
                  <input type="text" className="input-field" value={editForm.transactionId} onChange={e => setEditForm({ ...editForm, transactionId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" className="input-field" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea className="input-field" rows="2" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditPayment(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Updating...' : 'Update Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
