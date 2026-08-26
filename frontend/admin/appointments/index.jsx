import React from 'react';
import BookAppointmentModal from '../../src/components/BookAppointmentModal';

const Appointments = () => {
  return (
    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Appointments Management</h2>
      <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>View, schedule, and cancel clinic appointments.</p>
      <BookAppointmentModal isOpen={true} onClose={() => {}} />
    </div>
  );
};

export default Appointments;
