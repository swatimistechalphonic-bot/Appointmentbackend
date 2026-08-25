import React, { useState, useEffect } from 'react';
import {
  Bed,
  Search,
  Plus,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRightLeft,
  LogOut,
  Shield,
  Activity
} from 'lucide-react';

const initialBeds = [
  { id: 'BED-101', ward: 'ICU Unit A', bedNumber: 'ICU-01', patient: 'Vikram Sharma', age: 52, gender: 'Male', doctor: 'Dr. Rahul Sharma', admitDate: '2026-08-22', status: 'Occupied', diagnosis: 'Severe Respiratory Distress' },
  { id: 'BED-102', ward: 'ICU Unit A', bedNumber: 'ICU-02', patient: null, status: 'Available' },
  { id: 'BED-103', ward: 'General Male Ward', bedNumber: 'GMW-05', patient: 'Rajesh Kumar', age: 44, gender: 'Male', doctor: 'Dr. Ananya Roy', admitDate: '2026-08-23', status: 'Occupied', diagnosis: 'Post-Op Appendectomy' },
  { id: 'BED-104', ward: 'General Male Ward', bedNumber: 'GMW-06', patient: null, status: 'Cleaning' },
  { id: 'BED-105', ward: 'Private Deluxe Suite', bedNumber: 'PVT-301', patient: 'Priya Malhotra', age: 34, gender: 'Female', doctor: 'Dr. Rahul Sharma', admitDate: '2026-08-24', status: 'Occupied', diagnosis: 'Maternal Observation' },
  { id: 'BED-106', ward: 'Private Deluxe Suite', bedNumber: 'PVT-302', patient: null, status: 'Available' },
  { id: 'BED-107', ward: 'Emergency Ward', bedNumber: 'EMG-01', patient: 'Sunil Verma', age: 60, gender: 'Male', doctor: 'Dr. Amit Patel', admitDate: '2026-08-25', status: 'Occupied', diagnosis: 'Acute Cardiac Observation' },
  { id: 'BED-108', ward: 'General Female Ward', bedNumber: 'GFW-03', patient: null, status: 'Available' }
];

const BedManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wardFilter, setWardFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [beds, setBeds] = useState(() => {
    const saved = localStorage.getItem('caresync_beds_list');
    return saved ? JSON.parse(saved) : initialBeds;
  });

  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [transferBed, setTransferBed] = useState(null);

  const [admitData, setAdmitData] = useState({
    bedId: '',
    patientName: '',
    age: '',
    gender: 'Male',
    doctor: 'Dr. Rahul Sharma',
    diagnosis: ''
  });

  const [targetWard, setTargetWard] = useState('General Male Ward');

  useEffect(() => {
    localStorage.setItem('caresync_beds_list', JSON.stringify(beds));
  }, [beds]);

  const wards = ['All', 'ICU Unit A', 'General Male Ward', 'General Female Ward', 'Private Deluxe Suite', 'Emergency Ward'];

  const filteredBeds = beds.filter((b) => {
    const matchesSearch =
      b.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.patient && b.patient.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesWard = wardFilter === 'All' || b.ward === wardFilter;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesWard && matchesStatus;
  });

  // Metrics
  const totalBeds = beds.length;
  const occupiedCount = beds.filter((b) => b.status === 'Occupied').length;
  const availableCount = beds.filter((b) => b.status === 'Available').length;
  const occupancyRate = ((occupiedCount / totalBeds) * 100).toFixed(0);

  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    if (!admitData.bedId || !admitData.patientName) return;

    setBeds((prev) =>
      prev.map((b) =>
        b.id === admitData.bedId
          ? {
              ...b,
              patient: admitData.patientName,
              age: Number(admitData.age) || 30,
              gender: admitData.gender,
              doctor: admitData.doctor,
              admitDate: new Date().toISOString().split('T')[0],
              status: 'Occupied',
              diagnosis: admitData.diagnosis || 'Inpatient Observation'
            }
          : b
      )
    );

    setIsAdmitModalOpen(false);
    setAdmitData({
      bedId: '',
      patientName: '',
      age: '',
      gender: 'Male',
      doctor: 'Dr. Rahul Sharma',
      diagnosis: ''
    });
  };

  const handleDischarge = (bedId, patientName) => {
    if (window.confirm(`Are you sure you want to discharge patient "${patientName}" from this bed?`)) {
      setBeds((prev) =>
        prev.map((b) => (b.id === bedId ? { ...b, patient: null, status: 'Cleaning' } : b))
      );
    }
  };

  const handleSetAvailable = (bedId) => {
    setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, status: 'Available' } : b)));
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferBed) return;

    setBeds((prev) =>
      prev.map((b) => (b.id === transferBed.id ? { ...b, ward: targetWard } : b))
    );
    setTransferBed(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Bed & Ward Occupancy Management (IPD)
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>
            Track inpatient admissions, real-time bed availability, ward transfers, and patient discharge workflow
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '220px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Bed, Ward or Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <select
            className="filter-select"
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            {wards.map((w) => (
              <option key={w} value={w}>{w === 'All' ? 'All Wards' : w}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Occupied">Occupied</option>
            <option value="Available">Available</option>
            <option value="Cleaning">Cleaning</option>
          </select>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsAdmitModalOpen(true)}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Admit Patient to Bed
          </button>
        </div>
      </div>

      {/* 2. Top Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bed size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL HOSPITAL BEDS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalBeds}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EF4444', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#7F1D1D', fontWeight: '700' }}>OCCUPIED BEDS (IPD)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#7F1D1D', marginTop: '0.1rem' }}>{occupiedCount} ({occupancyRate}%)</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>VACANT & READY BEDS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{availableCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Bed Management Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Bed No. & Ward</th>
                <th>Patient Details</th>
                <th>Diagnosis & Doctor</th>
                <th>Admit Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeds.length > 0 ? (
                filteredBeds.map((bed) => (
                  <tr key={bed.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: bed.status === 'Occupied' ? '#FEE2E2' : bed.status === 'Available' ? '#D1FAE5' : '#FEF3C7',
                            color: bed.status === 'Occupied' ? '#DC2626' : bed.status === 'Available' ? '#059669' : '#D97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Bed size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem' }}>{bed.bedNumber}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748B' }}>{bed.ward}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      {bed.patient ? (
                        <div>
                          <div style={{ fontWeight: '700', color: '#334155', fontSize: '0.88rem' }}>{bed.patient}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{bed.age} Yrs • {bed.gender}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: '#94A3B8', italic: 'true' }}>No Patient Admitted</span>
                      )}
                    </td>

                    <td>
                      {bed.patient ? (
                        <div>
                          <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.84rem' }}>{bed.diagnosis}</div>
                          <div style={{ fontSize: '0.75rem', color: '#0066FF' }}>{bed.doctor}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#CBD5E1' }}>—</span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748B' }}>{bed.admitDate || '—'}</span>
                    </td>

                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: bed.status === 'Occupied' ? '#FEE2E2' : bed.status === 'Available' ? '#DCFCE7' : '#FEF3C7',
                          color: bed.status === 'Occupied' ? '#991B1B' : bed.status === 'Available' ? '#166534' : '#92400E'
                        }}
                      >
                        {bed.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {bed.status === 'Occupied' && (
                          <>
                            <button
                              className="action-btn"
                              title="Ward Transfer"
                              onClick={() => {
                                setTransferBed(bed);
                                setTargetWard(bed.ward);
                              }}
                              style={{ color: '#8B5CF6', background: '#F5F3FF', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <ArrowRightLeft size={14} /> Transfer
                            </button>

                            <button
                              className="action-btn"
                              title="Discharge Patient"
                              onClick={() => handleDischarge(bed.id, bed.patient)}
                              style={{ color: '#EF4444', background: '#FEE2E2', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <LogOut size={14} /> Discharge
                            </button>
                          </>
                        )}

                        {bed.status === 'Cleaning' && (
                          <button
                            className="action-btn"
                            title="Mark Bed Ready"
                            onClick={() => handleSetAvailable(bed.id)}
                            style={{ color: '#10B981', background: '#ECFDF5', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600' }}
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    No beds found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal: Admit Patient to Available Bed */}
      {isAdmitModalOpen && (
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
              maxWidth: '520px',
              padding: '1.75rem',
              borderRadius: '20px',
              background: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bed size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>Inpatient Bed Admission</h2>
              </div>
              <button onClick={() => setIsAdmitModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdmitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Select Vacant Bed *
                </label>
                <select
                  required
                  value={admitData.bedId}
                  onChange={(e) => setAdmitData({ ...admitData, bedId: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                >
                  <option value="">-- Choose Available Bed --</option>
                  {beds.filter((b) => b.status === 'Available').map((b) => (
                    <option key={b.id} value={b.id}>{b.bedNumber} ({b.ward})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={admitData.patientName}
                  onChange={(e) => setAdmitData({ ...admitData, patientName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="45"
                    value={admitData.age}
                    onChange={(e) => setAdmitData({ ...admitData, age: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Gender
                  </label>
                  <select
                    value={admitData.gender}
                    onChange={(e) => setAdmitData({ ...admitData, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Attending Doctor
                </label>
                <select
                  value={admitData.doctor}
                  onChange={(e) => setAdmitData({ ...admitData, doctor: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                >
                  <option value="Dr. Rahul Sharma">Dr. Rahul Sharma (Cardiologist)</option>
                  <option value="Dr. Ananya Roy">Dr. Ananya Roy (General Medicine)</option>
                  <option value="Dr. Amit Patel">Dr. Amit Patel (Emergency Specialist)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Primary Admission Diagnosis
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Acute Dengue Fever with low platelet count..."
                  value={admitData.diagnosis}
                  onChange={(e) => setAdmitData({ ...admitData, diagnosis: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '700' }}
                >
                  Admit Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Ward Transfer */}
      {transferBed && (
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
              maxWidth: '450px',
              padding: '1.75rem',
              borderRadius: '20px',
              background: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Ward Transfer: {transferBed.patient}</h2>
              <button onClick={() => setTransferBed(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Current Bed & Ward:</span>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0F172A', marginTop: '0.2rem' }}>{transferBed.bedNumber} ({transferBed.ward})</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Target Destination Ward
                </label>
                <select
                  value={targetWard}
                  onChange={(e) => setTargetWard(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                >
                  {wards.filter((w) => w !== 'All').map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTransferBed(null)}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '700' }}
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BedManagementPage;
