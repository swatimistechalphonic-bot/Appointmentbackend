import React, { useState } from 'react';
import {
  Stethoscope,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  DollarSign
} from 'lucide-react';

const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);

  // Initial Services List
  const [services, setServices] = useState([
    {
      id: 'SRV-001',
      name: 'General Consultation',
      duration: '30 Mins',
      fee: 500,
      department: 'General Medicine',
      status: 'Active'
    },
    {
      id: 'SRV-002',
      name: 'Follow-up Consultation',
      duration: '15 Mins',
      fee: 300,
      department: 'General Medicine',
      status: 'Active'
    },
    {
      id: 'SRV-003',
      name: 'ECG / Electrocardiogram',
      duration: '20 Mins',
      fee: 800,
      department: 'Cardiology',
      status: 'Active'
    },
    {
      id: 'SRV-004',
      name: 'Orthopedic Joint Checkup',
      duration: '30 Mins',
      fee: 600,
      department: 'Orthopedics',
      status: 'Active'
    },
    {
      id: 'SRV-005',
      name: 'Gynecological Consultation',
      duration: '30 Mins',
      fee: 700,
      department: 'Gynecology',
      status: 'Active'
    },
    {
      id: 'SRV-006',
      name: 'Neurological Consultation',
      duration: '45 Mins',
      fee: 1200,
      department: 'Neurology',
      status: 'Active'
    }
  ]);

  // Form states
  const [addFormData, setAddFormData] = useState({
    name: '',
    duration: '30 Mins',
    fee: '',
    department: 'General Medicine',
    status: 'Active'
  });
  const [editFormData, setEditFormData] = useState({});

  // Filtered Services list
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Unique departments for filter
  const departmentsList = ['All', 'General Medicine', 'Cardiology', 'Orthopedics', 'Gynecology', 'Neurology'];

  // Metrics
  const totalCount = services.length;
  const activeCount = services.filter(s => s.status === 'Active').length;
  const avgFeeVal = Math.round(services.reduce((sum, s) => sum + s.fee, 0) / totalCount) || 0;
  const premiumCount = services.filter(s => s.fee >= 800).length;

  // Handlers
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.fee) return;

    const newService = {
      id: 'SRV-' + String(Date.now()).slice(-3),
      name: addFormData.name,
      duration: addFormData.duration,
      fee: parseFloat(addFormData.fee),
      department: addFormData.department,
      status: addFormData.status
    };

    setServices([newService, ...services]);
    setIsAddModalOpen(false);
    setAddFormData({
      name: '',
      duration: '30 Mins',
      fee: '',
      department: 'General Medicine',
      status: 'Active'
    });
  };

  const handleOpenEditModal = (srv) => {
    setEditService(srv);
    setEditFormData({ ...srv });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setServices((prev) =>
      prev.map((s) => (s.id === editService.id ? { ...editFormData, fee: parseFloat(editFormData.fee) } : s))
    );
    setEditService(null);
  };

  const handleDeleteService = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service "${name}"?`)) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Clinical Services Catalog
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>Configure clinic offerings, checkup packages, durations, department mapping, and consulting fees</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <div className="header-search" style={{ width: '220px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Service Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <select
            className="filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            {departmentsList.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
            ))}
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
            <Plus size={16} /> Add Service
          </button>
        </div>
      </div>

      {/* 2. Top Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Services */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL SERVICES</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalCount}</div>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>ACTIVE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{activeCount}</div>
          </div>
        </div>

        {/* Card 3: Avg Fee */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>AVG SERVICE FEE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>₹{avgFeeVal}</div>
          </div>
        </div>

        {/* Card 4: Premium Diagnostics */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>SPECIAL TESTS (&gt;₹800)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{premiumCount}</div>
          </div>
        </div>

      </div>

      {/* 3. Services Grid Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ padding: '0.75rem' }}>Service ID</th>
                <th style={{ padding: '0.75rem' }}>Service Name</th>
                <th style={{ padding: '0.75rem' }}>Mapped Department</th>
                <th style={{ padding: '0.75rem' }}>Slot Duration</th>
                <th style={{ padding: '0.75rem' }}>Consultation Fee</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0066FF' }}>{s.id}</td>
                  <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{s.name}</td>
                  <td style={{ padding: '0.85rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={14} color="#0066FF" />
                      <span>{s.department}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem', color: '#475569', fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} color="#10B981" />
                      <span>{s.duration}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem', fontWeight: '850', color: '#0F172A' }}>₹{s.fee}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={`doc-badge ${s.status === 'Active' ? 'confirmed' : 'cancelled'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.65rem', color: '#D97706', borderColor: '#FDE68A', background: '#FFFBEB' }}
                        onClick={() => handleOpenEditModal(s)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.65rem', color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                        onClick={() => handleDeleteService(s.id, s.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modals */}

      {/* Modal A: Add Service */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Stethoscope size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add New Service</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Service / Consultation Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. General Consultation, ECG checkup..."
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    className="input-field"
                    value={addFormData.department}
                    onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })}
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Slot Duration</label>
                  <select
                    className="input-field"
                    value={addFormData.duration}
                    onChange={(e) => setAddFormData({ ...addFormData, duration: e.target.value })}
                  >
                    <option value="15 Mins">15 Mins</option>
                    <option value="20 Mins">20 Mins</option>
                    <option value="30 Mins">30 Mins</option>
                    <option value="45 Mins">45 Mins</option>
                    <option value="60 Mins">60 Mins</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 500"
                    value={addFormData.fee}
                    onChange={(e) => setAddFormData({ ...addFormData, fee: e.target.value })}
                    required
                  />
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal B: Edit Service */}
      {editService && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Stethoscope size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Modify Service Detail</h2>
              </div>
              <button onClick={() => setEditService(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Service / Consultation Name *</label>
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
                  <label>Department</label>
                  <select
                    className="input-field"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Slot Duration</label>
                  <select
                    className="input-field"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                  >
                    <option value="15 Mins">15 Mins</option>
                    <option value="20 Mins">20 Mins</option>
                    <option value="30 Mins">30 Mins</option>
                    <option value="45 Mins">45 Mins</option>
                    <option value="60 Mins">60 Mins</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editFormData.fee}
                    onChange={(e) => setEditFormData({ ...editFormData, fee: e.target.value })}
                    required
                  />
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditService(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServicesPage;
