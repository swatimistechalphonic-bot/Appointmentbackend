import React, { useState, useEffect, useCallback } from 'react';
import { dischargeSummaryApi } from '../services/api';
import {
  FileCheck2,
  Search,
  Plus,
  Eye,
  Printer,
  X,
  AlertCircle,
  Calendar,
  User,
  HeartPulse
} from 'lucide-react';

const DischargeSummariesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [summaries, setSummaries] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, finalized: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, listRes] = await Promise.all([
        dischargeSummaryApi.getStats(),
        dischargeSummaryApi.getAllSummaries({ search: searchTerm || undefined })
      ]);
      setStats(statsRes.data.data || { total: 0, today: 0, finalized: 0 });
      setSummaries(listRes.data.data || []);
    } catch {
      setError('Failed to fetch discharge summaries. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.diagnosis.trim()) return;
    setSubmitting(true);
    try {
      await dischargeSummaryApi.createSummary(formData);
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
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate discharge summary');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintMock = () => {
    window.print();
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileCheck2 size={26} color="#0066FF" /> Discharge Summaries
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Generate, sign off, and print official patient discharge summaries
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0 12px' }}>
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search Patient, Diagnosis or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem 0', fontSize: '0.82rem', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-primary)' }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setIsGenerateModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Generate Summary
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL DISCHARGE SUMMARIES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{stats.total || 0}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>TODAY'S DISCHARGES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{stats.today || 0}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>FINALIZED & SIGNED OFF</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{stats.finalized || 0}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: 'var(--text-muted)', gap: 10 }}>
            <div className="loading-spinner" /> Loading discharge summaries...
          </div>
        ) : (
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
                {summaries.length > 0 ? (
                  summaries.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{s.patientName}</div>
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
                        <span className="doc-badge confirmed" style={{ fontSize: '0.75rem' }}>
                          {s.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="View Official Discharge Summary"
                            onClick={() => setPreviewSummary(s)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Eye size={15} /> View &amp; Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                      No discharge summaries generated yet. Click "Generate Summary" to generate one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Generate Discharge Summary */}
      {isGenerateModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsGenerateModalOpen(false)}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileCheck2 size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Generate Patient Discharge Summary</h2>
              </div>
              <button onClick={() => setIsGenerateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Ramesh Chandra"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    required
                    className="input-field"
                    placeholder="45"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    className="input-field"
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Admission Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Discharge Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.dischargeDate}
                    onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Attending Physician / Surgeon</label>
                <select
                  value={formData.attendingDoctor}
                  className="input-field"
                  onChange={(e) => setFormData({ ...formData, attendingDoctor: e.target.value })}
                >
                  <option value="Dr. Rahul Sharma (Cardiologist)">Dr. Rahul Sharma (Cardiologist)</option>
                  <option value="Dr. Ananya Roy (General Surgeon)">Dr. Ananya Roy (General Surgeon)</option>
                  <option value="Dr. Vikram Seth (Neurologist)">Dr. Vikram Seth (Neurologist)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Final Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Acute Gastroenteritis with Moderate Dehydration"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Hospital Clinical Course &amp; Summary</label>
                <textarea
                  rows="3"
                  className="input-field"
                  placeholder="Summary of inpatient stay, IV fluids, surgery or medications given..."
                  value={formData.hospitalCourse}
                  onChange={(e) => setFormData({ ...formData, hospitalCourse: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Discharge Prescribed Medications</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Tab Cefixime 200mg BD x 5 days, Tab Pantocid 40mg OD"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Discharge Advice &amp; Diet</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Take plenty of oral fluids, rest for 3 days."
                    value={formData.advice}
                    onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 2026-09-02"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsGenerateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Generating...' : 'Generate Summary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Printable Summary Document Preview */}
      {previewSummary && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPreviewSummary(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F172A', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0066FF', fontWeight: '800', fontSize: '1.25rem' }}>
                  <HeartPulse size={24} /> CareSync Hospital &amp; IPD Care
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
                <h4 style={{ color: '#0F172A', fontWeight: '800', marginBottom: '0.2rem', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.2rem' }}>Discharge Advice &amp; Diet</h4>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handlePrintMock}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
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
