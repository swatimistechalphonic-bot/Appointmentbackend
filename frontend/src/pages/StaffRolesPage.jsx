import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import {
  ShieldAlert,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  UserCheck,
  Shield,
  Activity,
  Mail,
  Phone,
  CheckCircle2,
  Users
} from 'lucide-react';

const defaultStaffMembers = [
  { id: 'STF-001', name: 'Dr. Rahul Sharma', role: 'Doctor', email: 'rahul.sharma@caresync.com', phone: '+91 9876543210', status: 'Active' },
  { id: 'STF-002', name: 'Mary Joseph', role: 'Nurse', email: 'mary.j@caresync.com', phone: '+91 9988776655', status: 'Active' },
  { id: 'STF-003', name: 'Amit Kumar', role: 'Admin', email: 'amit.k@caresync.com', phone: '+91 9122334455', status: 'Active' },
  { id: 'STF-004', name: 'Priya Verma', role: 'Receptionist', email: 'priya.v@caresync.com', phone: '+91 8800112233', status: 'Active' },
  { id: 'STF-005', name: 'Sanjay Dutt', role: 'Lab Staff', email: 'sanjay.d@caresync.com', phone: '+91 7766554433', status: 'Active' },
  { id: 'STF-006', name: 'Karan Johar', role: 'Accountant', email: 'karan.j@caresync.com', phone: '+91 9555667788', status: 'Suspended' }
];

const StaffRolesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);

  // Staff List State
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem('caresync_staff_list');
    return saved ? JSON.parse(saved) : defaultStaffMembers;
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authApi.getAllUsers();
        if (res.data?.success && res.data.users?.length > 0) {
          const apiUsers = res.data.users.map((u, idx) => ({
            id: u._id ? `STF-${u._id.slice(-4)}` : `STF-00${idx + 1}`,
            name: u.name || 'Staff Member',
            role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Doctor',
            email: u.email || '',
            phone: u.phone || '+91 9876543210',
            status: u.status || 'Active'
          }));
          
          // Merge API users with existing local list avoiding duplicates
          setStaffList((prev) => {
            const existingEmails = new Set(prev.map(p => p.email.toLowerCase()));
            const newUsers = apiUsers.filter(u => !existingEmails.has(u.email.toLowerCase()));
            const updated = [...newUsers, ...prev];
            localStorage.setItem('caresync_staff_list', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.log('Fetching live users fallback to local staff list:', err.message);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    localStorage.setItem('caresync_staff_list', JSON.stringify(staffList));
  }, [staffList]);

  // Form states
  const [addFormData, setAddFormData] = useState({
    name: '',
    role: 'Doctor',
    email: '',
    phone: '',
    status: 'Active'
  });
  const [editFormData, setEditFormData] = useState({});

  // Filter lists
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const rolesList = ['All', 'Super Admin', 'Admin', 'Doctor', 'Receptionist', 'Nurse', 'Lab Staff', 'Accountant'];

  // Metrics
  const totalCount = staffList.length;
  const adminCount = staffList.filter(s => s.role === 'Admin' || s.role === 'Super Admin').length;
  const doctorCount = staffList.filter(s => s.role === 'Doctor').length;
  const activeCount = staffList.filter(s => s.status === 'Active').length;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.email) return;

    const newStaff = {
      id: 'STF-' + String(Date.now()).slice(-3),
      name: addFormData.name,
      role: addFormData.role,
      email: addFormData.email,
      phone: addFormData.phone || '+91 9999999999',
      status: addFormData.status
    };

    setStaffList([newStaff, ...staffList]);
    setIsAddModalOpen(false);
    setAddFormData({
      name: '',
      role: 'Doctor',
      email: '',
      phone: '',
      status: 'Active'
    });
  };

  const handleOpenEditModal = (staff) => {
    setEditStaff(staff);
    setEditFormData({ ...staff });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setStaffList((prev) =>
      prev.map((s) => (s.id === editStaff.id ? { ...editFormData } : s))
    );
    setEditStaff(null);
  };

  const handleDeleteStaff = (id, name) => {
    if (!window.confirm(`Are you sure you want to remove staff member "${name}"?`)) return;
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Staff & Role Permissions Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>Create system accounts, assign clinic roles, and manage active system log privileges</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <div className="header-search" style={{ width: '220px' }}>
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder="Search Staff Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1.8rem 0.45rem 0.85rem' }}
          >
            {rolesList.map(r => (
              <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
            ))}
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
            <Plus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {/* 2. Staff Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Staff */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL STAFF MEMBERS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalCount}</div>
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>ACTIVE ACCOUNTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{activeCount}</div>
          </div>
        </div>

        {/* Card 3: Doctors */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>DOCTORS REGISTERED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{doctorCount}</div>
          </div>
        </div>

        {/* Card 4: Admins */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>SYSTEM ADMINS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{adminCount}</div>
          </div>
        </div>

      </div>

      {/* 3. Staff List Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ padding: '0.75rem' }}>Staff ID</th>
                <th style={{ padding: '0.75rem' }}>Staff Name</th>
                <th style={{ padding: '0.75rem' }}>Assigned System Role</th>
                <th style={{ padding: '0.75rem' }}>Contact Info</th>
                <th style={{ padding: '0.75rem' }}>Access Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0066FF' }}>{s.id}</td>
                  <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{s.name}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>
                      <Shield size={13} color="#0066FF" />
                      <span>{s.role}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem', fontSize: '0.82rem', color: '#475569' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} color="#94A3B8" /> {s.email}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} color="#94A3B8" /> {s.phone}</span>
                    </div>
                  </td>
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
                        onClick={() => handleDeleteStaff(s.id, s.name)}
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

      {/* Modal A: Add Staff */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldAlert size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Register New Staff</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Dr. Amit Kumar, Nurse Mary..."
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. name@caresync.com"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    className="input-field"
                    value={addFormData.role}
                    onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Lab Staff">Lab Staff</option>
                    <option value="Accountant">Accountant</option>
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
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. +91 9988776655"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal B: Edit Staff */}
      {editStaff && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldAlert size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Modify Staff Privileges</h2>
              </div>
              <button onClick={() => setEditStaff(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="input-field"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    className="input-field"
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Lab Staff">Lab Staff</option>
                    <option value="Accountant">Accountant</option>
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
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="input-field"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditStaff(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffRolesPage;
