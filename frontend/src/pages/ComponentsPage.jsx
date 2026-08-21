import React from 'react';
import { Box, Check, X, AlertCircle, Bell, Heart, Star } from 'lucide-react';

const ComponentsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
          Doctris UI Kit & Components
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Design system components, buttons, badges, status indicators, and inputs</p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1E293B' }}>1. Buttons & Actions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-primary btn-sm">Small Primary</button>
          <button className="btn btn-secondary btn-sm">Small Secondary</button>
          <button className="action-circle-btn accept"><Check size={16} /></button>
          <button className="action-circle-btn decline"><X size={16} /></button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1E293B' }}>2. Status Badges</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span className="badge badge-pending">Pending Approval</span>
          <span className="badge badge-confirmed">Confirmed Visit</span>
          <span className="badge badge-completed">Completed Visit</span>
          <span className="badge badge-cancelled">Cancelled Booking</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1E293B' }}>3. Alerts & Banners</h3>
        <div className="alert alert-success">
          <Check size={18} />
          <span>Success Alert: Appointment booked and confirmed successfully!</span>
        </div>
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>Error Alert: Unable to process request. Check network connection.</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1E293B' }}>4. Form Control Inputs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Text Input</label>
            <input type="text" className="input-field" placeholder="Enter patient name..." />
          </div>
          <div className="form-group">
            <label>Select Option</label>
            <select className="input-field" defaultValue="1">
              <option value="1">Cardiology Department</option>
              <option value="2">Neurology Department</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentsPage;
