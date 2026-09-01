import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookAppointmentModal from '../components/BookAppointmentModal';
import { authApi, departmentApi, serviceApi } from '../services/api';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  Search,
  PhoneCall,
  ShieldCheck,
  Award,
  Users,
  Activity,
  HeartPulse,
  Video,
  FileSpreadsheet,
  Building2,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Mail,
  LogIn,
  LayoutDashboard,
  Heart,
  Brain,
  Bone,
  Pill,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const PublicWebsite = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Dynamic Data States
  const [doctorsList, setDoctorsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    setLoadingDoctors(true);
    try {
      const [docRes, deptRes] = await Promise.allSettled([
        authApi.getDoctors(),
        departmentApi.getAllDepartments()
      ]);

      if (docRes.status === 'fulfilled' && docRes.value?.data?.doctors) {
        setDoctorsList(docRes.value.data.doctors);
      } else {
        setDoctorsList(defaultDoctors);
      }

      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
        setDepartmentsList(deptRes.value.data.departments);
      } else {
        setDepartmentsList(defaultDepartments);
      }
    } catch (err) {
      console.error('Fetch public website data error:', err);
      setDoctorsList(defaultDoctors);
      setDepartmentsList(defaultDepartments);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const defaultDepartments = [
    { name: 'Cardiology', icon: Heart, count: '14 Specialists', desc: 'Comprehensive heart care, ECG, angiography, and cardiovascular surgeries.', color: '#EF4444', bg: '#FEE2E2' },
    { name: 'Neurology', icon: Brain, count: '10 Specialists', desc: 'Advanced brain, spine, neuro-rehabilitation, and nerve disorder treatments.', color: '#8B5CF6', bg: '#F3E8FF' },
    { name: 'Orthopedics', icon: Bone, count: '12 Specialists', desc: 'Joint replacement, fracture repair, sports medicine, and spinal care.', color: '#0066FF', bg: '#EFF6FF' },
    { name: 'Pediatrics', icon: Users, count: '9 Specialists', desc: 'Dedicated child healthcare, newborn care, vaccinations, and growth monitoring.', color: '#10B981', bg: '#ECFDF5' },
    { name: 'Dermatology', icon: Sparkles, count: '8 Specialists', desc: 'Skin, hair, laser cosmetics, allergy diagnosis, and dermatological surgery.', color: '#F59E0B', bg: '#FEF3C7' },
    { name: 'General Medicine', icon: Stethoscope, count: '18 Specialists', desc: 'Primary diagnosis, chronic illness management, fever, and routine checkups.', color: '#06B6D4', bg: '#E0F2FE' },
  ];

  const defaultDoctors = [
    {
      _id: 'doc-1',
      name: 'Dr. Amit Verma',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experience: '14 Years Exp.',
      rating: '4.9',
      reviewsCount: '210',
      fee: '₹800',
      timing: '10:00 AM - 04:00 PM',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
    },
    {
      _id: 'doc-2',
      name: 'Dr. Neha Singh',
      specialization: 'Dermatology',
      qualification: 'MBBS, MD (Dermatology)',
      experience: '9 Years Exp.',
      rating: '4.8',
      reviewsCount: '185',
      fee: '₹700',
      timing: '11:00 AM - 05:00 PM',
      avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78946?w=300&auto=format&fit=crop&q=80'
    },
    {
      _id: 'doc-3',
      name: 'Dr. Rahul Gupta',
      specialization: 'Orthopedics',
      qualification: 'MBBS, MS (Orthopedics)',
      experience: '12 Years Exp.',
      rating: '4.9',
      reviewsCount: '340',
      fee: '₹900',
      timing: '09:00 AM - 02:00 PM',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80'
    },
    {
      _id: 'doc-4',
      name: 'Dr. Pooja Sharma',
      specialization: 'Pediatrics',
      qualification: 'MBBS, DCH, MD',
      experience: '11 Years Exp.',
      rating: '4.9',
      reviewsCount: '290',
      fee: '₹600',
      timing: '10:30 AM - 03:30 PM',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80'
    },
    {
      _id: 'doc-5',
      name: 'Dr. Vivek Malhotra',
      specialization: 'Neurology',
      qualification: 'MBBS, MD, DM (Neurology)',
      experience: '16 Years Exp.',
      rating: '5.0',
      reviewsCount: '420',
      fee: '₹1,000',
      timing: '02:00 PM - 07:00 PM',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80'
    },
    {
      _id: 'doc-6',
      name: 'Dr. Ananya Roy',
      specialization: 'General Medicine',
      qualification: 'MBBS, DNB (Internal Med)',
      experience: '8 Years Exp.',
      rating: '4.7',
      reviewsCount: '160',
      fee: '₹500',
      timing: '09:00 AM - 01:00 PM',
      avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&auto=format&fit=crop&q=80'
    }
  ];

  const filteredDoctors = (doctorsList.length > 0 ? doctorsList : defaultDoctors).filter(doc => {
    const matchesSearch =
      (doc.name || '').toLowerCase().includes(doctorSearch.toLowerCase()) ||
      (doc.specialization || '').toLowerCase().includes(doctorSearch.toLowerCase());
    const matchesDept =
      selectedDepartment === 'All' ||
      (doc.specialization || '').toLowerCase() === selectedDepartment.toLowerCase();
    return matchesSearch && matchesDept;
  });

  const handleBookDoctorClick = (doc) => {
    setSelectedDoctor(doc);
    setIsModalOpen(true);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0F172A', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* 🟢 TOP EMERGENCY HELPLINE STRIP */}
      <div style={{ background: '#0F172A', color: '#94A3B8', fontSize: '0.82rem', padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F43F5E', fontWeight: '700' }}>
            <PhoneCall size={14} /> 24/7 Emergency Helpline: <strong>1800-CARE-SYNC (1800-2273-7962)</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="#0066FF" /> Healthcare City, Metro Tower, Delhi NCR
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} color="#10B981" /> OPD Hours: 08:00 AM - 08:00 PM
          </span>
          {user ? (
            <Link to="/dashboard" style={{ color: '#60A5FA', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <LayoutDashboard size={14} /> Go to Dashboard
            </Link>
          ) : (
            <Link to="/login" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <LogIn size={14} /> Staff / Doctor Login
            </Link>
          )}
        </div>
      </div>

      {/* ⚪ PUBLIC NAVBAR */}
      <header style={{ background: '#FFFFFF', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#0066FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,102,255,0.4)' }}>
              <HeartPulse size={24} />
            </div>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em' }}>DocAdmin</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CareSync Hospital Network</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
            <a href="#home" style={{ color: '#0066FF', fontWeight: '700', textDecoration: 'none', fontSize: '0.92rem' }}>Home</a>
            <a href="#departments" style={{ color: '#475569', fontWeight: '600', textDecoration: 'none', fontSize: '0.92rem' }}>Specialties</a>
            <a href="#doctors" style={{ color: '#475569', fontWeight: '600', textDecoration: 'none', fontSize: '0.92rem' }}>Find Doctors</a>
            <a href="#services" style={{ color: '#475569', fontWeight: '600', textDecoration: 'none', fontSize: '0.92rem' }}>Services</a>
            <a href="#reviews" style={{ color: '#475569', fontWeight: '600', textDecoration: 'none', fontSize: '0.92rem' }}>Testimonials</a>
            <a href="#contact" style={{ color: '#475569', fontWeight: '600', textDecoration: 'none', fontSize: '0.92rem' }}>Contact Us</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ borderRadius: '12px', padding: '0.6rem 1.25rem', fontSize: '0.88rem', fontWeight: '700' }}>
                <LayoutDashboard size={16} /> Admin Portal
              </button>
            ) : (
              <Link to="/login" className="btn btn-secondary" style={{ borderRadius: '12px', padding: '0.6rem 1.15rem', fontSize: '0.88rem', fontWeight: '700', textDecoration: 'none' }}>
                Sign In
              </Link>
            )}

            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ borderRadius: '12px', padding: '0.6rem 1.25rem', fontSize: '0.88rem', fontWeight: '700', boxShadow: '0 4px 14px rgba(0,102,255,0.35)' }}>
              <Calendar size={17} /> Book Appointment
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section id="home" style={{ position: 'relative', overflow: 'hidden', padding: '4rem 1.5rem 5rem 1.5rem', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF' }}>
        {/* Ambient Glow Orbs */}
        <div style={{ position: 'absolute', top: '-80px', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,102,255,0.3) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,102,255,0.2)', border: '1px solid rgba(0,102,255,0.4)', color: '#60A5FA', padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '700', marginBottom: '1.25rem' }}>
              <Sparkles size={15} color="#60A5FA" /> Premier Digital Healthcare Platform
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: '850', lineHeight: '1.15', marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
              Your Health, Our Priority.<br />
              <span style={{ background: 'linear-gradient(90deg, #60A5FA 0%, #34D399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Book Top Specialists Online.
              </span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '560px' }}>
              Connect with certified doctors, manage appointments, access live OPD queue tokens, and receive digital e-prescriptions seamlessly from anywhere.
            </p>

            {/* Quick Hero Doctor Search Box */}
            <div style={{ background: '#FFFFFF', padding: '0.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', maxWidth: '560px', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, paddingLeft: '0.75rem', color: '#0F172A' }}>
                <Search size={20} color="#0066FF" />
                <input
                  type="text"
                  placeholder="Search doctor, condition, or specialty..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.92rem', fontFamily: 'inherit', color: '#0F172A', background: 'transparent' }}
                />
              </div>

              <a href="#doctors" className="btn btn-primary" style={{ borderRadius: '12px', padding: '0.75rem 1.5rem', fontSize: '0.88rem', fontWeight: '700', textDecoration: 'none' }}>
                Find Doctor
              </a>
            </div>

            {/* Trust Stats Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '560px' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '850', color: '#FFFFFF' }}>250+</div>
                <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Specialist Doctors</div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '850', color: '#34D399' }}>50+</div>
                <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Medical Specialties</div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '850', color: '#60A5FA' }}>100k+</div>
                <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Happy Patients</div>
              </div>
            </div>
          </div>

          {/* Hero Banner Feature Card */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
                  alt="Doctor"
                  style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #0066FF' }}
                />
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>Dr. Amit Verma</div>
                  <div style={{ fontSize: '0.85rem', color: '#60A5FA', fontWeight: '600' }}>Senior Cardiologist</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#F59E0B', marginTop: '0.2rem' }}>
                    <Star size={14} fill="#F59E0B" color="#F59E0B" /> 4.9 (210 Patient Reviews)
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <span>Next Available Slot:</span>
                  <strong style={{ color: '#34D399' }}>Today, 10:30 AM</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <span>Consultation Fee:</span>
                  <strong style={{ color: '#FFFFFF' }}>₹800</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <span>OPD Queue Wait Time:</span>
                  <strong style={{ color: '#60A5FA' }}>~12 Mins</strong>
                </div>
              </div>

              <button
                onClick={() => handleBookDoctorClick(defaultDoctors[0])}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '14px', padding: '0.85rem', fontWeight: '800', fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(0,102,255,0.4)' }}
              >
                Book Instant Appointment <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🏥 CLINICAL SPECIALTIES / DEPARTMENTS */}
      <section id="departments" style={{ padding: '5rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: '#0066FF', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Comprehensive Care</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '850', color: '#0F172A', marginTop: '0.35rem' }}>Explore Clinical Specialties</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '580px', margin: '0.5rem auto 0 auto' }}>
            We offer multi-specialty healthcare services backed by modern diagnostic labs and experienced doctor teams.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {(departmentsList.length > 0 ? departmentsList : defaultDepartments).map((dept, i) => {
            const IconComponent = dept.icon || Building2;
            return (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedDepartment(dept.name);
                  const el = document.getElementById('doctors');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="dept-hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: dept.bg || '#EFF6FF', color: dept.color || '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComponent size={26} />
                  </div>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '700' }}>
                    {dept.count || 'Active Dept'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>{dept.name}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1.25rem' }}>{dept.desc || dept.description || 'Specialized diagnostic and consultation services.'}</p>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0066FF', fontWeight: '800', fontSize: '0.85rem' }}>
                  Find Doctors in {dept.name} <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 👨‍⚕️ FIND DOCTORS & DIRECT BOOKING */}
      <section id="doctors" style={{ padding: '5rem 1.5rem', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ color: '#0066FF', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Verified Specialists</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '850', color: '#0F172A', marginTop: '0.35rem' }}>Find & Book Specialist Doctors</h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem' }}>View doctor availability, consultation fees, and book online instant appointments</p>
            </div>

            {/* Department Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {['All', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'General Medicine'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  style={{
                    background: selectedDepartment === dept ? '#0066FF' : '#F8FAFC',
                    color: selectedDepartment === dept ? '#FFFFFF' : '#475569',
                    border: '1px solid',
                    borderColor: selectedDepartment === dept ? '#0066FF' : '#E2E8F0',
                    padding: '0.45rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
            {filteredDoctors.map((doc) => (
              <div
                key={doc._id || doc.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  padding: '1.5rem',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                    <img
                      src={doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}
                      alt={doc.name}
                      style={{ width: '80px', height: '80px', borderRadius: '18px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                    />
                    <div>
                      <span style={{ background: '#EFF6FF', color: '#0066FF', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                        {doc.specialization}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#0F172A', margin: '0.35rem 0 0.15rem 0' }}>{doc.name}</h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>{doc.qualification || 'MBBS, MD'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '700', marginTop: '0.2rem' }}>{doc.experience || '10+ Years Experience'}</div>
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.85rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem', border: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Rating</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={14} fill="#F59E0B" color="#F59E0B" /> {doc.rating || '4.9'} ({doc.reviewsCount || '150'})
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Consultation Fee</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '850', color: '#0066FF' }}>{doc.fee || '₹500'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#475569', marginBottom: '1rem', fontWeight: '600' }}>
                    <Clock size={14} color="#10B981" /> Daily Timings: <strong>{doc.timing || '10:00 AM - 04:00 PM'}</strong>
                  </div>

                  <button
                    onClick={() => handleBookDoctorClick(doc)}
                    className="btn btn-primary"
                    style={{ width: '100%', borderRadius: '12px', padding: '0.75rem', fontWeight: '800', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,102,255,0.3)' }}
                  >
                    <Calendar size={16} /> Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 💡 WHY CHOOSE US / DIGITAL PATIENT SERVICES */}
      <section id="services" style={{ padding: '5rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ color: '#0066FF', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Smart Healthcare</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '850', color: '#0F172A', marginTop: '0.35rem' }}>Why Patients Choose DocAdmin CareSync</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: '580px', margin: '0.5rem auto 0 auto' }}>
            Integrated digital health services designed for fast appointments, zero waiting time, and hassle-free consultations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Activity size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>Live OPD Token Queue</h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Track live waiting room token numbers directly on your phone so you never have to sit in crowded waiting areas.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <FileSpreadsheet size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>Digital E-Prescriptions</h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Receive electronic prescriptions instantly after consultation and auto-send medicine orders to DocAdmin Pharmacy.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F3E8FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Video size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>HD Teleconsultation</h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Connect with top medical specialists via secure HD video consultation from the comfort of your home.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>Online Lab Diagnostics</h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Book home blood sample collection and download verified pathology and radiology diagnostic reports online.
            </p>
          </div>

        </div>
      </section>

      {/* ⭐ PATIENT TESTIMONIALS */}
      <section id="reviews" style={{ padding: '5rem 1.5rem', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#0066FF', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Patient Feedback</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '850', color: '#0F172A', marginTop: '0.35rem' }}>What Our Patients Say</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            
            <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '0.2rem', color: '#F59E0B', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="#F59E0B" />)}
              </div>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                "Booking an appointment with Dr. Amit Verma was so effortless. The live token queue feature saved me hours of waiting in the OPD lounge!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Patient" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem' }}>Rohan Mehra</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Verified Patient • Cardiology</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '0.2rem', color: '#F59E0B', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="#F59E0B" />)}
              </div>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                "Digital E-Prescription feature is super handy. After consultation with Dr. Neha Singh, the medicines were directly delivered to my home."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Patient" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem' }}>Ananya Iyer</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Verified Patient • Dermatology</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '0.2rem', color: '#F59E0B', marginBottom: '1rem' }}>
                {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill="#F59E0B" />)}
              </div>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                "Very professional pediatric care for my child. Highly recommend Dr. Pooja Sharma and the CareSync hospital staff!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Patient" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem' }}>Sunita Deshmukh</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Verified Patient • Pediatrics</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 📞 FOOTER & CONTACT */}
      <footer id="contact" style={{ background: '#0F172A', color: '#FFFFFF', padding: '4rem 1.5rem 2rem 1.5rem', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#0066FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartPulse size={22} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: '850', letterSpacing: '-0.02em' }}>DocAdmin CareSync</span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Next-generation hospital appointment system & patient consultation platform.
            </p>
            <div style={{ color: '#F43F5E', fontWeight: '800', fontSize: '0.95rem' }}>
              Helpline: 1800-CARE-SYNC
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: '#FFFFFF' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#94A3B8' }}>
              <li><a href="#home" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</a></li>
              <li><a href="#doctors" style={{ color: '#94A3B8', textDecoration: 'none' }}>Find Doctors</a></li>
              <li><a href="#departments" style={{ color: '#94A3B8', textDecoration: 'none' }}>Specialties</a></li>
              <li><a href="#services" style={{ color: '#94A3B8', textDecoration: 'none' }}>Digital Services</a></li>
              <li><Link to="/login" style={{ color: '#60A5FA', textDecoration: 'none', fontWeight: '700' }}>Staff / Doctor Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: '#FFFFFF' }}>Clinical Specialties</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#94A3B8' }}>
              <li>Cardiology & Heart Care</li>
              <li>Dermatology & Cosmetology</li>
              <li>Orthopedics & Joint Care</li>
              <li>Pediatrics & Newborn Care</li>
              <li>Neurology & Spine Surgery</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: '#FFFFFF' }}>Hospital Location</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              CareSync Healthcare Super-Specialty Hospital, Sector 62, Metro City, Delhi NCR
            </p>
            <div style={{ color: '#34D399', fontSize: '0.85rem', fontWeight: '700' }}>
              Email: support@caresync.com
            </div>
          </div>

        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '2rem', borderTop: '1px solid #1E293B', textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
          © {new Date().getFullYear()} DocAdmin CareSync Hospital System. All rights reserved.
        </div>
      </footer>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoctor(null);
        }}
        preselectedDoctor={selectedDoctor}
        onBookingSuccess={() => alert('Appointment booked successfully! You will receive an SMS confirmation.')}
      />
    </div>
  );
};

export default PublicWebsite;
