import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  Plus,
  Eye,
  Printer,
  Download,
  X,
  FileText,
  UserCheck,
  CheckCircle2,
  Calendar,
  User,
  HeartPulse
} from 'lucide-react';

const initialSummaries = [
  {
    id: 'DS-7001',
    patientName: 'Vikram Sharma',
    age: 52,
    gender: 'Male',
    admissionDate: '2026-08-20',
    dischargeDate: '2026-08-25',
    attendingDoctor: 'Dr. Rahul Sharma (Cardiologist)',
    diagnosis: 'Acute Coronary Syndrome — Stabilized',
    hospitalCourse: 'Patient admitted with acute chest discomfort. Emergency angiography performed; conservative medical management continued with antiplatelets and statins. Hemodynamically stable upon discharge.',
    advice: 'Low sodium diet, strict blood pressure monitoring, light walking.',
    medications: 'Tab. Aspirin 75mg OD, Tab. Atorvastatin 40mg HS, Tab. Metoprolol 25mg BD',
    followUpDate: '2026-09-01',
    status: 'Finalized'
  },
  {
    id: 'DS-7002',
    patientName: 'Rajesh Kumar',
    age: 44,
    gender: 'Male',
    admissionDate: '2026-08-22',
    dischargeDate: '2026-08-25',
    attendingDoctor: 'Dr. Ananya Roy (General Surgeon)',
    diagnosis: 'Acute Appendectomy — Uncomplicated',
    hospitalCourse: 'Laparoscopic appendectomy performed under general anesthesia. Post-operative recovery smooth; surgical site clean and healing well. Tolerating normal oral diet.',
    advice: 'Avoid heavy weight lifting for 3 weeks. Keep incision clean and dry.',
    medications: 'Tab. Augmentin 625mg BD x 5 days, Tab. Zerodol-SP BD x 3 days',
    followUpDate: '2026-08-30',
    status: 'Finalized'
  }
];

const DischargeSummariesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [summaries, setSummaries] = useState(() => {
    const saved = localStorage.getItem('caresync_discharge_summaries');
    return saved ? JSON.parse(saved) : initialSummaries;
  });

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [previewSummary, setPreviewSummary] = useState(null);

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    admissionDate: '',
    dischargeDate: new Date().toISOString().split('T')[0],
    attendingDoctor: 'Dr. Rahul Sharma (Cardiologist)',
    diagnosis: '',
    hospitalCourse: '',
    advice: '',
    medications: '',
    followUpDate: ''
  });

  useEffect(() => {
    localStorage.setItem('caresync_discharge_summaries', JSON.stringify(summaries));
  }, [summaries]);

  const filteredSummaries = summaries.filter((s) => {
    return (
      s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Metrics
  const totalCount = summaries.length;
  const todayCount = summaries.filter((s) => s.dischargeDate === new Date().toISOString().split('T')[0]).length;
  const finalizedCount = summaries.filter((s) => s.status === 'Finalized').length;

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.diagnosis.trim()) return;

    const newDoc = {
      id: 'DS-' + Math.floor(7000 + Math.random() * 900),
      patientName: formData.patientName,
      age: Number(formData.age) || 40,
      gender: formData.gender,
      admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
      dischargeDate: formData.dischargeDate || new Date().toISOString().split('T')[0],
      attendingDoctor: formData.attendingDoctor,
      diagnosis: formData.diagnosis,
      hospitalCourse: formData.hospitalCourse || 'Patient responded well to inpatient clinical protocol.',
      advice: formData.advice || 'Follow dietary guidelines and take prescribed medications regularly.',
      medications: formData.medications || 'Prescribed discharge medications listed.',
      followUpDate: formData.followUpDate || 'In 7 Days',
      status: 'Finalized'
    };

    setSummaries([newDoc, ...summaries]);
    setIsGenerateModalOpen(false);
    setFormData({
      patientName: '',
      age: '',
      gender: 'Male',
      admissionDate: '',
      dischargeDate: new Date().toISOString().split('T')[0],
      attendingDoctor: 'Dr. Rahul Sharma (Cardiologist)',
      diagnosis: '',
      hospitalCourse: '',
      advice: '',
      medications: '',
      followUpDate: ''
    });
  };

  const handlePrintMock = (doc) => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Auto-Generated Discharge Summary Generator
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>
            Generate, sign off, and print official patient discharge summaries, clinical diagnosis, treatment courses, & follow-up plans
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '230px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Patient, Diagnosis or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsGenerateModalOpen(true)}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Generate Discharge Summary
          </button>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL DISCHARGE SUMMARIES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>TODAY'S DISCHARGES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{todayCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>FINALIZED & SIGNED OFF</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{finalizedCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Summary Record & Patient</th>
                <th>Admission - Discharge</th>
                <th>Attending Physician</th>
                <th>Final Diagnosis</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummaries.length > 0 ? (
                filteredSummaries.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.9rem' }}>{s.patientName}</div>
                        <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{s.id} • {s.age} Yrs ({s.gender})</div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: '600' }}>
                        {s.admissionDate} <span style={{ color: '#94A3B8' }}>to</span> {s.dischargeDate}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.84rem', color: '#0066FF', fontWeight: '600' }}>{s.attendingDoctor}</span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '600', maxWidth: '260px' }}>
                        {s.diagnosis}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        {s.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="action-btn"
                          title="View Official Discharge Summary"
                          onClick={() => setPreviewSummary(s)}
                          style={{ color: '#0066FF', background: '#EFF6FF', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={15} /> View & Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    No discharge summaries generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal: Generate Discharge Summary */}
      {isGenerateModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '580px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              borderRadius: '20px',
              background: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileCheck2 size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>Generate Patient Discharge Summary</h2>
              </div>
              <button onClick={() => setIsGenerateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="45"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Discharge Date
                  </label>
                  <input
                    type="date"
                    value={formData.dischargeDate}
                    onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Attending Physician / Surgeon
                </label>
                <select
                  value={formData.attendingDoctor}
                  onChange={(e) => setFormData({ ...formData, attendingDoctor: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                >
                  <option value="Dr. Rahul Sharma (Cardiologist)">Dr. Rahul Sharma (Cardiologist)</option>
                  <option value="Dr. Ananya Roy (General Surgeon)">Dr. Ananya Roy (General Surgeon)</option>
                  <option value="Dr. Vikram Seth (Neurologist)">Dr. Vikram Seth (Neurologist)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Final Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Gastroenteritis with Moderate Dehydration"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Hospital Clinical Course & Summary
                </label>
                <textarea
                  rows="3"
                  placeholder="Summary of inpatient stay, IV fluids, surgery or medications given..."
                  value={formData.hospitalCourse}
                  onChange={(e) => setFormData({ ...formData, hospitalCourse: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Discharge Prescribed Medications
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tab Cefixime 200mg BD x 5 days, Tab Pantocid 40mg OD"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Discharge Advice & Diet
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Take plenty of oral fluids, rest for 3 days."
                    value={formData.advice}
                    onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Follow-up Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-09-02"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '700' }}
                >
                  Generate Summary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Official Printable Summary Document Preview */}
      {previewSummary && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2.25rem',
              borderRadius: '20px',
              background: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F172A', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0066FF', fontWeight: '800', fontSize: '1.25rem' }}>
                  <HeartPulse size={24} /> CareSync Hospital & IPD Care
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Healthcare Avenue, Medical District • Tel: +91 9876543210
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A' }}>DISCHARGE SUMMARY</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Doc Ref: {previewSummary.id}</div>
                <button onClick={() => setPreviewSummary(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', marginTop: '0.3rem' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Patient Meta Block */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <div><strong>Patient Name:</strong> {previewSummary.patientName}</div>
              <div><strong>Age / Gender:</strong> {previewSummary.age} Yrs / {previewSummary.gender}</div>
              <div><strong>Admission Date:</strong> {previewSummary.admissionDate}</div>
              <div><strong>Discharge Date:</strong> {previewSummary.dischargeDate}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Attending Doctor:</strong> {previewSummary.attendingDoctor}</div>
            </div>

            {/* Clinical Content Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', lineHeight: '1.5' }}>
              <div>
                <h4 style={{ color: '#0F172A', fontWeight: '800', marginBottom: '0.2rem', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.2rem' }}>Final Diagnosis</h4>
                <p style={{ color: '#334155', fontWeight: '600' }}>{previewSummary.diagnosis}</p>
              </div>

              <div>
                <h4 style={{ color: '#0F172A', fontWeight: '800', marginBottom: '0.2rem', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.2rem' }}>Hospital Clinical Course</h4>
                <p style={{ color: '#475569' }}>{previewSummary.hospitalCourse}</p>
              </div>

              <div>
                <h4 style={{ color: '#0F172A', fontWeight: '800', marginBottom: '0.2rem', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.2rem' }}>Discharge Prescriptions</h4>
                <p style={{ color: '#0066FF', fontFamily: 'monospace', fontWeight: '700' }}>{previewSummary.medications}</p>
              </div>

              <div>
                <h4 style={{ color: '#0F172A', fontWeight: '800', marginBottom: '0.2rem', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.2rem' }}>Discharge Advice & Diet</h4>
                <p style={{ color: '#475569' }}>{previewSummary.advice}</p>
              </div>

              <div style={{ background: '#EFF6FF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                <span style={{ color: '#1E40AF', fontWeight: '700' }}>Follow-up Consultation Date:</span> <span style={{ color: '#1E3A8A', fontWeight: '800' }}>{previewSummary.followUpDate}</span>
              </div>
            </div>

            {/* Doctor Signature */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px dashed #CBD5E1' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Generated digitally via CareSync EMR Engine.
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>{previewSummary.attendingDoctor}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Authorized Clinical Sign-off</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => handlePrintMock(previewSummary)}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DischargeSummariesPage;
