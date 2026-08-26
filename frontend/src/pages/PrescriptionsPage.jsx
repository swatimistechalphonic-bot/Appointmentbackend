import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  X,
  Printer,
  Calendar,
  User,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { prescriptionApi, patientApi, authApi } from '../services/api';

const PrescriptionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewPrescription, setViewPrescription] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [patientOptions, setPatientOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({
    totalCount: 0,
    todayCount: 0,
    totalMedicinesCount: 0,
    activeCount: 0
  });

  const showNotification = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
  };

  // Form states for creating a new prescription
  const [createFormData, setCreateFormData] = useState({
    patientName: '',
    patientId: '',
    age: '',
    gender: 'Female',
    doctorName: '',
    doctorId: '',
    diagnosis: '',
    followUp: '',
    notes: ''
  });

  const [formMedicines, setFormMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: 'Post meals' }
  ]);

  // Fetch prescription list & stats
  const fetchPrescriptions = async () => {
    setApiLoading(true);
    try {
      const [listRes, statsRes, patientsRes, doctorsRes] = await Promise.allSettled([
        prescriptionApi.getAllPrescriptions({ search: searchTerm || undefined }),
        prescriptionApi.getStats(),
        patientApi.getAllPatients(''),
        authApi.getDoctors()
      ]);

      if (listRes.status === 'fulfilled' && listRes.value?.data?.data) {
        setPrescriptions(listRes.value.data.data);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
        setStats(statsRes.value.data.data);
      }

      if (patientsRes.status === 'fulfilled' && patientsRes.value?.data?.patients) {
        setPatientOptions(patientsRes.value.data.patients);
      }

      if (doctorsRes.status === 'fulfilled') {
        const docs = doctorsRes.value?.data?.doctors || doctorsRes.value?.data || [];
        setDoctorOptions(Array.isArray(docs) ? docs : []);
        if (docs.length > 0 && !createFormData.doctorName) {
          const firstDoc = docs[0];
          setCreateFormData(prev => ({
            ...prev,
            doctorName: firstDoc.name ? `Dr. ${firstDoc.name}` : 'Dr. Consultant',
            doctorId: firstDoc._id || ''
          }));
        }
      }
    } catch (err) {
      console.error('Prescriptions fetch error:', err);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [searchTerm]);

  // Form helpers
  const handleAddMedicineRow = () => {
    setFormMedicines([
      ...formMedicines,
      { name: '', dosage: '', frequency: '', duration: '', instructions: 'Post meals' }
    ]);
  };

  const handleRemoveMedicineRow = (index) => {
    setFormMedicines(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setFormMedicines(prev =>
      prev.map((m, idx) => (idx === index ? { ...m, [field]: value } : m))
    );
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.patientName.trim() || !createFormData.diagnosis.trim()) {
      alert('Please fill out patient name and clinical diagnosis.');
      return;
    }

    // Filter out blank medicines
    const cleanedMedicines = formMedicines.filter(m => m.name && m.name.trim() !== '');

    try {
      const payload = {
        patientName: createFormData.patientName.trim(),
        patientId: createFormData.patientId || undefined,
        age: Number(createFormData.age) || 30,
        gender: createFormData.gender,
        doctorName: createFormData.doctorName.trim() || 'Dr. Specialist',
        doctorId: createFormData.doctorId || undefined,
        diagnosis: createFormData.diagnosis.trim(),
        medicines: cleanedMedicines,
        followUp: createFormData.followUp || 'N/A',
        notes: createFormData.notes || 'No additional notes.'
      };

      const res = await prescriptionApi.createPrescription(payload);
      if (res.data?.data) {
        showNotification(`Prescription ${res.data.data.prescriptionId} generated successfully!`, 'success');
        setIsCreateModalOpen(false);
        // Reset form
        setCreateFormData({
          patientName: '',
          patientId: '',
          age: '',
          gender: 'Female',
          doctorName: doctorOptions[0]?.name ? `Dr. ${doctorOptions[0].name}` : 'Dr. Rahul Sharma',
          doctorId: doctorOptions[0]?._id || '',
          diagnosis: '',
          followUp: '',
          notes: ''
        });
        setFormMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: 'Post meals' }]);
        fetchPrescriptions();
      }
    } catch (err) {
      console.error('Create prescription error:', err);
      showNotification('Failed to generate prescription. Please try again.', 'error');
    }
  };

  const handleDeletePrescription = async (p) => {
    const targetId = p._id || p.prescriptionId || p.id;
    if (!window.confirm(`Are you sure you want to delete prescription ${p.prescriptionId || p.id}?`)) return;

    try {
      await prescriptionApi.deletePrescription(targetId);
      showNotification(`Prescription deleted successfully`, 'warning');
      setPrescriptions(prev => prev.filter(item => (item._id !== p._id && item.prescriptionId !== p.prescriptionId)));
      fetchPrescriptions();
    } catch (err) {
      console.error('Delete prescription error:', err);
      showNotification('Failed to delete prescription', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification Banner */}
      {actionMessage.text && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          background: actionMessage.type === 'success' ? '#ECFDF5' : actionMessage.type === 'warning' ? '#FEF3C7' : '#FEE2E2',
          border: `1px solid ${actionMessage.type === 'success' ? '#10B981' : actionMessage.type === 'warning' ? '#F59E0B' : '#EF4444'}`,
          color: actionMessage.type === 'success' ? '#065F46' : actionMessage.type === 'warning' ? '#92400E' : '#991B1B',
          fontWeight: '700',
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Digital Prescriptions & Referrals
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>Write digital prescriptions, specify dosages, frequencies, and print verified PDF prescription slips</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '240px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Rx ID, Patient, Diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchPrescriptions}
            disabled={apiLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} style={{ animation: apiLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>

          <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
            <Plus size={16} /> Create Prescription
          </button>
        </div>
      </div>

      {/* 2. Prescription Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Prescriptions */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL PRESCRIPTIONS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{stats.totalCount} Issued</div>
          </div>
        </div>

        {/* Card 2: Issued Today */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>ISSUED TODAY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{stats.todayCount} Prescriptions</div>
          </div>
        </div>

        {/* Card 3: Total Medications */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>MEDICATIONS PRESCRIBED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{stats.totalMedicinesCount} Items</div>
          </div>
        </div>

      </div>

      {/* 3. Prescription Log Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ padding: '0.75rem' }}>Prescription ID</th>
                <th style={{ padding: '0.75rem' }}>Patient Name</th>
                <th style={{ padding: '0.75rem' }}>Referring Doctor</th>
                <th style={{ padding: '0.75rem' }}>Clinical Diagnosis</th>
                <th style={{ padding: '0.75rem' }}>Medication Items</th>
                <th style={{ padding: '0.75rem' }}>Issue Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length > 0 ? (
                prescriptions.map((p) => (
                  <tr key={p._id || p.prescriptionId || p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0066FF' }}>{p.prescriptionId || p.id}</td>
                    <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                      <div>{p.patientName}</div>
                      <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '500' }}>
                        {p.age ? `${p.age} Yrs` : ''} {p.gender ? `(${p.gender})` : ''}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', color: '#475569', fontWeight: '600' }}>{p.doctorName}</td>
                    <td style={{ padding: '0.85rem', color: '#0F172A', fontWeight: '700' }}>{p.diagnosis}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{ background: '#EEF4FF', color: '#0066FF', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
                        {p.medicines ? p.medicines.length : 0} Medicines
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', color: '#64748B' }}>{p.date}</td>
                    <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#166534', borderColor: '#A7F3D0', background: '#ECFDF5', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => setViewPrescription(p)}
                        >
                          <FileText size={13} /> View / Print
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                          onClick={() => handleDeletePrescription(p)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                    {apiLoading ? 'Loading digital prescriptions...' : 'No prescriptions recorded yet. Click "Create Prescription" to issue your first Rx!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modals */}

      {/* Modal A: View Prescription Letterhead print preview */}
      {viewPrescription && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }} className="no-print">
              <span style={{ fontSize: '0.9rem', fontWeight: '850', color: '#64748B' }}>Physician's Rx Referral</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }} onClick={() => window.print()}>
                  <Printer size={14} /> Print Rx
                </button>
                <button onClick={() => setViewPrescription(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ color: '#0F172A' }}>
              
              {/* Doctor letterhead details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F172A', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0, textTransform: 'uppercase' }}>CareSync Clinic & Diagnostics</h2>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>123 Healthway Blvd, Sector 62, Noida, India</p>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: '#64748B' }}>Regd. ID: Clinic-2026-67319 | Tel: +91 120 445566</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{viewPrescription.doctorName}</h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.76rem', color: '#64748B' }}>Senior General Consultant</p>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.76rem', color: '#64748B' }}>MD (Medicine) | Reg #MD-67210</p>
                </div>
              </div>

              {/* Patient details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                <div>
                  <div>PATIENT: <strong style={{ color: '#0F172A' }}>{viewPrescription.patientName}</strong></div>
                  <div style={{ marginTop: '0.25rem' }}>Age / Gender: <strong>{viewPrescription.age} Yrs / {viewPrescription.gender}</strong></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>PRESCRIPTION ID: <strong style={{ color: '#0066FF' }}>{viewPrescription.prescriptionId || viewPrescription.id}</strong></div>
                  <div style={{ marginTop: '0.25rem' }}>Date: <strong>{viewPrescription.date}</strong></div>
                </div>
              </div>

              {/* Diagnosis */}
              <div style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <strong style={{ color: '#0F172A' }}>Diagnosis: </strong>
                <span style={{ color: '#475569', fontWeight: '700' }}>{viewPrescription.diagnosis}</span>
              </div>

              {/* Rx sign */}
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0066FF', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                ℞
              </div>

              {/* Medicines table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                    <th style={{ padding: '0.45rem 0' }}>Medicine Name</th>
                    <th style={{ padding: '0.45rem 0', textAlign: 'center' }}>Dosage</th>
                    <th style={{ padding: '0.45rem 0', textAlign: 'center' }}>Frequency</th>
                    <th style={{ padding: '0.45rem 0', textAlign: 'right' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {viewPrescription.medicines && viewPrescription.medicines.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.65rem 0', fontWeight: '800', color: '#334155' }}>
                        {m.name}
                        {m.instructions && (
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '500', marginTop: '0.15rem' }}>
                            Instructions: <strong>{m.instructions}</strong>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0', textAlign: 'center', color: '#475569' }}>{m.dosage || '—'}</td>
                      <td style={{ padding: '0.65rem 0', textAlign: 'center', color: '#475569' }}>{m.frequency || '—'}</td>
                      <td style={{ padding: '0.65rem 0', textAlign: 'right', fontWeight: '800', color: '#0066FF' }}>{m.duration || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Doctor clinical notes */}
              <div style={{ borderLeft: '3px solid #0066FF', paddingLeft: '0.75rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '0 8px 8px 0', fontSize: '0.78rem', color: '#475569', marginBottom: '2rem' }}>
                <strong>Clinical Notes & Advice:</strong>
                <p style={{ margin: '0.25rem 0 0 0', lineHeight: '1.4' }}>{viewPrescription.notes || 'No specific advice noted.'}</p>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', fontSize: '0.78rem' }}>
                <div>
                  <div style={{ color: '#64748B' }}>Follow-up Review Date:</div>
                  <strong style={{ color: '#0066FF', fontSize: '0.85rem' }}>{viewPrescription.followUp || 'N/A'}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ borderBottom: '1px solid #94A3B8', width: '150px', height: '40px', marginBottom: '0.35rem' }} />
                  <div style={{ color: '#64748B' }}>Authorized Physician Signature</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal B: Create Prescription Form */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FileText size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Create Digital Prescription</h2>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Swati Verma"
                    value={createFormData.patientName}
                    onChange={(e) => setCreateFormData({ ...createFormData, patientName: e.target.value })}
                    required
                    list="patient-datalist"
                  />
                  <datalist id="patient-datalist">
                    {patientOptions.map(p => (
                      <option key={p._id || p.name} value={p.name} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="26"
                    value={createFormData.age}
                    onChange={(e) => setCreateFormData({ ...createFormData, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    className="input-field"
                    value={createFormData.gender}
                    onChange={(e) => setCreateFormData({ ...createFormData, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label>Doctor / Consultant *</label>
                  <select
                    className="input-field"
                    value={createFormData.doctorId}
                    onChange={(e) => {
                      const doc = doctorOptions.find(d => d._id === e.target.value);
                      setCreateFormData({
                        ...createFormData,
                        doctorId: e.target.value,
                        doctorName: doc ? `Dr. ${doc.name}` : e.target.value
                      });
                    }}
                  >
                    {doctorOptions.map(d => (
                      <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization || 'Consultant'})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Clinical Diagnosis *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Acute Viral Fever..."
                    value={createFormData.diagnosis}
                    onChange={(e) => setCreateFormData({ ...createFormData, diagnosis: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Medicines dynamic lists */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '850', color: '#0F172A' }}>RX Medicines Prescription list</span>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} onClick={handleAddMedicineRow}>
                    <Plus size={12} /> Add Drug Row
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formMedicines.map((m, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.45rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Drug Name (e.g. Paracetamol)"
                        value={m.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                        required={idx === 0}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Dosage (500mg)"
                        value={m.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Freq (1-0-1)"
                        value={m.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Dur (5 days)"
                        value={m.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                      />
                      {formMedicines.length > 1 && (
                        <button type="button" style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer', padding: '0.25rem' }} onClick={() => handleRemoveMedicineRow(idx)}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={createFormData.followUp}
                    onChange={(e) => setCreateFormData({ ...createFormData, followUp: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Doctor Notes / Lifestyle Advice</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Rest, hydration advice..."
                    value={createFormData.notes}
                    onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: '800' }}>
                  Generate Rx Prescription
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PrescriptionsPage;
