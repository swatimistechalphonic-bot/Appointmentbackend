import React, { useState, useEffect } from 'react';
import { appointmentApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, Stethoscope, AlertCircle, CheckCircle2, Check, ShieldCheck, DollarSign } from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM - 09:30 AM',
  '10:00 AM - 10:30 AM',
  '11:00 AM - 11:30 AM',
  '02:00 PM - 02:30 PM',
  '03:30 PM - 04:00 PM',
  '05:00 PM - 05:30 PM',
];

const BookAppointmentModal = ({ isOpen, onClose, onBookingSuccess, preselectedDoctor = null }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctor?._id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      if (preselectedDoctor) {
        setSelectedDoctorId(preselectedDoctor._id);
      }
    }
  }, [isOpen, preselectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const res = await authApi.getDoctors();
      if (res.data?.success && res.data.doctors?.length > 0) {
        setDoctors(res.data.doctors);
        if (!selectedDoctorId) {
          setSelectedDoctorId(res.data.doctors[0]._id);
        }
      } else {
        const usersRes = await authApi.getAllUsers();
        const doctorList = usersRes.data?.users?.filter(u => u.role === 'doctor') || [];
        setDoctors(doctorList.length > 0 ? doctorList : mockDoctors);
        if (!selectedDoctorId && doctorList.length > 0) {
          setSelectedDoctorId(doctorList[0]._id);
        }
      }
    } catch (err) {
      setDoctors(mockDoctors);
      if (!selectedDoctorId) {
        setSelectedDoctorId(mockDoctors[0]._id);
      }
    }
  };

  const mockDoctors = [
    { _id: '60f1b2c3d4e5f67890a1b2c3', name: 'Dr. Rahul Sharma', phone: '9811223344', specialization: 'General Physician' },
    { _id: '60f1b2c3d4e5f67890a1b2c4', name: 'Dr. Calvin Carlo', phone: '9822334455', specialization: 'Orthopedic' },
    { _id: '60f1b2c3d4e5f67890a1b2c5', name: 'Dr. Cristino Murphy', phone: '9833445566', specialization: 'Gynecology' },
    { _id: '60f1b2c3d4e5f67890a1b2c6', name: 'Dr. Alia Reddy', phone: '9844556677', specialization: 'Psychotherapy' },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedDoctorId) {
      setError('Please select a doctor');
      return;
    }
    if (!date) {
      setError('Please select an appointment date');
      return;
    }
    if (!timeSlot) {
      setError('Please select a time slot');
      return;
    }

    const doctorObj = (doctors.length > 0 ? doctors : mockDoctors).find(d => d._id === selectedDoctorId);

    setLoading(true);
    try {
      const payload = {
        user: user?.id || user?._id || '60f1b2c3d4e5f67890a1b299',
        doctor: selectedDoctorId,
        doctorName: doctorObj ? doctorObj.name : 'Dr. Specialist',
        specialization: doctorObj?.specialization || 'General Physician',
        date,
        timeSlot,
        reason,
        amount: 500,
      };

      const res = await appointmentApi.createAppointment(payload);
      if (res.data?.success) {
        setSuccessMsg('Appointment booked successfully!');
        setTimeout(() => {
          if (onBookingSuccess) onBookingSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EEF2FF', color: '#2F65F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.2' }}>
                Book New Appointment
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0' }}>
                Select a specialist doctor and preferred time slot
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Select Doctor */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Stethoscope size={16} color="#2F65F6" />
              Select Doctor
            </label>
            <select
              className="input-field"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
            >
              <option value="">-- Choose a Specialist Doctor --</option>
              {(doctors.length > 0 ? doctors : mockDoctors).map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} {doc.specialization ? `(${doc.specialization})` : ''} - {doc.phone || 'Available'}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Date */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} color="#2F65F6" />
              Appointment Date
            </label>
            <input
              type="date"
              className="input-field"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Time Slot Selector Grid */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="#2F65F6" />
              Available Time Slot
            </label>
            <div className="slot-grid">
              {TIME_SLOTS.map((slot) => {
                const isSelected = timeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setTimeSlot(slot)}
                  >
                    {isSelected ? <Check size={14} /> : <Clock size={14} />}
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Reason for Visit / Symptoms</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="e.g. Regular checkup, Fever, Headache, Routine consultation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Fee Summary Card */}
          <div style={{
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            margin: '1rem 0 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#64748B', fontWeight: '600' }}>
              <ShieldCheck size={18} color="#10B981" />
              <span>Guaranteed Consultation Slot</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#2F65F6' }}>
              Fee: $50.00 / ₹500
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
