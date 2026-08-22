import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  UserCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';

const SchedulesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Initial Doctor Schedules list
  const [schedules, setSchedules] = useState([
    {
      id: '1',
      doctorName: 'Dr. Rahul Sharma',
      specialization: 'General Physician',
      workingDays: 'Mon - Sat',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 18,
      status: 'Active'
    },
    {
      id: '2',
      doctorName: 'Dr. Calvin Carlo',
      specialization: 'Orthopedic Specialist',
      workingDays: 'Mon - Fri',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 16,
      status: 'Active'
    },
    {
      id: '3',
      doctorName: 'Dr. Cristino Murphy',
      specialization: 'Gynecology & Obstetrics',
      workingDays: 'Mon - Sat',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      slotDuration: '20 Mins',
      totalSlots: 18,
      status: 'Active'
    },
    {
      id: '4',
      doctorName: 'Dr. Alia Reddy',
      specialization: 'Psychotherapy & Mental Health',
      workingDays: 'Tue - Sat',
      startTime: '11:00 AM',
      endTime: '06:00 PM',
      slotDuration: '45 Mins',
      totalSlots: 9,
      status: 'On Leave'
    },
    {
      id: '5',
      doctorName: 'Dr. Toni Kover',
      specialization: 'Cardiology Specialist',
      workingDays: 'Mon - Sat',
      startTime: '09:00 AM',
      endTime: '03:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 12,
      status: 'Active'
    },
    {
      id: '6',
      doctorName: 'Dr. Jessica Taylor',
      specialization: 'Neurology & Brain Care',
      workingDays: 'Mon - Fri',
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 14,
      status: 'Active'
    }
  ]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);

  // Add Form
  const [addFormData, setAddFormData] = useState({
    doctorName: '',
    specialization: 'General Physician',
    workingDays: 'Mon - Sat',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    slotDuration: '30 Mins',
    totalSlots: 16,
    status: 'Active'
  });

  // Edit Form
  const [editFormData, setEditFormData] = useState({
    doctorName: '',
    specialization: '',
    workingDays: '',
    startTime: '',
    endTime: '',
    slotDuration: '',
    totalSlots: 16,
    status: 'Active'
  });

  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      s.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addFormData.doctorName) return;

    const newEntry = {
      id: Date.now().toString(),
      ...addFormData
    };

    setSchedules([newEntry, ...schedules]);
    setIsAddModalOpen(false);
    setAddFormData({
      doctorName: '',
      specialization: 'General Physician',
      workingDays: 'Mon - Sat',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      slotDuration: '30 Mins',
      totalSlots: 16,
      status: 'Active'
    });
  };

  const handleOpenEditModal = (sch) => {
    setEditSchedule(sch);
    setEditFormData({ ...sch });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setSchedules((prev) =>
      prev.map((s) => (s.id === editSchedule.id ? { ...editFormData } : s))
    );
    setEditSchedule(null);
  };

  const handleDeleteSchedule = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete schedule for ${name}?`)) return;
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
            Doctor Schedules & Shift Timings
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Manage weekly working days, shift hours, and consultation time slots</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="header-search" style={{ width: '250px' }}>
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search Doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Schedule
          </button>
        </div>
      </div>

      {/* Grid of Schedules */}
      {filteredSchedules.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          No doctor schedules found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredSchedules.map((sch) => (
            <div key={sch.id} className="card" style={{ padding: '1.4rem', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EEF2FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>{sch.doctorName}</h3>
                      <div style={{ fontSize: '0.82rem', color: '#0066FF', fontWeight: '600' }}>
                        {sch.specialization}
                      </div>
                    </div>
                  </div>

                  <span className={`doc-badge ${sch.status === 'Active' ? 'confirmed' : sch.status === 'On Leave' ? 'pending' : 'cancelled'}`}>
                    {sch.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.85rem', background: '#F8FAFC', borderRadius: '12px', marginBottom: '1.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={15} color="#0066FF" />
                    <span>Working Days: <strong style={{ color: '#0F172A' }}>{sch.workingDays}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={15} color="#10B981" />
                    <span>Shift Hours: <strong style={{ color: '#0F172A' }}>{sch.startTime} - {sch.endTime}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Stethoscope size={15} color="#8B5CF6" />
                    <span>Slot Duration: <strong style={{ color: '#0F172A' }}>{sch.slotDuration}</strong> ({sch.totalSlots} Slots/day)</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                  Schedule ID: #{sch.id}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem 0.65rem', color: '#D97706', borderColor: '#FDE68A', background: '#FFFBEB' }}
                    title="Edit Schedule"
                    onClick={() => handleOpenEditModal(sch)}
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem 0.65rem', color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                    title="Delete Schedule"
                    onClick={() => handleDeleteSchedule(sch.id, sch.doctorName)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Schedule Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add Doctor Schedule</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Doctor Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Dr. Rahul Sharma"
                  value={addFormData.doctorName}
                  onChange={(e) => setAddFormData({ ...addFormData, doctorName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Cardiologist"
                    value={addFormData.specialization}
                    onChange={(e) => setAddFormData({ ...addFormData, specialization: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Working Days</label>
                  <select
                    className="input-field"
                    value={addFormData.workingDays}
                    onChange={(e) => setAddFormData({ ...addFormData, workingDays: e.target.value })}
                  >
                    <option value="Mon - Sat">Mon - Sat</option>
                    <option value="Mon - Fri">Mon - Fri</option>
                    <option value="Tue - Sat">Tue - Sat</option>
                    <option value="Daily">Daily (Mon - Sun)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="09:00 AM"
                    value={addFormData.startTime}
                    onChange={(e) => setAddFormData({ ...addFormData, startTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="05:00 PM"
                    value={addFormData.endTime}
                    onChange={(e) => setAddFormData({ ...addFormData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Slot Duration</label>
                  <select
                    className="input-field"
                    value={addFormData.slotDuration}
                    onChange={(e) => setAddFormData({ ...addFormData, slotDuration: e.target.value })}
                  >
                    <option value="15 Mins">15 Mins</option>
                    <option value="20 Mins">20 Mins</option>
                    <option value="30 Mins">30 Mins</option>
                    <option value="45 Mins">45 Mins</option>
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
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {editSchedule && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Edit Schedule</h2>
              </div>
              <button onClick={() => setEditSchedule(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Doctor Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={editFormData.doctorName}
                  onChange={(e) => setEditFormData({ ...editFormData, doctorName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFormData.specialization}
                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Working Days</label>
                  <select
                    className="input-field"
                    value={editFormData.workingDays}
                    onChange={(e) => setEditFormData({ ...editFormData, workingDays: e.target.value })}
                  >
                    <option value="Mon - Sat">Mon - Sat</option>
                    <option value="Mon - Fri">Mon - Fri</option>
                    <option value="Tue - Sat">Tue - Sat</option>
                    <option value="Daily">Daily (Mon - Sun)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Slot Duration</label>
                  <select
                    className="input-field"
                    value={editFormData.slotDuration}
                    onChange={(e) => setEditFormData({ ...editFormData, slotDuration: e.target.value })}
                  >
                    <option value="15 Mins">15 Mins</option>
                    <option value="20 Mins">20 Mins</option>
                    <option value="30 Mins">30 Mins</option>
                    <option value="45 Mins">45 Mins</option>
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
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditSchedule(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesPage;
