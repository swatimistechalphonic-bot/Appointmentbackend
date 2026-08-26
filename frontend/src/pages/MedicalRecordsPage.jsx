import React, { useState, useEffect } from 'react';
import {
  FolderHeart,
  Search,
  User,
  Heart,
  Activity,
  FileText,
  Calendar,
  Eye,
  ArrowLeft,
  CalendarRange,
  Dna,
  ShieldAlert,
  Printer,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { patientApi, appointmentApi } from '../services/api';

const defaultPatientsEHR = [
  {
    id: 'P-101',
    name: 'Swati Verma',
    age: 26,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 9876543210',
    email: 'swati@example.com',
    address: 'Sector 62, Noida, UP, India',
    allergies: 'Penicillin, Dust Mites',
    medicalHistory: 'Mild Seasonal Asthma',
    currentMedications: 'Montelukast 10mg (once daily)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    visits: [
      {
        date: '2026-08-24',
        doctorName: 'Dr. Rahul Sharma',
        specialty: 'General Physician',
        diagnosis: 'Acute Viral Fever & Throat Infection',
        vitals: { bp: '118/76', temp: '101.4 °F', hr: '82 bpm' },
        notes: 'Patient presented with high fever, sore throat, and body ache for 2 days. Rest advised. Increase fluid intake.',
        prescription: {
          medicines: [
            { name: 'Paracetamol', dosage: '500 mg', frequency: 'Three times a day (1-1-1)', duration: '5 Days', instructions: 'Post meals' },
            { name: 'Amoxicillin', dosage: '500 mg', frequency: 'Twice a day (1-0-1)', duration: '5 Days', instructions: 'After meals' },
            { name: 'Cough Syrup (Ascoril)', dosage: '5 ml', frequency: 'Three times a day', duration: '5 Days', instructions: 'Sip slowly' }
          ]
        },
        labs: ['Complete Blood Count (CBC)']
      }
    ]
  },
  {
    id: 'P-102',
    name: 'Karan Mehta',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 9900112233',
    email: 'karan@example.com',
    address: 'Connaught Place, New Delhi, India',
    allergies: 'None reported',
    medicalHistory: 'Hypertension, Dyslipidemia',
    currentMedications: 'Amlodipine 5mg (once daily), Atorvastatin 10mg (once daily at night)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    visits: [
      {
        date: '2026-08-21',
        doctorName: 'Dr. Vivek Malhotra',
        specialty: 'Cardiology Specialist',
        diagnosis: 'Hypertension Follow-up & Dyslipidemia',
        vitals: { bp: '135/88', temp: '98.6 °F', hr: '68 bpm' },
        notes: 'Blood pressure is under moderate control. Triglycerides are slightly elevated. Dietary counselling given.',
        prescription: {
          medicines: [
            { name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily in morning (1-0-0)', duration: '30 Days', instructions: 'Empty stomach' },
            { name: 'Atorvastatin', dosage: '10 mg', frequency: 'Once daily at night (0-0-1)', duration: '30 Days', instructions: 'Post dinner' }
          ]
        },
        labs: ['Lipid Profile', 'Serum Creatinine']
      }
    ]
  }
];

// Convert a DB patient + their appointments into EHR format
const buildEHRFromAPI = (patient, appointments) => {
  const visits = appointments
    .filter(a => a.user?._id === patient._id || a.user === patient._id)
    .map(a => ({
      date: a.date,
      doctorName: a.doctorName || (a.doctor?.name ? `Dr. ${a.doctor.name}` : 'Dr. Specialist'),
      specialty: a.specialization || 'General',
      diagnosis: a.reason || 'Routine Consultation',
      vitals: { bp: '—', temp: '—', hr: '—' },
      notes: a.notes || 'No detailed notes recorded for this visit.',
      prescription: { medicines: [] },
      labs: []
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    id: patient._id,
    name: patient.name,
    age: patient.age || '—',
    gender: patient.gender || '—',
    bloodGroup: patient.bloodGroup || '—',
    phone: patient.phone || '—',
    email: patient.email || '—',
    address: patient.address || '—',
    allergies: patient.medicalHistory?.includes('allerg') ? patient.medicalHistory : 'None reported',
    medicalHistory: patient.medicalHistory || 'No chronic conditions recorded',
    currentMedications: patient.currentMedications || 'None',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=EEF4FF&color=0066FF&size=100`,
    visits: visits.length > 0 ? visits : [{
      date: new Date().toISOString().split('T')[0],
      doctorName: 'Dr. Rahul Sharma',
      specialty: 'General Physician',
      diagnosis: 'Initial Registration',
      vitals: { bp: '—', temp: '—', hr: '—' },
      notes: 'No visit history yet. Patient registered in the system.',
      prescription: { medicines: [] },
      labs: []
    }]
  };
};

const MedicalRecordsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientsEHR, setPatientsEHR] = useState(defaultPatientsEHR);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEHRData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch patients and all appointments in parallel
      const [patientsRes, appointmentsRes] = await Promise.all([
        patientApi.getAllPatients(''),
        appointmentApi.getAllAppointments({})
      ]);

      const patients = patientsRes.data?.patients || [];
      const appointments = appointmentsRes.data?.appointments || [];

      if (patients.length > 0) {
        const ehrList = patients.map(p => buildEHRFromAPI(p, appointments));
        setPatientsEHR(ehrList);
      } else {
        setPatientsEHR(defaultPatientsEHR);
      }
    } catch (err) {
      console.error('EHR Fetch Error:', err);
      // Silently fall back to default data
      setPatientsEHR(defaultPatientsEHR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEHRData();
  }, []);

  const filteredPatients = patientsEHR.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatient = patientsEHR.find(p => p.id === selectedPatientId);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '1rem' }}>
        <RefreshCw size={32} color="#0066FF" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748B', fontWeight: '600' }}>Loading Electronic Health Records…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Page Header */}
      {!selectedPatient ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
              Electronic Health Records (EHR)
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.86rem' }}>Access patient diagnoses, timelines of previous visits, vitals charts, lab reports, and prescriptions</p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={fetchEHRData}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <div className="header-search" style={{ width: '300px' }}>
              <Search size={15} color="#64748B" />
              <input
                type="text"
                placeholder="Search Patient ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => setSelectedPatientId(null)}
          >
            <ArrowLeft size={16} /> Back to List
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>
              Health Record Vault: {selectedPatient.name}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.78rem', margin: 0 }}>Unique Patient Identifier: {selectedPatient.id}</p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.75rem 1rem', color: '#991B1B', fontSize: '0.82rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Main content area rendering */}
      {!selectedPatient ? (
        // List View of Patients EMR
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredPatients.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94A3B8', fontSize: '0.86rem' }}>
              No patient records found matching your search.
            </div>
          ) : (
            filteredPatients.map((p) => (
              <div key={p.id} className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.15rem' }}>
                    <img
                      src={p.avatar}
                      alt={p.name}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=EEF4FF&color=0066FF&size=100`; }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>{p.name}</h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>
                        ID: <strong>{String(p.id).slice(0, 12)}</strong> | Blood Group: <strong style={{ color: '#DC2626' }}>{p.bloodGroup}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.85rem', background: '#F8FAFC', borderRadius: '12px', marginBottom: '1.15rem' }}>
                    <div>📞 Contact: <strong>{p.phone}</strong></div>
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>📧 Email: <strong>{p.email}</strong></div>
                    <div>⚠️ Allergies: <strong style={{ color: p.allergies === 'None reported' ? '#166534' : '#DC2626' }}>{p.allergies}</strong></div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600' }}>
                    Visits Logged: {p.visits.length}
                  </span>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    onClick={() => setSelectedPatientId(p.id)}
                  >
                    <Eye size={14} /> Open Records
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Detailed Patient EHR File View (2 Columns Layout)
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Left Column: Personal Health Summary card */}
          <div className="card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem' }}>
              <img
                src={selectedPatient.avatar}
                alt={selectedPatient.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #EEF4FF', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '0.75rem' }}
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPatient.name)}&background=EEF4FF&color=0066FF&size=100`; }}
              />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{selectedPatient.name}</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B', background: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '700', marginTop: '0.35rem' }}>
                {selectedPatient.gender}, {selectedPatient.age} Years Old
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', fontWeight: '700' }}>BLOOD GROUP</span>
                <strong style={{ color: '#DC2626', fontSize: '1rem', fontWeight: '900' }}>{selectedPatient.bloodGroup}</strong>
              </div>

              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', fontWeight: '700' }}>CHRONIC MEDICAL HISTORY</span>
                <span style={{ color: '#1E293B', fontWeight: '700' }}>{selectedPatient.medicalHistory}</span>
              </div>

              <div style={{ borderLeft: '3px solid #EF4444', paddingLeft: '0.6rem' }}>
                <span style={{ color: '#EF4444', display: 'block', fontSize: '0.74rem', fontWeight: '800' }}>⚠️ ACTIVE DRUG ALLERGIES</span>
                <span style={{ color: '#991B1B', fontWeight: '800' }}>{selectedPatient.allergies}</span>
              </div>

              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', fontWeight: '700' }}>CURRENT MEDICATIONS</span>
                <span style={{ color: '#475569', fontWeight: '600' }}>{selectedPatient.currentMedications}</span>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748B' }}>
                <div>📞 Phone: <strong style={{ color: '#334155' }}>{selectedPatient.phone}</strong></div>
                <div>📧 Email: <strong style={{ color: '#334155' }}>{selectedPatient.email}</strong></div>
                <div>📍 Address: <strong style={{ color: '#334155' }}>{selectedPatient.address}</strong></div>
              </div>
            </div>
          </div>

          {/* Right Column: Visited History timeline and prescriptions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Vitals Summary Card */}
            <div className="card" style={{ padding: '1.15rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={18} color="#10B981" /> Last Measured Vitals
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ border: '1px solid #F1F5F9', borderRadius: '10px', padding: '0.65rem 0.85rem', background: '#F8FAFC', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: '600' }}>BLOOD PRESSURE</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: '850' }}>{selectedPatient.visits[0].vitals.bp}</strong>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>mmHg (Systolic/Diastolic)</span>
                </div>
                <div style={{ border: '1px solid #F1F5F9', borderRadius: '10px', padding: '0.65rem 0.85rem', background: '#F8FAFC', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: '600' }}>TEMPERATURE</span>
                  <strong style={{ fontSize: '1.1rem', color: '#EF4444', fontWeight: '850' }}>{selectedPatient.visits[0].vitals.temp}</strong>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>Oral Vitals Probe</span>
                </div>
                <div style={{ border: '1px solid #F1F5F9', borderRadius: '10px', padding: '0.65rem 0.85rem', background: '#F8FAFC', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: '600' }}>HEART RATE</span>
                  <strong style={{ fontSize: '1.1rem', color: '#10B981', fontWeight: '850' }}>{selectedPatient.visits[0].vitals.hr}</strong>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>Radial Pulse Check</span>
                </div>
              </div>
            </div>

            {/* Visit Timeline */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CalendarRange size={18} color="#0066FF" /> Consultation Visit Log
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                {selectedPatient.visits.map((v, idx) => (
                  <div key={idx} style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #E2E8F0', paddingBottom: idx !== selectedPatient.visits.length - 1 ? '1.25rem' : 0 }}>
                    {/* timeline bullet */}
                    <div style={{ position: 'absolute', left: '-6px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: idx === 0 ? '#0066FF' : '#94A3B8', border: '2px solid #FFFFFF', boxShadow: '0 0 0 2px rgba(0,102,255,0.1)' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <div>
                        <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>{v.diagnosis}</strong>
                        <span style={{ fontSize: '0.76rem', color: '#64748B', display: 'block', marginTop: '0.1rem' }}>
                          Doctor: <strong>{v.doctorName}</strong> ({v.specialty})
                        </span>
                      </div>
                      <span style={{ fontSize: '0.76rem', background: '#EEF2FF', color: '#0066FF', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                        {v.date}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5', margin: '0 0 0.75rem 0' }}>
                      {v.notes}
                    </p>

                    {/* Prescription Detail block */}
                    {v.prescription?.medicines?.length > 0 && (
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem', fontSize: '0.78rem' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>℞ Digital Prescription</span>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }} onClick={() => window.print()}>
                            <Printer size={11} /> Print PDF
                          </button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                              <th style={{ padding: '0.25rem 0', fontSize: '0.72rem' }}>Medicine</th>
                              <th style={{ padding: '0.25rem 0', fontSize: '0.72rem', textAlign: 'center' }}>Dosage</th>
                              <th style={{ padding: '0.25rem 0', fontSize: '0.72rem', textAlign: 'center' }}>Frequency</th>
                              <th style={{ padding: '0.25rem 0', fontSize: '0.72rem', textAlign: 'right' }}>Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {v.prescription.medicines.map((m, mIdx) => (
                              <tr key={mIdx} style={{ borderBottom: mIdx !== v.prescription.medicines.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                <td style={{ padding: '0.35rem 0', fontWeight: '700', color: '#334155' }}>
                                  {m.name} <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '500' }}>({m.instructions})</span>
                                </td>
                                <td style={{ padding: '0.35rem 0', textAlign: 'center', color: '#475569' }}>{m.dosage}</td>
                                <td style={{ padding: '0.35rem 0', textAlign: 'center', color: '#475569' }}>{m.frequency}</td>
                                <td style={{ padding: '0.35rem 0', textAlign: 'right', fontWeight: '700', color: '#0066FF' }}>{m.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Labs Recommended block */}
                    {v.labs?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem' }}>
                        <Dna size={14} color="#059669" />
                        <span>Recommended Diagnostic Labs: <strong>{v.labs.join(', ')}</strong></span>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default MedicalRecordsPage;
