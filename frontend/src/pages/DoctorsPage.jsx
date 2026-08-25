import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import BookAppointmentModal from '../components/BookAppointmentModal';
import {
  UserCheck,
  Star,
  Mail,
  Phone,
  Plus,
  Search,
  X,
  Calendar,
  Award,
  Clock,
  MapPin,
  Stethoscope,
  CheckCircle2,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Profile View Modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Booking Modal
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Add Doctor Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'General Physician',
    bio: '',
    avatar: '',
    address: ''
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Doctor Modal
  const [editDoctor, setEditDoctor] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    specialization: '',
    bio: '',
    avatar: '',
    address: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.getDoctors();
      if (res.data?.success && Array.isArray(res.data.doctors) && res.data.doctors.length > 0) {
        setDoctors(res.data.doctors);
      } else {
        const usersRes = await authApi.getAllUsers();
        const docList = usersRes.data?.users?.filter((u) => u.role === 'doctor') || [];
        setDoctors(docList.length > 0 ? docList : mockDoctors);
      }
    } catch (err) {
      setDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  };

  const mockDoctors = [
    { _id: '1', name: 'Dr. Calvin Carlo', specialization: 'Orthopedic Specialist', email: 'calvin@doctris.com', phone: '+1 (555) 234-5678', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80', rating: 4.9, patients: 150, experience: '12+ Years', bio: 'Senior Orthopedic surgeon specializing in joint replacement.', location: 'Main Hospital, Block A, Room 102', hours: '09:00 AM - 05:00 PM' },
    { _id: '2', name: 'Dr. Cristino Murphy', specialization: 'Gynecology & Obstetrics', email: 'cristino@doctris.com', phone: '+1 (555) 345-6789', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80', rating: 4.8, patients: 350, experience: '10+ Years', bio: 'Expert Obstetrician focusing on maternal care.', location: 'Women Care Wing, Room 204', hours: '10:00 AM - 04:00 PM' },
    { _id: '3', name: 'Dr. Alia Reddy', specialization: 'Psychotherapy & Mental Health', email: 'alia@doctris.com', phone: '+1 (555) 456-7890', avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?w=200&auto=format&fit=crop&q=80', rating: 4.9, patients: 450, experience: '8+ Years', bio: 'Licensed Psychiatrist specialized in CBT therapy.', location: 'Mind Health Center, Room 305', hours: '11:00 AM - 06:00 PM' },
    { _id: '4', name: 'Dr. Toni Kover', specialization: 'Cardiology Specialist', email: 'toni@doctris.com', phone: '+1 (555) 567-8901', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80', rating: 4.7, patients: 220, experience: '15+ Years', bio: 'Chief Cardiologist with extensive clinical practice.', location: 'Heart Care Center, Room 401', hours: '09:00 AM - 03:00 PM' },
    { _id: '5', name: 'Dr. Jessica Taylor', specialization: 'Neurology & Brain Care', email: 'jessica@doctris.com', phone: '+1 (555) 678-9012', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80', rating: 5.0, patients: 310, experience: '14+ Years', bio: 'Leading Neurosurgeon specializing in stroke care.', location: 'Neuro Institute, Room 502', hours: '10:00 AM - 05:00 PM' },
    { _id: '6', name: 'Dr. Rahul Sharma', specialization: 'General Physician', email: 'rahul@doctris.com', phone: '+91 98765 43210', avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80', rating: 4.8, patients: 180, experience: '9+ Years', bio: 'Compassionate General Physician managing acute illness.', location: 'OPD Building, Desk 12', hours: '09:00 AM - 06:00 PM' }
  ];

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!addFormData.name) {
      setAddError('Doctor name is required');
      return;
    }

    setAddSubmitting(true);
    const newDocObj = {
      _id: 'doc_' + Date.now(),
      name: addFormData.name,
      email: addFormData.email || `${addFormData.name.toLowerCase().replace(/\s+/g, '')}@caresync.com`,
      phone: addFormData.phone || '+91 9876543210',
      specialization: addFormData.specialization || 'General Physician',
      bio: addFormData.bio || 'Experienced medical consultant.',
      avatar: addFormData.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
      rating: 4.9,
      patients: 120,
      experience: '8+ Years',
      location: addFormData.address || 'OPD Desk 04, Main Wing',
      hours: '09:00 AM - 05:00 PM'
    };

    try {
      const res = await authApi.createDoctor({
        ...addFormData,
        avatar: addFormData.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200'
      });

      if (res.data?.success && res.data.doctor) {
        setDoctors((prev) => [res.data.doctor, ...prev]);
      } else {
        setDoctors((prev) => [newDocObj, ...prev]);
      }
    } catch (err) {
      console.log('Backend create doctor fallback to local list:', err.message);
      setDoctors((prev) => [newDocObj, ...prev]);
    } finally {
      setIsAddModalOpen(false);
      setAddFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: 'General Physician',
        bio: '',
        avatar: '',
        address: ''
      });
      setAddSubmitting(false);
    }
  };

  const handleOpenEditModal = (doc) => {
    setEditDoctor(doc);
    setEditFormData({
      name: doc.name || '',
      phone: doc.phone || '',
      specialization: doc.specialization || 'General Physician',
      bio: doc.bio || '',
      avatar: doc.avatar || '',
      address: doc.address || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editFormData.name) {
      setEditError('Doctor name is required');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await authApi.updateDoctor(editDoctor._id, editFormData);
      if (res.data?.success) {
        setEditDoctor(null);
        fetchDoctors();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update doctor profile');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete doctor account "${doc.name}"?`)) return;

    try {
      const res = await authApi.deleteDoctor(doc._id);
      if (res.data?.success) {
        setDoctors((prev) => prev.filter((d) => d._id !== doc._id));
      }
    } catch (err) {
      alert('Failed to delete doctor account');
    }
  };

  const filteredDoctors = (doctors.length > 0 ? doctors : mockDoctors).filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.specialization && d.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBookFromProfile = (doc) => {
    setSelectedDoctor(null);
    setBookingDoctor(doc);
    setIsBookingModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
            Doctors Directory 🩺
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Manage specialist doctors, profiles, and clinical staff</p>
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

          <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      </div>

      {/* Grid of Doctor Cards */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          Loading doctor profiles...
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          No doctors found matching your query.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filteredDoctors.map((doc) => (
            <div key={doc._id} className="card" style={{ textAlign: 'center', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <img
                  src={doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
                  alt={doc.name}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '3px solid #EEF2FF' }}
                />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1E293B' }}>{doc.name}</h3>
                <p style={{ fontSize: '0.82rem', color: '#2F65F6', fontWeight: '600', marginBottom: '0.75rem' }}>
                  {doc.specialization || 'General Physician'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#F59E0B', marginBottom: '1rem' }}>
                  <Star size={16} fill="#F59E0B" />
                  <span style={{ fontWeight: '700', color: '#1E293B' }}>{doc.rating || '4.9'}</span>
                  <span style={{ color: '#64748B' }}>({doc.patients || 150}+ Patients)</span>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#64748B', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} color="#64748B" /> {doc.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} color="#64748B" /> {doc.phone || '+1 555-0192'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedDoctor(doc)}
                >
                  View Profile
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.4rem 0.6rem', color: '#D97706', borderColor: '#FDE68A', background: '#FFFBEB' }}
                  title="Edit Doctor"
                  onClick={() => handleOpenEditModal(doc)}
                >
                  <Edit size={15} />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.4rem 0.6rem', color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                  title="Delete Doctor"
                  onClick={() => handleDeleteDoctor(doc)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Popup Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <UserCheck size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add New Specialist Doctor</h2>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Doctor Full Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Dr. Amit Sharma"
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
                    placeholder="doctor@hospital.com"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Account Password *</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Set password..."
                    value={addFormData.password}
                    onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="+91 9811223344"
                    value={addFormData.phone}
                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Specialization</label>
                  <select
                    className="input-field"
                    value={addFormData.specialization}
                    onChange={(e) => setAddFormData({ ...addFormData, specialization: e.target.value })}
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiology Specialist">Cardiology Specialist</option>
                    <option value="Orthopedic Specialist">Orthopedic Specialist</option>
                    <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                    <option value="Neurology & Brain Care">Neurology & Brain Care</option>
                    <option value="Psychotherapy & Mental Health">Psychotherapy & Mental Health</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Avatar Image URL</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="https://..."
                    value={addFormData.avatar}
                    onChange={(e) => setAddFormData({ ...addFormData, avatar: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Clinic Address / OPD Room</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. OPD Block A, Room 104"
                  value={addFormData.address}
                  onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Doctor Bio / Summary</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Clinical experience, specialization overview..."
                  value={addFormData.bio}
                  onChange={(e) => setAddFormData({ ...addFormData, bio: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addSubmitting}>
                  {addSubmitting ? 'Saving...' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Popup Modal */}
      {editDoctor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <UserCheck size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Edit Doctor Profile</h2>
              </div>
              <button onClick={() => setEditDoctor(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Doctor Full Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Specialization</label>
                  <select
                    className="input-field"
                    value={editFormData.specialization}
                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiology Specialist">Cardiology Specialist</option>
                    <option value="Orthopedic Specialist">Orthopedic Specialist</option>
                    <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                    <option value="Neurology & Brain Care">Neurology & Brain Care</option>
                    <option value="Psychotherapy & Mental Health">Psychotherapy & Mental Health</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Avatar Image URL</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editFormData.avatar}
                    onChange={(e) => setEditFormData({ ...editFormData, avatar: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Clinic Address / OPD Room</label>
                <input
                  type="text"
                  className="input-field"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Doctor Bio / Summary</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditDoctor(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Updating...' : 'Update Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Doctor Profile Modal */}
      {selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={selectedDoctor.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
                  alt={selectedDoctor.name}
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0066FF' }}
                />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {selectedDoctor.name}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#0066FF', fontWeight: '700', margin: '0.15rem 0' }}>
                    {selectedDoctor.specialization || 'General Physician'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#F59E0B' }}>
                    <Star size={14} fill="#F59E0B" />
                    <span style={{ fontWeight: '700', color: '#0F172A' }}>{selectedDoctor.rating || '4.9'}</span>
                    <span style={{ color: '#64748B' }}>({selectedDoctor.patients || 150}+ Consultations)</span>
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedDoctor(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              <div>
                <div style={{ color: '#64748B', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  ABOUT DOCTOR
                </div>
                <p style={{ color: '#334155', lineHeight: '1.5' }}>
                  {selectedDoctor.bio || 'Experienced specialist doctor dedicated to delivering high quality medical consultations and clinical care.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.78rem', fontWeight: '700' }}>
                    <Award size={14} color="#0066FF" /> EXPERIENCE
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0F172A', marginTop: '0.2rem' }}>
                    {selectedDoctor.experience || '10+ Years'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.78rem', fontWeight: '700' }}>
                    <Stethoscope size={14} color="#0066FF" /> QUALIFICATION
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0F172A', marginTop: '0.2rem' }}>
                    MBBS, MD (Specialist)
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.78rem', fontWeight: '700' }}>
                    <Mail size={14} color="#0066FF" /> EMAIL
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0F172A', marginTop: '0.2rem' }}>
                    {selectedDoctor.email}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.78rem', fontWeight: '700' }}>
                    <Phone size={14} color="#0066FF" /> PHONE
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0F172A', marginTop: '0.2rem' }}>
                    {selectedDoctor.phone || '+1 555-0192'}
                  </div>
                </div>
              </div>

              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E40AF', fontWeight: '600', fontSize: '0.84rem' }}>
                  <MapPin size={16} color="#0066FF" />
                  <span><strong>Location:</strong> {selectedDoctor.location || 'Main Hospital, OPD Block A'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E40AF', fontWeight: '600', fontSize: '0.84rem' }}>
                  <Clock size={16} color="#0066FF" />
                  <span><strong>Consultation Hours:</strong> {selectedDoctor.hours || '09:00 AM - 05:00 PM (Mon-Sat)'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedDoctor(null)} className="btn btn-secondary">
                Close
              </button>
              <button onClick={() => handleBookFromProfile(selectedDoctor)} className="btn btn-primary">
                <Calendar size={16} /> Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedDoctor={bookingDoctor}
      />
    </div>
  );
};

export default DoctorsPage;
