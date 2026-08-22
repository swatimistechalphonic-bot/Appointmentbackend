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
  Check,
  RotateCcw,
  FileImage
} from 'lucide-react';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

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
          logoUrl: res.data.settings.logoUrl || localStorage.getItem('docadmin_logo_url') || '',
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

      const res = await settingApi.updateSettings(formData);
      if (res.data?.success) {
        setSuccessMsg('✅ Dynamic App Logo & Settings saved successfully! Displayed across Dashboard & Sidebar.');
        window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: res.data.settings || formData }));
        setTimeout(() => {
          setSuccessMsg('');
        }, 4000);
      }
    } catch (err) {
      console.error('Update Settings Error:', err);
      setSuccessMsg('✅ Dynamic App Logo updated locally on Dashboard!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
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
            Dynamic App Logo Upload 📁
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Choose an image file from your computer to update the Dashboard & Sidebar logo</p>
        </div>

        <button onClick={fetchSettings} className="btn btn-secondary btn-sm" title="Reload Settings">
          <RefreshCw size={15} /> Reload Settings
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ background: '#DCFCE7', color: '#166534', borderColor: '#BBF7D0', padding: '0.9rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
          <CheckCircle2 size={20} color="#166534" />
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
          Loading logo settings...
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Card: Choose File Logo Section */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileImage size={22} color="#0066FF" /> Select App Logo Image File
            </h3>

            {/* Live Sidebar Logo Preview Box */}
            <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '1.4rem 1.75rem', borderRadius: '16px', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255, 255, 255, 0.25)', overflow: 'hidden' }}>
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Uploaded Logo Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <HeartPulse size={32} color="#FFFFFF" />
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  DASHBOARD & SIDEBAR LOGO PREVIEW
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF', margin: 0, lineHeight: '1.1' }}>
                  {formData.appName || 'DocAdmin'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '500' }}>
                  {formData.appSubtitle || 'Doctor Appointment System'}
                </span>
              </div>
            </div>

            {/* Dedicated File Chooser UI */}
            <div style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '16px', padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <Upload size={38} color="#0066FF" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                Select Image File from Computer
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
                Supports PNG, JPG, JPEG, SVG image files
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label
                  htmlFor="logoFileInput"
                  className="btn btn-primary"
                  style={{ cursor: 'pointer', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: '700', borderRadius: '10px' }}
                >
                  <Upload size={18} /> Choose File
                </label>
                <input
                  id="logoFileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChoose}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                >
                  <RotateCcw size={15} /> Reset Default
                </button>
              </div>

              {selectedFileName && (
                <div style={{ marginTop: '1rem', color: '#166534', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Check size={16} /> Selected File: {selectedFileName}
                </div>
              )}
            </div>

            {/* App Branding Name & Subtitle Inputs */}
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

          {/* Contact Details Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} color="#0066FF" /> Support Info & Footer
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

          {/* Submit Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.85rem 2.25rem', fontSize: '0.95rem', fontWeight: '700', borderRadius: '12px' }}
              disabled={submitting}
            >
              <Save size={18} /> {submitting ? 'Saving Logo...' : 'Save Dynamic Logo'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
