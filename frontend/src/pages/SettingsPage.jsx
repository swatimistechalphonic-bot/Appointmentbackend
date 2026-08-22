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
  Mail,
  Phone,
  Palette
} from 'lucide-react';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    appName: 'DocAdmin',
    appSubtitle: 'Doctor Appointment System',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#0066FF',
    contactEmail: 'support@docadmin.com',
    contactPhone: '+1 (555) 019-2834',
    footerText: '© 2026 DocAdmin. All rights reserved.'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingApi.getSettings();
      if (res.data?.success && res.data.settings) {
        setFormData({
          appName: res.data.settings.appName || 'DocAdmin',
          appSubtitle: res.data.settings.appSubtitle || 'Doctor Appointment System',
          logoUrl: res.data.settings.logoUrl || '',
          faviconUrl: res.data.settings.faviconUrl || '',
          primaryColor: res.data.settings.primaryColor || '#0066FF',
          contactEmail: res.data.settings.contactEmail || 'support@docadmin.com',
          contactPhone: res.data.settings.contactPhone || '+1 (555) 019-2834',
          footerText: res.data.settings.footerText || '© 2026 DocAdmin. All rights reserved.'
        });
      }
    } catch (err) {
      console.error('Fetch Settings Error:', err);
      setErrorMsg('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await settingApi.updateSettings(formData);
      if (res.data?.success) {
        setSuccessMsg('System settings & dynamic logo saved successfully! Refreshing app header...');
        setTimeout(() => {
          setSuccessMsg('');
        }, 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update system settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
      {/* Header Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            System Settings & Dynamic Logo Settings ⚙️
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Configure global branding, dynamic app logo, title, and contact details</p>
        </div>

        <button onClick={fetchSettings} className="btn btn-secondary btn-sm" title="Reload Settings">
          <RefreshCw size={15} /> Reload
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          Loading system branding settings...
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card 1: Dynamic Logo & Brand Identity */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={20} color="#0066FF" /> Dynamic App Logo & Branding
            </h3>

            {/* Live Logo Preview Box */}
            <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', padding: '1.25rem 1.5rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo Preview"
                    style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '8px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <HeartPulse size={28} color="#FFFFFF" />
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  LIVE SIDEBAR BRANDING PREVIEW
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF', margin: 0, lineHeight: '1.1' }}>
                  {formData.appName || 'DocAdmin'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '500' }}>
                  {formData.appSubtitle || 'Doctor Appointment System'}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Dynamic App Logo Image URL (PNG / SVG / JPG) *</label>
              <input
                type="text"
                className="input-field"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.3rem', display: 'block' }}>
                Paste direct image URL to update logo across Sidebar and Navbar.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>App Title / Brand Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>App Subtitle / Tagline</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.appSubtitle}
                  onChange={(e) => setFormData({ ...formData, appSubtitle: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Contact Info & Theme Customization */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} color="#0066FF" /> Contact Details & Footer
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Support Contact Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Support Contact Phone</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Footer Copyright Text</label>
              <input
                type="text"
                className="input-field"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
              />
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={submitting}>
              <Save size={18} /> {submitting ? 'Saving Settings...' : 'Save System Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
