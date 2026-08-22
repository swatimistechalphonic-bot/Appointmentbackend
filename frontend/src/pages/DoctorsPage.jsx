import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import BookAppointmentModal from '../components/BookAppointmentModal';
import { UserCheck, Star, Mail, Phone, Plus, Search, X, Calendar, Award, Clock, MapPin, Stethoscope, CheckCircle2 } from 'lucide-react';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Doctor Profile View Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await authApi.getDoctors();
      if (res.data?.success && res.data.doctors?.length > 0) {
        setDoctors(res.data.doctors);
      } else {
        const usersRes = await authApi.getAllUsers();
        const docList = usersRes.data?.users?.filter(u => u.role === 'doctor') || [];
        setDoctors(docList.length > 0 ? docList : mockDoctors);
      }
    } catch (err) {
      setDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  };

  const mockDoctors = [
    { _id: '1', name: 'Dr. Calvin Carlo', specialization: 'Orthopedic Specialist', email: 'calvin@doctris.com', phone: '+1 (555) 234-5678', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80', rating: 4.9, patients: 150, experience: '12+ Years', bio: 'Senior Orthopedic surgeon specializing in joint replacement, sports injury rehabilitation, and bone surgery.', location: 'Main Hospital, Block A, Room 102', hours: '09:00 AM - 05:00 PM (Mon-Sat)' },
    { _id: '2', name: 'Dr. Cristino Murphy', specialization: 'Gynecology & Obstetrics', email: 'cristino@doctris.com', phone: '+1 (555) 345-6789', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80', rating: 4.8, patients: 350, experience: '10+ Years', bio: 'Expert Obstetrician and Gynecologist focusing on maternal care, laparoscopic surgeries, and women reproductive health.', location: 'Women Care Wing, Room 204', hours: '10:00 AM - 04:00 PM (Mon-Fri)' },
    { _id: '3', name: 'Dr. Alia Reddy', specialization: 'Psychotherapy & Mental Health', email: 'alia@doctris.com', phone: '+1 (555) 456-7890', avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?w=200&auto=format&fit=crop&q=80', rating: 4.9, patients: 450, experience: '8+ Years', bio: 'Licensed Psychiatrist specialized in cognitive behavioral therapy, anxiety disorders, and stress management.', location: 'Mind Health Center, Room 305', hours: '11:00 AM - 06:00 PM (Mon-Sat)' },
    { _id: '4', name: 'Dr. Toni Kover', specialization: 'Cardiology Specialist', email: 'toni@doctris.com', phone: '+1 (555) 567-8901', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80', rating: 4.7, patients: 220, experience: '15+ Years', bio: 'Chief Cardiologist with extensive clinical practice in cardiovascular interventions, angioplasty, and heart care.', location: 'Heart Care Center, Room 401', hours: '09:00 AM - 03:00 PM (Mon-Sat)' },
    { _id: '5', name: 'Dr. Jessica Taylor', specialization: 'Neurology & Brain Care', email: 'jessica@doctris.com', phone: '+1 (555) 678-9012', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80', rating: 5.0, patients: 310, experience: '14+ Years', bio: 'Leading Neurosurgeon specializing in stroke care, brain tumor treatment, and neurological disorders.', location: 'Neuro Institute, Room 502', hours: '10:00 AM - 05:00 PM (Mon-Fri)' },
    { _id: '6', name: 'Dr. Rahul Sharma', specialization: 'General Physician', email: 'rahul@doctris.com', phone: '+91 98765 43210', avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80', rating: 4.8, patients: 180, experience: '9+ Years', bio: 'Compassionate General Physician managing acute illness, preventive healthcare, and routine wellness checkups.', location: 'OPD Building, Desk 12', hours: '09:00 AM - 06:00 PM (Mon-Sat)' },
  ];

  const filteredDoctors = (doctors.length > 0 ? doctors : mockDoctors).filter(d =>
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
        </div>
      </div>

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

            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', marginTop: '1.25rem' }}
              onClick={() => setSelectedDoctor(doc)}
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

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
              {/* Doctor Bio */}
              <div>
                <div style={{ color: '#64748B', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  ABOUT DOCTOR
                </div>
                <p style={{ color: '#334155', lineHeight: '1.5' }}>
                  {selectedDoctor.bio || 'Experienced specialist doctor dedicated to delivering high quality medical consultations and clinical care.'}
                </p>
              </div>

              {/* Grid Metrics */}
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

              {/* Location & Hours */}
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

            {/* Actions */}
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

      {/* Book Appointment Modal triggered from Doctor Profile */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedDoctor={bookingDoctor}
      />
    </div>
  );
};

export default DoctorsPage;
