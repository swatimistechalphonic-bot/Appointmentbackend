import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, MoreHorizontal, X, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { patientApi } from '../services/api';

const PatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Female',
    bloodGroup: 'B+',
    address: '123 Main St, New York',
    medicalHistory: 'No known allergies',
    lastVisit: 'Today',
    status: 'Approved'
  });

  const defaultPatientsList = [
    { _id: '1', name: 'Calvin Carlo', age: 34, gender: 'Male', phone: '+1 555-0192', email: 'calvin@gmail.com', lastVisit: '27th Nov, 2020', status: 'Approved', bloodGroup: 'B+' },
    { _id: '2', name: 'Joya Khan', age: 28, gender: 'Female', phone: '+1 555-0193', email: 'joya@gmail.com', lastVisit: '27th Nov, 2020', status: 'Pending', bloodGroup: 'O+' },
    { _id: '3', name: 'Amelia Muli', age: 45, gender: 'Female', phone: '+1 555-0194', email: 'amelia@gmail.com', lastVisit: '25th Nov, 2020', status: 'Approved', bloodGroup: 'A-' },
    { _id: '4', name: 'Nik Ronaldo', age: 52, gender: 'Male', phone: '+1 555-0195', email: 'nik@gmail.com', lastVisit: '22nd Nov, 2020', status: 'Cancelled', bloodGroup: 'AB+' },
    { _id: '5', name: 'Crista Joseph', age: 29, gender: 'Female', phone: '+1 555-0196', email: 'crista@gmail.com', lastVisit: '20th Nov, 2020', status: 'Approved', bloodGroup: 'O-' },
    { _id: '6', name: 'Swati Verma', age: 26, gender: 'Female', phone: '+91 9876543210', email: 'swati@gmail.com', lastVisit: 'Today', status: 'Approved', bloodGroup: 'B+' },
  ];

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await patientApi.getAllPatients(searchTerm);
      if (res.data?.success && Array.isArray(res.data.patients)) {
        setPatients(res.data.patients.length > 0 ? res.data.patients : defaultPatientsList);
      } else {
        setPatients(defaultPatientsList);
      }
    } catch (err) {
      console.error('Fetch Patients Error:', err);
      setPatients(defaultPatientsList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!formData.name || !formData.phone || !formData.age) {
      setModalError('Please fill required fields (Name, Phone, Age)');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age)
      };

      const res = await patientApi.createPatient(payload);
      if (res.data?.success) {
        setModalSuccess('Patient record created successfully!');
        setTimeout(() => {
          setIsModalOpen(false);
          setModalSuccess('');
          setFormData({
            name: '',
            email: '',
            phone: '',
            age: '',
            gender: 'Female',
            bloodGroup: 'B+',
            address: '123 Main St, New York',
            medicalHistory: 'No known allergies',
            lastVisit: 'Today',
            status: 'Approved'
          });
          fetchPatients();
        }, 1200);
      }
    } catch (err) {
      console.error('Add Patient Error:', err);
      setModalError(err.response?.data?.message || 'Failed to create patient record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
            Patients Records
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Manage patient clinical histories and visit records</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="header-search" style={{ width: '280px' }}>
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search Patient by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Add Patient
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading patient records...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '1rem' }}>Patient Name</th>
                <th style={{ padding: '1rem' }}>Age / Gender</th>
                <th style={{ padding: '1rem' }}>Blood Group</th>
                <th style={{ padding: '1rem' }}>Contact Info</th>
                <th style={{ padding: '1rem' }}>Last Visit</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id || p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#1E293B' }}>{p.name}</td>
                  <td style={{ padding: '1rem', color: '#64748B' }}>{p.age} Yrs ({p.gender})</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', background: '#FEE2E2', color: '#DC2626', fontWeight: '700', borderRadius: '6px', fontSize: '0.78rem' }}>
                      {p.bloodGroup}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748B' }}>
                    <div>{p.phone}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{p.email}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748B' }}>{p.lastVisit}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${p.status === 'Approved' ? 'badge-completed' : p.status === 'Pending' ? 'badge-pending' : 'badge-cancelled'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.5rem' }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EEF2FF', color: '#2F65F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Add New Patient</h2>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>Create a new patient record in system</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={18} />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={18} />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddPatientSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Patient Name *</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="e.g. suman"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="e.g. suman@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  className="input-field"
                  placeholder="e.g. 6307234318"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Age *</label>
                <input
                  type="number"
                  name="age"
                  className="input-field"
                  placeholder="e.g. 34"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" className="input-field" value={formData.gender} onChange={handleInputChange}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup" className="input-field" value={formData.bloodGroup} onChange={handleInputChange}>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" className="input-field" value={formData.status} onChange={handleInputChange}>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  className="input-field"
                  placeholder="e.g. 123 Main St, New York"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Medical History</label>
                <textarea
                  name="medicalHistory"
                  className="input-field"
                  rows={2}
                  placeholder="e.g. No known allergies"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
