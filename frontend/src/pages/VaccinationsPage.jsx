import React, { useState, useEffect } from 'react';
import {
  Syringe,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  User,
  ShieldCheck
} from 'lucide-react';

const initialVaccinations = [
  {
    id: 'VAC-9001',
    patientName: 'Aarav Gupta',
    age: '6 Months',
    vaccineName: 'OPV & DTP Booster 1',
    doseNumber: 'Dose 2 of 3',
    dueDate: '2026-08-20',
    administeredDate: '2026-08-20',
    administeredBy: 'Nurse Mary Joseph',
    status: 'Completed'
  },
  {
    id: 'VAC-9002',
    patientName: 'Ananya Sharma',
    age: '12 Months',
    vaccineName: 'MMR (Measles, Mumps, Rubella)',
    doseNumber: 'Dose 1 of 2',
    dueDate: '2026-08-28',
    administeredDate: null,
    administeredBy: 'Pending Appointment',
    status: 'Scheduled'
  },
  {
    id: 'VAC-9003',
    patientName: 'Rohan Mehta',
    age: '5 Years',
    vaccineName: 'Typhoid Conjugate Vaccine',
    doseNumber: 'Booster Dose',
    dueDate: '2026-08-15',
    administeredDate: null,
    administeredBy: 'Overdue Notice Sent',
    status: 'Overdue'
  },
  {
    id: 'VAC-9004',
    patientName: 'Priya Verma',
    age: '28 Years',
    vaccineName: 'Hepatitis B Recombinant',
    doseNumber: 'Dose 3 of 3',
    dueDate: '2026-08-24',
    administeredDate: '2026-08-24',
    administeredBy: 'Nurse Mary Joseph',
    status: 'Completed'
  }
];

const VaccinationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vaccinations, setVaccinations] = useState(() => {
    const saved = localStorage.getItem('caresync_vaccinations_list');
    return saved ? JSON.parse(saved) : initialVaccinations;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVac, setNewVac] = useState({
    patientName: '',
    age: '',
    vaccineName: 'MMR (Measles, Mumps, Rubella)',
    doseNumber: 'Dose 1',
    dueDate: '',
    administeredBy: 'Nurse Mary Joseph'
  });

  useEffect(() => {
    localStorage.setItem('caresync_vaccinations_list', JSON.stringify(vaccinations));
  }, [vaccinations]);

  const filteredVaccinations = vaccinations.filter((v) => {
    const matchesSearch =
      v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalCount = vaccinations.length;
  const completedCount = vaccinations.filter((v) => v.status === 'Completed').length;
  const scheduledCount = vaccinations.filter((v) => v.status === 'Scheduled').length;
  const overdueCount = vaccinations.filter((v) => v.status === 'Overdue').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newVac.patientName.trim()) return;

    const created = {
      id: 'VAC-' + Math.floor(9000 + Math.random() * 900),
      patientName: newVac.patientName,
      age: newVac.age || 'General',
      vaccineName: newVac.vaccineName,
      doseNumber: newVac.doseNumber,
      dueDate: newVac.dueDate || new Date().toISOString().split('T')[0],
      administeredDate: new Date().toISOString().split('T')[0],
      administeredBy: newVac.administeredBy,
      status: 'Completed'
    };

    setVaccinations([created, ...vaccinations]);
    setIsModalOpen(false);
    setNewVac({
      patientName: '',
      age: '',
      vaccineName: 'MMR (Measles, Mumps, Rubella)',
      doseNumber: 'Dose 1',
      dueDate: '',
      administeredBy: 'Nurse Mary Joseph'
    });
  };

  const handleMarkAdministered = (id) => {
    setVaccinations((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status: 'Completed', administeredDate: new Date().toISOString().split('T')[0], administeredBy: 'Nurse Mary Joseph' }
          : v
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Vaccination & Immunization Tracker
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>
            Pediatric and adult immunization schedule management, dose administration logging, and due date alerts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '220px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Vaccine or Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Overdue">Overdue</option>
          </select>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Record Vaccine Dose
          </button>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Syringe size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL VACCINATION DOSES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>ADMINISTERED & PROTECTED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{completedCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>UPCOMING DUE DOSES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{scheduledCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EF4444', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#7F1D1D', fontWeight: '700' }}>OVERDUE ALERTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#7F1D1D', marginTop: '0.1rem' }}>{overdueCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Vaccine & Dose</th>
                <th>Due Date</th>
                <th>Administered Date</th>
                <th>Administered By</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccinations.length > 0 ? (
                filteredVaccinations.map((vac) => (
                  <tr key={vac.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.9rem' }}>{vac.patientName}</div>
                        <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{vac.id} • {vac.age}</div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0066FF', fontSize: '0.85rem' }}>{vac.vaccineName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{vac.doseNumber}</div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '600' }}>{vac.dueDate}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.84rem', color: '#64748B' }}>{vac.administeredDate || '—'}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>{vac.administeredBy}</span>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          vac.status === 'Completed' ? 'badge-success' : vac.status === 'Scheduled' ? 'badge-warning' : 'badge-danger'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {vac.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {vac.status !== 'Completed' && (
                        <button
                          onClick={() => handleMarkAdministered(vac.id)}
                          style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', border: 'none', background: '#ECFDF5', color: '#10B981', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Mark Given
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    No vaccination records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal: Record Vaccine */}
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
              maxWidth: '500px',
              padding: '1.75rem',
              borderRadius: '20px',
              background: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Syringe size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>Record Vaccine Administration</h2>
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
                    placeholder="e.g. Master Aarav"
                    value={newVac.patientName}
                    onChange={(e) => setNewVac({ ...newVac, patientName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Age / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Months"
                    value={newVac.age}
                    onChange={(e) => setNewVac({ ...newVac, age: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Vaccine Name *
                </label>
                <select
                  value={newVac.vaccineName}
                  onChange={(e) => setNewVac({ ...newVac, vaccineName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                >
                  <option value="BCG & Hepatitis B (Birth Dose)">BCG & Hepatitis B (Birth Dose)</option>
                  <option value="OPV & DTP Booster">OPV & DTP Booster</option>
                  <option value="MMR (Measles, Mumps, Rubella)">MMR (Measles, Mumps, Rubella)</option>
                  <option value="Typhoid Conjugate Vaccine">Typhoid Conjugate Vaccine</option>
                  <option value="COVID-19 Booster Dose">COVID-19 Booster Dose</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Dose Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dose 1 of 2"
                    value={newVac.doseNumber}
                    onChange={(e) => setNewVac({ ...newVac, doseNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Administered By
                  </label>
                  <input
                    type="text"
                    value={newVac.administeredBy}
                    onChange={(e) => setNewVac({ ...newVac, administeredBy: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VaccinationsPage;
