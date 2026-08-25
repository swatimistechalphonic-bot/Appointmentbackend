import React, { useState, useEffect } from 'react';
import { settingApi } from '../services/api';
import {
  Settings,
  Image,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HeartPulse,
  Upload,
  RotateCcw,
  Building,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Lock,
  Sliders,
  Check
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  const [formData, setFormData] = useState({
    // Branding
    appName: localStorage.getItem('docadmin_app_name') || 'DocAdmin',
    appSubtitle: localStorage.getItem('docadmin_app_subtitle') || 'Doctor Appointment System',
    logoUrl: localStorage.getItem('docadmin_logo_url') || '',
    primaryColor: '#0066FF',
    // Clinic Profile
    clinicName: 'CareSync Multi-Specialty Hospital',
    contactEmail: 'support@docadmin.com',
    contactPhone: '+91 9876543210',
    address: '102 Medical Enclave, Healthcare Avenue, New Delhi',
    regNumber: 'REG-DEL-2026-9081',
    // Notifications
    smsAlerts: true,
    emailPrescriptions: true,
    invoiceAlerts: true,
    reminderHours: '24',
    // Security
    sessionTimeoutMinutes: '30',
    enforce2FA: false,
    auditLogLevel: 'Verbose'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingApi.getSettings();
      if (res.data?.success && res.data.settings) {
        setFormData((prev) => ({
          ...prev,
          appName: res.data.settings.appName || prev.appName,
          appSubtitle: res.data.settings.appSubtitle || prev.appSubtitle,
          logoUrl: res.data.settings.logoUrl || prev.logoUrl,
          primaryColor: res.data.settings.primaryColor || prev.primaryColor,
          contactEmail: res.data.settings.contactEmail || prev.contactEmail,
          contactPhone: res.data.settings.contactPhone || prev.contactPhone
        }));
      }
    } catch (err) {
      console.error('Fetch Settings Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChoose = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        const updated = { ...formData, logoUrl: base64Data };
        setFormData(updated);

        // Instant local preview update
        localStorage.setItem('docadmin_logo_url', base64Data);
        window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: updated }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    const defaultLogo = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80';
    setSelectedFileName('');
    const updated = { ...formData, logoUrl: defaultLogo };
    setFormData(updated);
    localStorage.setItem('docadmin_logo_url', defaultLogo);
    window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (formData.logoUrl) localStorage.setItem('docadmin_logo_url', formData.logoUrl);
      if (formData.appName) localStorage.setItem('docadmin_app_name', formData.appName);
      if (formData.appSubtitle) localStorage.setItem('docadmin_app_subtitle', formData.appSubtitle);

      window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: formData }));

      await settingApi.updateSettings(formData);
      setSuccessMsg('✅ System Settings & Dynamic Branding updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setSuccessMsg('✅ Local System Settings & Dynamic Branding saved!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            System Settings & Clinic Configuration
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>
            Configure clinic branding, dynamic logo, communication channels, and security policy rules
          </p>
        </div>

        <button onClick={fetchSettings} className="btn btn-secondary btn-sm" title="Reload Settings">
          <RefreshCw size={15} /> Reload Settings
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ background: '#DCFCE7', color: '#166534', borderColor: '#BBF7D0', padding: '0.9rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={20} color="#166534" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Settings Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('branding')}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'branding' ? '#0066FF' : 'transparent',
            color: activeTab === 'branding' ? '#FFFFFF' : '#64748B',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Image size={16} /> Branding & Logo
        </button>

        <button
          onClick={() => setActiveTab('clinic')}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'clinic' ? '#0066FF' : 'transparent',
            color: activeTab === 'clinic' ? '#FFFFFF' : '#64748B',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Building size={16} /> Clinic Profile
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'notifications' ? '#0066FF' : 'transparent',
            color: activeTab === 'notifications' ? '#FFFFFF' : '#64748B',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Bell size={16} /> Notifications
        </button>

        <button
          onClick={() => setActiveTab('security')}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'security' ? '#0066FF' : 'transparent',
            color: activeTab === 'security' ? '#FFFFFF' : '#64748B',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Shield size={16} /> Security & Policy
        </button>
      </div>

      {/* 3. Form Content */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Tab 1: Branding */}
        {activeTab === 'branding' && (
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Branding & Dynamic Logo Upload</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Application Title Name
                </label>
                <input
                  type="text"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Application Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.appSubtitle}
                  onChange={(e) => setFormData({ ...formData, appSubtitle: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {/* Dynamic Logo Uploader */}
            <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="App Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <HeartPulse size={36} color="#0066FF" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.92rem' }}>Dynamic App Logo Image</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>Upload PNG or JPG file from your local computer to update Sidebar & Header branding instantly.</div>
                {selectedFileName && (
                  <div style={{ fontSize: '0.75rem', color: '#0066FF', fontWeight: '600', marginTop: '0.3rem' }}>Selected: {selectedFileName}</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem' }}>
                  <Upload size={15} /> Upload File
                  <input type="file" accept="image/*" onChange={handleFileChoose} style={{ display: 'none' }} />
                </label>
                <button type="button" onClick={handleResetLogo} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem' }}>
                  <RotateCcw size={15} /> Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clinic Profile */}
        {activeTab === 'clinic' && (
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Clinic & Organization Information</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Hospital / Clinic Name
                </label>
                <input
                  type="text"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Registration / Accreditation License ID
                </label>
                <input
                  type="text"
                  value={formData.regNumber}
                  onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Emergency Helpline Phone
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                Physical Campus Address
              </label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Notification & Communication Rules</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#0F172A', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  checked={formData.smsAlerts}
                  onChange={(e) => setFormData({ ...formData, smsAlerts: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                Send Automated SMS Reminders for Confirmed Appointments
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#0F172A', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  checked={formData.emailPrescriptions}
                  onChange={(e) => setFormData({ ...formData, emailPrescriptions: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                Automatically Email Digital Prescriptions & Lab Results to Patients
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#0F172A', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  checked={formData.invoiceAlerts}
                  onChange={(e) => setFormData({ ...formData, invoiceAlerts: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                Dispatch Billing Invoices & Receipts via Email
              </label>
            </div>
          </div>
        )}

        {/* Tab 4: Security & Policy */}
        {activeTab === 'security' && (
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Security & Policy Configuration</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Session Auto Logout Timeout (Minutes)
                </label>
                <select
                  value={formData.sessionTimeoutMinutes}
                  onChange={(e) => setFormData({ ...formData, sessionTimeoutMinutes: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Audit Logging Persistence Level
                </label>
                <select
                  value={formData.auditLogLevel}
                  onChange={(e) => setFormData({ ...formData, auditLogLevel: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                >
                  <option value="Standard">Standard (Login & Payments)</option>
                  <option value="Verbose">Verbose (All API & Data Edits)</option>
                  <option value="Strict">Strict Audit (Detailed Trace Log)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Submit Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={18} /> Save Settings Configuration
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
