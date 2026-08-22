import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookAppointmentModal from '../components/BookAppointmentModal';
import { Calendar, Clock, PlusCircle, Trash2, RefreshCw, CheckCircle2, AlertCircle, User, MessageSquare } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const userId = user?.id || user?._id;

  useEffect(() => {
    fetchAppointments();
  }, [userId, statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (userId) params.userId = userId;
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await appointmentApi.getAllAppointments(params);
      if (res.data?.success && Array.isArray(res.data.appointments)) {
        setAppointments(res.data.appointments);
      } else {
        const userRes = await appointmentApi.getUserAppointments(userId);
        if (userRes.data?.success) {
          setAppointments(userRes.data.appointments);
        }
      }
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Optimistically update local state for instant response
      setAppointments(prev =>
        prev.map(a => (a._id === id || a.id === id ? { ...a, status: newStatus } : a))
      );

      if (id && String(id).length > 10) {
        const res = await appointmentApi.updateAppointment(id, { status: newStatus });
        if (res.data?.success) {
          fetchAppointments();
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status on server');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const total = appointments.length;
  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const completed = appointments.filter(a => a.status === 'completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)', borderLeft: '5px solid #0066FF' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Appointments & Consultation Manager 👋
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
            Book new doctor consultations and track your upcoming visits
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={18} />
          Book New Appointment
        </button>
      </div>

      {/* 3 COLORFUL Stat Cards Row (1 Row x 3 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {/* Card 1: Total Bookings - Sky Blue */}
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#0066FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,102,255,0.3)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E40AF', lineHeight: '1.1' }}>{total}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#3B82F6' }}>Total Bookings</div>
          </div>
        </div>

        {/* Card 2: Upcoming Visits - Emerald Mint */}
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '1px solid #A7F3D0',
          borderRadius: '16px',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#065F46', lineHeight: '1.1' }}>{pending + confirmed}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#059669' }}>Upcoming Visits</div>
          </div>
        </div>

        {/* Card 3: Completed Visits - Lavender Purple */}
        <div style={{
          background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
          border: '1px solid #DDD6FE',
          borderRadius: '16px',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#6B21A8', lineHeight: '1.1' }}>{completed}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#7C3AED' }}>Completed Visits</div>
          </div>
        </div>
      </div>

      {/* Main Appointments Section */}
      <div className="card">
        <div className="card-header-flex">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="#0066FF" />
            My Bookings List
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button onClick={fetchAppointments} className="btn btn-secondary btn-sm" title="Refresh List">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            Loading your appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            <p>No appointments found in this view.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Book an appointment
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredAppointments.map((app) => (
              <div key={app._id} className="card" style={{ border: '1px solid #E2E8F0', padding: '1.35rem', background: '#FFFFFF', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#EEF4FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A' }}>
                        {app.doctorName || (app.doctor?.name ? `Dr. ${app.doctor.name}` : 'Doctor')}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: '#0066FF', fontWeight: '600' }}>
                        {app.specialization || 'General Practitioner'}
                      </p>
                    </div>
                  </div>

                  <span className={`doc-badge ${app.status || 'pending'}`}>
                    {app.status === 'completed' ? '🎉 Completed' : app.status === 'confirmed' ? '✅ Confirmed' : app.status === 'cancelled' ? '❌ Cancelled' : '⏳ Pending'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.15rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '12px' }}>
                  <div>📅 Date: <strong style={{ color: '#0F172A' }}>{app.date}</strong></div>
                  <div>⏰ Time Slot: <strong style={{ color: '#0F172A' }}>{app.timeSlot}</strong></div>
                  {app.reason && <div>📝 Reason: {app.reason}</div>}
                  {app.notes && (
                    <div style={{ color: '#059669', background: '#ECFDF5', padding: '0.4rem 0.65rem', borderRadius: '6px', marginTop: '0.25rem', borderLeft: '3px solid #10B981' }}>
                      <strong>Clinical Doctor Notes:</strong> {app.notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748B' }}>Change Status:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(app._id || app.id, 'pending')}
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        border: '1px solid #FDE68A',
                        background: app.status === 'pending' ? '#F59E0B' : '#FEF3C7',
                        color: app.status === 'pending' ? '#FFFFFF' : '#92400E',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ⏳ Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(app._id || app.id, 'confirmed')}
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        border: '1px solid #A7F3D0',
                        background: app.status === 'confirmed' ? '#10B981' : '#ECFDF5',
                        color: app.status === 'confirmed' ? '#FFFFFF' : '#065F46',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ✅ Confirm
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(app._id || app.id, 'completed')}
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        border: '1px solid #DDD6FE',
                        background: app.status === 'completed' ? '#8B5CF6' : '#F3E8FF',
                        color: app.status === 'completed' ? '#FFFFFF' : '#6B21A8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      🎉 Complete
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(app._id || app.id, 'cancelled')}
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        border: '1px solid #FECACA',
                        background: app.status === 'cancelled' ? '#EF4444' : '#FEE2E2',
                        color: app.status === 'cancelled' ? '#FFFFFF' : '#991B1B',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingSuccess={fetchAppointments}
      />
    </div>
  );
};

export default PatientDashboard;
