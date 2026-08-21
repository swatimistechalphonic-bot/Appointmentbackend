import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { UserCheck, Star, Mail, Phone, Plus, Search } from 'lucide-react';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await authApi.getAllUsers();
      if (res.data?.success) {
        const docList = res.data.users.filter(u => u.role === 'doctor');
        setDoctors(docList.length > 0 ? docList : mockDoctors);
      }
    } catch (err) {
      setDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  };

  const mockDoctors = [
    { _id: '1', name: 'Dr. Calvin Carlo', specialization: 'Orthopedic Specialist', email: 'calvin@doctris.com', phone: '+1 (555) 234-5678', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80', rating: 4.9, patients: 150 },
    { _id: '2', name: 'Dr. Cristino Murphy', specialization: 'Gynecology & Obstetrics', email: 'cristino@doctris.com', phone: '+1 (555) 345-6789', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80', rating: 4.8, patients: 350 },
    { _id: '3', name: 'Dr. Alia Reddy', specialization: 'Psychotherapy & Mental Health', email: 'alia@doctris.com', phone: '+1 (555) 456-7890', avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?w=200&auto=format&fit=crop&q=80', rating: 4.9, patients: 450 },
    { _id: '4', name: 'Dr. Toni Kover', specialization: 'Cardiology Specialist', email: 'toni@doctris.com', phone: '+1 (555) 567-8901', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80', rating: 4.7, patients: 220 },
    { _id: '5', name: 'Dr. Jessica Taylor', specialization: 'Neurology & Brain Care', email: 'jessica@doctris.com', phone: '+1 (555) 678-9012', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80', rating: 5.0, patients: 310 },
    { _id: '6', name: 'Dr. Rahul Sharma', specialization: 'General Physician', email: 'rahul@doctris.com', phone: '+91 98765 43210', avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80', rating: 4.8, patients: 180 },
  ];

  const filteredDoctors = (doctors.length > 0 ? doctors : mockDoctors).filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.specialization && d.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.2rem' }}>
            Doctors Directory
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Browse specialist doctors, availability, and qualifications</p>
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
          <button className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filteredDoctors.map((doc) => (
          <div key={doc._id} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
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

            <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '1rem' }}>
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsPage;
