import React from 'react';
import { Grid, Video, FileSpreadsheet, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

const AppsPage = () => {
  const apps = [
    { title: 'Teleconsultation HD Video', desc: 'Secure HD video calls between patients and specialist doctors with instant chat and attachment sharing.', icon: Video, color: '#2F65F6', bg: '#EEF2FF' },
    { title: 'Digital Rx & E-Prescriptions', desc: 'Generate electronic prescriptions, drug interaction alerts, and auto-send to Doctris Pharmacy.', icon: FileSpreadsheet, color: '#10B981', bg: '#ECFDF5' },
    { title: 'ICU & Vitals Live Tracker', desc: 'Real-time telemetry monitoring for patient heart rate, oxygen levels, and blood pressure.', icon: Activity, color: '#EF4444', bg: '#FEE2E2' },
    { title: 'Lab Reports & Diagnostics', desc: 'Automated blood test results, radiology imaging, and diagnostic report generation.', icon: ShieldCheck, color: '#8B5CF6', bg: '#F3E8FF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
          Healthcare Apps Suite & Integrations
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Integrated digital health solutions for hospitals, clinics, and remote patient care</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {apps.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: a.bg, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.4rem' }}>{a.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5' }}>{a.desc}</p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-sm">
                  Launch App <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppsPage;
