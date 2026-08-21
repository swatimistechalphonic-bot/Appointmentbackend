import React, { useState } from 'react';
import { Users, Search, Plus, Filter, MoreHorizontal } from 'lucide-react';

const PatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const patientsList = [
    { id: '1', name: 'Calvin Carlo', age: 34, gender: 'Male', phone: '+1 555-0192', email: 'calvin@gmail.com', lastVisit: '27th Nov, 2020', status: 'Approved', bloodGroup: 'B+' },
    { id: '2', name: 'Joya Khan', age: 28, gender: 'Female', phone: '+1 555-0193', email: 'joya@gmail.com', lastVisit: '27th Nov, 2020', status: 'Pending', bloodGroup: 'O+' },
    { id: '3', name: 'Amelia Muli', age: 45, gender: 'Female', phone: '+1 555-0194', email: 'amelia@gmail.com', lastVisit: '25th Nov, 2020', status: 'Approved', bloodGroup: 'A-' },
    { id: '4', name: 'Nik Ronaldo', age: 52, gender: 'Male', phone: '+1 555-0195', email: 'nik@gmail.com', lastVisit: '22nd Nov, 2020', status: 'Cancelled', bloodGroup: 'AB+' },
    { id: '5', name: 'Crista Joseph', age: 29, gender: 'Female', phone: '+1 555-0196', email: 'crista@gmail.com', lastVisit: '20th Nov, 2020', status: 'Approved', bloodGroup: 'O-' },
    { id: '6', name: 'Swati Verma', age: 26, gender: 'Female', phone: '+91 9876543210', email: 'swati@gmail.com', lastVisit: 'Today', status: 'Approved', bloodGroup: 'B+' },
  ];

  const filteredPatients = patientsList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="header-search" style={{ width: '250px' }}>
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Patient
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
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
            {filteredPatients.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
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
      </div>
    </div>
  );
};

export default PatientsPage;
