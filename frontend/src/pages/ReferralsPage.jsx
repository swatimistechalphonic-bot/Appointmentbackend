import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Plus,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Send,
  User
} from 'lucide-react';

const initialReferrals = [
  {
    id: 'REF-5001',
    patientName: 'Ramesh Chandra',
    age: 58,
    referringDoctor: 'Dr. Ananya Roy (General Medicine)',
    targetSpecialist: 'Dr. Rahul Sharma',
    targetDepartment: 'Cardiology',
    urgency: 'Urgent',
    notes: 'Patient exhibits persistent sinus tachycardia and chest tightness. Advised 2D Echo and specialist review.',
    date: '2026-08-25',
    status: 'Pending Review'
  },
  {
    id: 'REF-5002',
    patientName: 'Sunita Devi',
    age: 42,
    referringDoctor: 'Dr. Amit Patel (Emergency)',
    targetSpecialist: 'Dr. Vikram Seth',
    targetDepartment: 'Neurology',
    urgency: 'Emergency',
    notes: 'Sudden onset focal neurological deficit with severe migraine. Brain MRI requested.',
    date: '2026-08-24',
    status: 'In Progress'
  },
  {
    id: 'REF-5003',
    patientName: 'Karan Mehra',
    age: 29,
    referringDoctor: 'Dr. Ananya Roy (General Medicine)',
    targetSpecialist: 'Dr. Priya Verma',
    targetDepartment: 'Orthopedics',
    urgency: 'Routine',
    notes: 'Post-traumatic right knee ligament pain following sports injury.',
    date: '2026-08-22',
    status: 'Completed'
  }
];

const ReferralsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem('caresync_referrals_list');
    return saved ? JSON.parse(saved) : initialReferrals;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRef, setNewRef] = useState({
    patientName: '',
    age: '',
    referringDoctor: 'Dr. Ananya Roy (General Medicine)',
    targetSpecialist: 'Dr. Rahul Sharma',
    targetDepartment: 'Cardiology',
    urgency: 'Routine',
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('caresync_referrals_list', JSON.stringify(referrals));
  }, [referrals]);

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referringDoctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetSpecialist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'All' || r.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  // Metrics
  const totalCount = referrals.length;
  const pendingCount = referrals.filter((r) => r.status === 'Pending Review' || r.status === 'In Progress').length;
  const urgentCount = referrals.filter((r) => r.urgency === 'Urgent' || r.urgency === 'Emergency').length;
  const completedCount = referrals.filter((r) => r.status === 'Completed').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRef.patientName.trim()) return;

    const created = {
      id: 'REF-' + Math.floor(5000 + Math.random() * 9000),
      patientName: newRef.patientName,
      age: Number(newRef.age) || 35,
      referringDoctor: newRef.referringDoctor,
      targetSpecialist: newRef.targetSpecialist,
      targetDepartment: newRef.targetDepartment,
      urgency: newRef.urgency,
      notes: newRef.notes || 'Referred for specialist opinion and treatment continuity.',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Review'
    };

    setReferrals([created, ...referrals]);
    setIsModalOpen(false);
    setNewRef({
      patientName: '',
      age: '',
      referringDoctor: 'Dr. Ananya Roy (General Medicine)',
      targetSpecialist: 'Dr. Rahul Sharma',
      targetDepartment: 'Cardiology',
      urgency: 'Routine',
      notes: ''
    });
  };

  const handleUpdateStatus = (id, newStatus) => {
    setReferrals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Specialist Referral Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>
            Doctor-to-Doctor inter-departmental patient referrals, clinical notes, and treatment continuity tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '220px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Patient, Doctor or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <select
            className="filter-select"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            <option value="All">All Urgency</option>
            <option value="Routine">Routine</option>
            <option value="Urgent">Urgent</option>
            <option value="Emergency">Emergency</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> New Specialist Referral
          </button>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL REFERRALS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>PENDING SPECIALIST REVIEW</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{pendingCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EF4444', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#7F1D1D', fontWeight: '700' }}>URGENT & EMERGENCY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#7F1D1D', marginTop: '0.1rem' }}>{urgentCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>COMPLETED TRANSFERS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{completedCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Referrals Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Referring Physician</th>
                <th>Target Specialist</th>
                <th>Urgency</th>
                <th>Referral Notes</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((ref) => (
                  <tr key={ref.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.9rem' }}>{ref.patientName}</div>
                        <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{ref.id} • {ref.age} Yrs</div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '600' }}>
                        {ref.referringDoctor}
                      </span>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0066FF', fontSize: '0.85rem' }}>{ref.targetSpecialist}</div>
                        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>{ref.targetDepartment}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: ref.urgency === 'Emergency' ? '#FEE2E2' : ref.urgency === 'Urgent' ? '#FEF3C7' : '#E0F2FE',
                          color: ref.urgency === 'Emergency' ? '#991B1B' : ref.urgency === 'Urgent' ? '#92400E' : '#075985'
                        }}
                      >
                        {ref.urgency}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#475569', maxWidth: '280px', lineHeight: '1.4' }}>
                        {ref.notes}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          ref.status === 'Completed' ? 'badge-success' : ref.status === 'In Progress' ? 'badge-warning' : 'badge-info'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {ref.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {ref.status !== 'Completed' && (
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleUpdateStatus(ref.id, 'In Progress')}
                            style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', border: 'none', background: '#EFF6FF', color: '#0066FF', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ref.id, 'Completed')}
                            style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', border: 'none', background: '#ECFDF5', color: '#10B981', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    No specialist referrals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal: Issue New Referral */}
      {isModalOpen && (
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
              background: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>New Specialist Referral</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anish Kapoor"
                    value={newRef.patientName}
                    onChange={(e) => setNewRef({ ...newRef, patientName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="38"
                    value={newRef.age}
                    onChange={(e) => setNewRef({ ...newRef, age: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Target Specialist Doctor *
                </label>
                <select
                  value={newRef.targetSpecialist}
                  onChange={(e) => setNewRef({ ...newRef, targetSpecialist: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                >
                  <option value="Dr. Rahul Sharma">Dr. Rahul Sharma (Cardiology)</option>
                  <option value="Dr. Vikram Seth">Dr. Vikram Seth (Neurology)</option>
                  <option value="Dr. Priya Verma">Dr. Priya Verma (Orthopedics)</option>
                  <option value="Dr. Neha Gupta">Dr. Neha Gupta (Pediatrics)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Specialist Department
                  </label>
                  <input
                    type="text"
                    value={newRef.targetDepartment}
                    onChange={(e) => setNewRef({ ...newRef, targetDepartment: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Urgency Priority
                  </label>
                  <select
                    value={newRef.urgency}
                    onChange={(e) => setNewRef({ ...newRef, urgency: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Clinical Referral Notes & Reason
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide clinical context for the specialist..."
                  value={newRef.notes}
                  onChange={(e) => setNewRef({ ...newRef, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', fontWeight: '700' }}
                >
                  Submit Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReferralsPage;
