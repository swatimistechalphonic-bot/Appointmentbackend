import React, { useState, useEffect } from 'react';
import { departmentApi } from '../services/api';
import {
  Building2,
  Search,
  Plus,
  Heart,
  Bone,
  User,
  Activity,
  Brain,
  Stethoscope,
  Users,
  Edit,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Check
} from 'lucide-react';

const ICON_MAP = {
  Heart: Heart,
  Bone: Bone,
  User: User,
  Activity: Activity,
  Brain: Brain,
  Stethoscope: Stethoscope,
  Building2: Building2
};

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState(null);

  // Add Form State
  const [addFormData, setAddFormData] = useState({
    name: '',
    description: '',
    icon: 'Heart',
    headOfDepartment: '',
    totalDoctors: 1,
    status: 'Active'
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    icon: 'Heart',
    headOfDepartment: '',
    totalDoctors: 1,
    status: 'Active'
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, [searchTerm]);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await departmentApi.getAllDepartments({ search: searchTerm });
      if (res.data?.success && Array.isArray(res.data.departments)) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error('Fetch Departments Error:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!addFormData.name) {
      setAddError('Department name is required');
      return;
    }

    setAddSubmitting(true);
    try {
      const res = await departmentApi.createDepartment({
        ...addFormData,
        totalDoctors: Number(addFormData.totalDoctors)
      });
      if (res.data?.success) {
        setIsAddModalOpen(false);
        setAddFormData({
          name: '',
          description: '',
          icon: 'Heart',
          headOfDepartment: '',
          totalDoctors: 1,
          status: 'Active'
        });
        fetchDepartments();
      }
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create department');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleOpenEditModal = (dept) => {
    setEditDepartment(dept);
    setEditFormData({
      name: dept.name || '',
      description: dept.description || '',
      icon: dept.icon || 'Heart',
      headOfDepartment: dept.headOfDepartment || '',
      totalDoctors: dept.totalDoctors || 1,
      status: dept.status || 'Active'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editFormData.name) {
      setEditError('Department name is required');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await departmentApi.updateDepartment(editDepartment._id, {
        ...editFormData,
        totalDoctors: Number(editFormData.totalDoctors)
      });
      if (res.data?.success) {
        setEditDepartment(null);
        fetchDepartments();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update department');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete department "${dept.name}"?`)) return;

    try {
      const res = await departmentApi.deleteDepartment(dept._id);
      if (res.data?.success) {
        setDepartments(prev => prev.filter(d => d._id !== dept._id));
      }
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
            Hospital Departments
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Manage clinical specialties, department heads, and medical units</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="header-search" style={{ width: '260px' }}>
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Department Cards */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          Loading hospital departments...
        </div>
      ) : departments.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          No departments found matching your query.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {departments.map((dept) => {
            const IconComponent = ICON_MAP[dept.icon] || Building2;
            return (
              <div key={dept._id} className="card" style={{ padding: '1.4rem', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EEF2FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>{dept.name}</h3>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                          Head: <span style={{ color: '#0066FF' }}>{dept.headOfDepartment || 'Dr. Specialist'}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`doc-badge ${dept.status === 'Active' ? 'confirmed' : 'cancelled'}`}>
                      {dept.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.15rem' }}>
                    {dept.description || 'Specialized clinical unit providing outpatient and inpatient care.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748B', fontWeight: '700' }}>
                    <Users size={16} color="#0066FF" />
                    <span>{dept.totalDoctors || 1} Specialist Doctors</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem 0.65rem', color: '#D97706', borderColor: '#FDE68A', background: '#FFFBEB' }}
                      title="Edit Department"
                      onClick={() => handleOpenEditModal(dept)}
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem 0.65rem', color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                      title="Delete Department"
                      onClick={() => handleDeleteDepartment(dept)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Department Popup Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Building2 size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add New Department</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {addError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Pediatrics, Dermatology, Oncology..."
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Head of Department</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Dr. Amit Sharma"
                    value={addFormData.headOfDepartment}
                    onChange={(e) => setAddFormData({ ...addFormData, headOfDepartment: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Total Doctors</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={addFormData.totalDoctors}
                    onChange={(e) => setAddFormData({ ...addFormData, totalDoctors: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Icon Style</label>
                  <select
                    className="input-field"
                    value={addFormData.icon}
                    onChange={(e) => setAddFormData({ ...addFormData, icon: e.target.value })}
                  >
                    <option value="Heart">Heart (Cardiology)</option>
                    <option value="Bone">Bone (Orthopedic)</option>
                    <option value="User">User (Gynecology)</option>
                    <option value="Activity">Activity (Neurology)</option>
                    <option value="Brain">Brain (Psychiatry)</option>
                    <option value="Stethoscope">Stethoscope (General)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="input-field"
                    value={addFormData.status}
                    onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Provide department description and clinical scope..."
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addSubmitting}>
                  {addSubmitting ? 'Saving...' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Popup Modal */}
      {editDepartment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Building2 size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Edit Department</h2>
              </div>
              <button onClick={() => setEditDepartment(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Head of Department</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFormData.headOfDepartment}
                    onChange={(e) => setEditFormData({ ...editFormData, headOfDepartment: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Total Doctors</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={editFormData.totalDoctors}
                    onChange={(e) => setEditFormData({ ...editFormData, totalDoctors: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Icon Style</label>
                  <select
                    className="input-field"
                    value={editFormData.icon}
                    onChange={(e) => setEditFormData({ ...editFormData, icon: e.target.value })}
                  >
                    <option value="Heart">Heart (Cardiology)</option>
                    <option value="Bone">Bone (Orthopedic)</option>
                    <option value="User">User (Gynecology)</option>
                    <option value="Activity">Activity (Neurology)</option>
                    <option value="Brain">Brain (Psychiatry)</option>
                    <option value="Stethoscope">Stethoscope (General)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="input-field"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditDepartment(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Updating...' : 'Update Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
