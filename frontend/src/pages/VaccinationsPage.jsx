import React, { useState, useEffect, useCallback } from 'react';
import { vaccinationApi } from '../services/api';
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

const VaccinationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vaccinations, setVaccinations] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, scheduled: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVac, setNewVac] = useState({
    patientName: '',
    age: '6 Months',
    vaccineName: 'MMR (Measles, Mumps, Rubella)',
    doseNumber: 'Dose 1',
    dueDate: '',
    administeredDate: '',
    administeredBy: 'Nurse Mary Joseph',
    status: 'Scheduled'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, listRes] = await Promise.all([
        vaccinationApi.getStats(),
        vaccinationApi.getAllVaccinations({
          search: searchTerm || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined
        })
      ]);
      setStats(statsRes.data.data || { total: 0, completed: 0, scheduled: 0, overdue: 0 });
      setVaccinations(listRes.data.data || []);
    } catch {
      setError('Failed to fetch vaccination records. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newVac.patientName.trim() || !newVac.vaccineName.trim() || !newVac.dueDate) return;
    setSubmitting(true);
    try {
      await vaccinationApi.createVaccination(newVac);
      setIsModalOpen(false);
      setNewVac({
        patientName: '',
        age: '6 Months',
        vaccineName: 'MMR (Measles, Mumps, Rubella)',
        doseNumber: 'Dose 1',
        dueDate: '',
        administeredDate: '',
        administeredBy: 'Nurse Mary Joseph',
        status: 'Scheduled'
      });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record vaccination');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Scheduled' ? 'Completed' : 'Scheduled';
    const administeredDate = nextStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null;
    const administeredBy = nextStatus === 'Completed' ? 'Nurse Mary Joseph' : 'Pending Appointment';
    try {
      await vaccinationApi.updateVaccination(id, { status: nextStatus, administeredDate, administeredBy });
      fetchAll();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vaccination record?')) return;
    try {
      await vaccinationApi.deleteVaccination(id);
      fetchAll();
    } catch {
      alert('Failed to delete record');
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Syringe size={26} color="#0066FF" /> Immunization &amp; Vaccinations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Schedule and track immunization schedules, administered doses, and pediatric health charts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0 12px' }}>
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search Patient, Vaccine or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem 0', fontSize: '0.82rem', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-primary)' }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Record Vaccination
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Syringe size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL SCHEDULED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{stats.total || 0}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>ADMINISTERED COMPLETED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{stats.completed || 0}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>UPCOMING DUEDATES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{stats.scheduled || 0}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EF4444', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#7F1D1D', fontWeight: '700' }}>OVERDUE WARNINGS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#7F1D1D', marginTop: '0.1rem' }}>{stats.overdue || 0}</div>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="card" style={{ padding: '0.9rem 1.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Filter Status:</span>
        {['All', 'Scheduled', 'Completed', 'Overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              borderRadius: '999px',
              backgroundColor: statusFilter === status ? '#0066FF' : '#FFFFFF',
              color: statusFilter === status ? '#FFFFFF' : 'var(--text-main)',
              borderColor: statusFilter === status ? '#0066FF' : '#E2E8F0',
            }}
          >
            {status}
          </button>
        ))}
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
            <div className="loading-spinner" /> Loading vaccination records...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Record ID &amp; Patient</th>
                  <th>Age Milestone</th>
                  <th>Vaccine Details</th>
                  <th>Due Date</th>
                  <th>Administered Date / By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVaccinations.length > 0 ? (
                  filteredVaccinations.map((v) => (
                    <tr key={v._id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{v.patientName}</div>
                          <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{v.id}</div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: '600' }}>{v.age}</span>
                      </td>

                      <td>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0066FF', fontSize: '0.85rem' }}>{v.vaccineName}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.1rem' }}>{v.doseNumber}</div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '600' }}>{v.dueDate}</span>
                      </td>

                      <td>
                        {v.administeredDate ? (
                          <div>
                            <div style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: '700' }}>{v.administeredDate}</div>
                            <div style={{ fontSize: '0.76rem', color: '#64748B' }}>{v.administeredBy}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>{v.administeredBy}</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`doc-badge ${
                            v.status === 'Completed' ? 'confirmed' : v.status === 'Scheduled' ? 'pending' : 'cancelled'
                          }`}
                          style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => handleToggleStatus(v._id, v.status)}
                          title="Click to toggle status"
                        >
                          {v.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.7rem' }}
                            onClick={() => handleToggleStatus(v._id, v.status)}
                          >
                            Toggle Status
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center' }}
                            onClick={() => handleDelete(v._id)}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                      No vaccination records found matching search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Vaccination Record */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Syringe size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Record Patient Vaccination</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Baby Aarav Gupta"
                  value={newVac.patientName}
                  onChange={(e) => setNewVac({ ...newVac, patientName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Age Milestone / Current Age *</label>
                <select
                  className="input-field"
                  value={newVac.age}
                  onChange={(e) => setNewVac({ ...newVac, age: e.target.value })}
                >
                  <option value="6 Weeks">6 Weeks</option>
                  <option value="6 Months">6 Months</option>
                  <option value="9 Months">9 Months</option>
                  <option value="12 Months">12 Months</option>
                  <option value="5 Years">5 Years</option>
                  <option value="Adult Dose">Adult Dose</option>
                </select>
              </div>

              <div className="form-group">
                <label>Vaccine Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. MMR (Measles, Mumps, Rubella)"
                  value={newVac.vaccineName}
                  onChange={(e) => setNewVac({ ...newVac, vaccineName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Dose Number / Description</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Dose 1 of 2 or Booster Dose"
                  value={newVac.doseNumber}
                  onChange={(e) => setNewVac({ ...newVac, doseNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Vaccine Scheduled Due Date *</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={newVac.dueDate}
                  onChange={(e) => setNewVac({ ...newVac, dueDate: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Recording...' : 'Record Vaccination'}
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
