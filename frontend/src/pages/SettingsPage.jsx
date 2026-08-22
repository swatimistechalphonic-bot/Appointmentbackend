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
  Palette,
  Upload,
  Check
} from 'lucide-react';

const PRESET_LOGOS = [
  {
    name: 'DocAdmin Medical Pulse (Blue)',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'CareSync Cross (Red)',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Wellness Shield (Green)',
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Hospital Wing (Purple)',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=100&auto=format&fit=crop&q=80'
  }
];

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

  const handleSelectPresetLogo = (url) => {
    setFormData((prev) => ({ ...prev, logoUrl: url }));
  };

  const handleLogoFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
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
        setSuccessMsg('Dynamic Logo & Settings updated successfully!');

        // Dispatch custom global event so Sidebar instantly updates logo!
        window.dispatchEvent(new Event('app_settings_updated'));

        setTimeout(() => {
          setSuccessMsg('');
        }, 3500);
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
            Dynamic App Logo & System Settings ⚙️
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Change app logo dynamically, customize branding title, and update contact details</p>
        </div>

        <button onClick={fetchSettings} className="btn btn-secondary btn-sm" title="Reload Settings">
          <RefreshCw size={15} /> Reload Settings
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
          Loading dynamic system settings...
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card 1: Dynamic Logo & Brand Identity */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={20} color="#0066FF" /> Dynamic Logo Management
            </h3>

            {/* Live Logo Preview Box */}
            <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '1.25rem 1.5rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid #334155' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Dynamic Logo Preview"
                    style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <HeartPulse size={28} color="#FFFFFF" />
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  LIVE SIDEBAR LOGO PREVIEW
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF', margin: 0, lineHeight: '1.1' }}>
                  {formData.appName || 'DocAdmin'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '500' }}>
                  {formData.appSubtitle || 'Doctor Appointment System'}
                </span>
              </div>
            </div>

            {/* Logo Presets Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.65rem', display: 'block' }}>
                Option A: Choose Preset Medical Logo
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                {PRESET_LOGOS.map((preset) => {
                  const isSelected = formData.logoUrl === preset.url;
                  return (
                    <div
                      key={preset.name}
                      onClick={() => handleSelectPresetLogo(preset.url)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #0066FF' : '1px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : '#F8FAFC',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <img src={preset.url} alt={preset.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, fontSize: '0.78rem', fontWeight: '700', color: '#0F172A' }}>
                        {preset.name}
                      </div>
                      {isSelected && <Check size={16} color="#0066FF" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logo URL Input & File Upload */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label>Option B: Paste Direct Logo URL</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Option C: Upload Logo File from Device</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={handleLogoFileUpload}
                  style={{ padding: '0.45rem' }}
                />
              </div>
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

          {/* Card 2: Contact Info & Footer */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} color="#0066FF" /> Contact Details & Footer Text
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
              <Save size={18} /> {submitting ? 'Saving Logo & Settings...' : 'Save Dynamic Logo & Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
