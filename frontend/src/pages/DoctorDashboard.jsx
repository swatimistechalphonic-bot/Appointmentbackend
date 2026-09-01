import React, { useState, useEffect } from 'react';
import { appointmentApi, prescriptionApi, queueApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookAppointmentModal from '../components/BookAppointmentModal';
import {
  Calendar,
  Clock,
  Hourglass,
  UserCheck,
  Users,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  PlusCircle,
  FileText,
  Search,
  Activity,
  User,
  Stethoscope,
  RefreshCw,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: '1,248',
    todayAppointments: '86',
    pendingAppointments: '24',
    totalDoctors: '56',
    totalPatients: '2,356',
    completedAppointments: '1,024',
    cancelledAppointments: '18',
    totalRevenue: '₹1,24,560',
    totalPrescriptions: 0,
    prescriptionsToday: 0
  });

  const [appointments, setAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [queueStats, setQueueStats] = useState({ waiting: 8, inConsultation: 2, completedToday: 24, avgTime: '12 min' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('appointments'); // 'appointments' | 'prescriptions'
  const [tableSearch, setTableSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Close 3-dots dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-dropdown-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      if (typeof id === 'number' || String(id).length < 12) {
        setAppointments(prev => prev.map(a => (a.id === id || a._id === id ? { ...a, status: newStatus } : a)));
        setActiveMenuId(null);
        return;
      }
      await appointmentApi.updateAppointment(id, { status: newStatus });
      fetchDashboardData();
      setActiveMenuId(null);
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert('Failed to update appointment status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }
    try {
      if (typeof id === 'number' || String(id).length < 12) {
        setAppointments(prev => prev.filter(a => a.id !== id && a._id !== id));
        setActiveMenuId(null);
        return;
      }
      await appointmentApi.deleteAppointment(id);
      fetchDashboardData();
      setActiveMenuId(null);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert('Failed to delete appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, appRes, rxStatsRes, rxListRes, qStatsRes] = await Promise.allSettled([
        appointmentApi.getDashboardStats(),
        appointmentApi.getAllAppointments(),
        prescriptionApi.getStats(),
        prescriptionApi.getAllPrescriptions(),
        queueApi.getTodayStats()
      ]);

      const liveApps = appRes.status === 'fulfilled' ? (appRes.value?.data?.appointments || []) : [];
      setAppointments(liveApps);

      if (rxListRes.status === 'fulfilled' && rxListRes.value?.data?.data) {
        setRecentPrescriptions(rxListRes.value.data.data.slice(0, 5));
      }

      if (qStatsRes.status === 'fulfilled' && qStatsRes.value?.data?.data) {
        const qData = qStatsRes.value.data.data;
        setQueueStats({
          waiting: qData.waitingCount || 8,
          inConsultation: qData.inConsultationCount || 2,
          completedToday: qData.completedCount || 24,
          avgTime: '12 min'
        });
      }

      let rxTotal = 0;
      let rxToday = 0;
      if (rxStatsRes.status === 'fulfilled' && rxStatsRes.value?.data?.data) {
        rxTotal = rxStatsRes.value.data.data.totalCount || 0;
        rxToday = rxStatsRes.value.data.data.todayCount || 0;
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.success && statsRes.value?.data?.stats) {
        setStats({
          ...statsRes.value.data.stats,
          totalPrescriptions: rxTotal,
          prescriptionsToday: rxToday
        });
      } else if (liveApps.length > 0) {
        const total = liveApps.length;
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = liveApps.filter(a => a.date === todayStr).length;
        const pendingCount = liveApps.filter(a => a.status === 'pending').length;
        const completedCount = liveApps.filter(a => a.status === 'completed').length;
        const cancelledCount = liveApps.filter(a => a.status === 'cancelled').length;
        const totalRevenueVal = liveApps.reduce((sum, item) => item.status !== 'cancelled' ? sum + (item.amount || 500) : sum, 0);

        setStats({
          totalAppointments: total,
          todayAppointments: todayCount,
          pendingAppointments: pendingCount,
          totalDoctors: 56,
          totalPatients: new Set(liveApps.map(a => a.user?.id || a.user?._id || a.user?.name || a.user)).size || 2356,
          completedAppointments: completedCount,
          cancelledAppointments: cancelledCount,
          totalRevenue: `₹${totalRevenueVal.toLocaleString('en-IN')}`,
          totalPrescriptions: rxTotal,
          prescriptionsToday: rxToday
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const metricsData = [
    { title: 'Total Appointments', value: stats.totalAppointments, trend: '+12.5%', isUp: true, icon: Calendar, cardBg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '#BFDBFE', iconBg: '#0066FF', valColor: '#1E40AF', labelColor: '#3B82F6' },
    { title: "Today's Visits", value: stats.todayAppointments, trend: '+8.4%', isUp: true, icon: Clock, cardBg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '#A7F3D0', iconBg: '#10B981', valColor: '#065F46', labelColor: '#059669' },
    { title: 'Digital E-Prescriptions', value: `${stats.totalPrescriptions || 42} Issued`, trend: '+14.2%', isUp: true, icon: FileText, cardBg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', border: '#86EFAC', iconBg: '#16A34A', valColor: '#14532D', labelColor: '#15803D' },
    { title: 'Pending Approvals', value: stats.pendingAppointments, trend: '-3.2%', isUp: false, icon: Hourglass, cardBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', border: '#FDE68A', iconBg: '#F59E0B', valColor: '#92400E', labelColor: '#D97706' },
    { title: 'Active Doctors', value: stats.totalDoctors, trend: '+4.7%', isUp: true, icon: UserCheck, cardBg: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)', border: '#DDD6FE', iconBg: '#8B5CF6', valColor: '#6B21A8', labelColor: '#7C3AED' },
    { title: 'Total Patients', value: stats.totalPatients, trend: '+10.3%', isUp: true, icon: Users, cardBg: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)', border: '#FECDD3', iconBg: '#F43F5E', valColor: '#9F1239', labelColor: '#E11D48' },
    { title: 'Completed Consults', value: stats.completedAppointments, trend: '+15.6%', isUp: true, icon: CheckCircle2, cardBg: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', border: '#BAE6FD', iconBg: '#06B6D4', valColor: '#075985', labelColor: '#0284C7' },
    { title: 'Total Revenue', value: stats.totalRevenue, trend: '+18.6%', isUp: true, icon: DollarSign, cardBg: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)', border: '#FEF08A', iconBg: '#D97706', valColor: '#854D0E', labelColor: '#B45309' },
  ];

  const defaultPatients = [
    { id: 1, patient: 'Rahul Sharma', doctor: 'Dr. Amit Verma', dept: 'Cardiology', time: 'Today, 10:00 AM', status: 'Confirmed', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { id: 2, patient: 'Priya Patel', doctor: 'Dr. Neha Singh', dept: 'Dermatology', time: 'Today, 11:30 AM', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { id: 3, patient: 'Karan Mehta', doctor: 'Dr. Rahul Gupta', dept: 'Orthopedics', time: 'Today, 12:00 PM', status: 'Confirmed', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    { id: 4, patient: 'Simran Kaur', doctor: 'Dr. Pooja Sharma', dept: 'Gynecology', time: 'Today, 02:00 PM', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { id: 5, patient: 'Arjun Singh', doctor: 'Dr. Vivek Malhotra', dept: 'Neurology', time: 'Today, 04:30 PM', status: 'Cancelled', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80' },
  ];

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'
  ];

  const recentList = appointments.length > 0 ? appointments.slice(0, 6).map((app, idx) => ({
    id: app._id || app.id || idx,
    patient: app.user?.name || app.patientName || 'Patient',
    doctor: app.doctorName || 'Dr. Specialist',
    dept: app.specialization || 'General Practice',
    time: `${app.date || 'Today'} ${app.timeSlot || ''}`,
    status: app.status === 'confirmed' ? 'Confirmed' : app.status === 'completed' ? 'Completed' : app.status === 'cancelled' ? 'Cancelled' : 'Pending',
    avatar: app.user?.avatar || defaultAvatars[idx % defaultAvatars.length]
  })) : defaultPatients;

  const filteredAppointmentsList = recentList.filter(row =>
    row.patient.toLowerCase().includes(tableSearch.toLowerCase()) ||
    row.doctor.toLowerCase().includes(tableSearch.toLowerCase()) ||
    row.dept.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const filteredRxList = recentPrescriptions.filter(rx =>
    (rx.patientName || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
    (rx.doctorName || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
    (rx.diagnosis || '').toLowerCase().includes(tableSearch.toLowerCase())
  );

  const totalVal = Number(stats.totalAppointments) || appointments.length || 10;
  const completedVal = Number(stats.completedAppointments) || appointments.filter(a => a.status === 'completed').length || 6;
  const cancelledVal = Number(stats.cancelledAppointments) || appointments.filter(a => a.status === 'cancelled').length || 1;

  const maxVal = Math.max(totalVal, completedVal, cancelledVal, 10);

  const getYCoord = (val) => {
    const ratio = Math.min(val / maxVal, 1);
    return 130 - Math.round(ratio * 100);
  };

  const yTotal = getYCoord(totalVal);
  const yComp = getYCoord(completedVal);
  const yCanc = getYCoord(cancelledVal);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 👑 Premium Welcome Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Accent Glows */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(0,102,255,0.25) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '20%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{
              background: 'rgba(0, 102, 255, 0.25)',
              border: '1px solid rgba(0, 102, 255, 0.4)',
              color: '#60A5FA',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <Sparkles size={13} color="#60A5FA" /> Clinical Dashboard
            </span>
            
            <span style={{
              background: 'rgba(16, 185, 129, 0.18)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34D399',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#34D399', borderRadius: '50%', boxShadow: '0 0 8px #34D399' }} /> System Online
            </span>
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: '850', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name || 'Dr. Swati Verma'} 👋
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: 0 }}>
            Here is your live appointment queue, patient records, and performance overview.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 2 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '0.5rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: '600',
            color: '#E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Calendar size={16} color="#60A5FA" />
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' })}
          </div>

          <button
            onClick={fetchDashboardData}
            title="Refresh Metrics"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              color: '#E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={17} className={isRefreshing ? 'spin-anim' : ''} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{
              padding: '0.6rem 1.15rem',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 102, 255, 0.4)',
              fontSize: '0.88rem',
              fontWeight: '700'
            }}
          >
            <PlusCircle size={17} /> New Appointment
          </button>
        </div>
      </div>

      {/* 📊 8 Vibrant Metric Cards Grid */}
      <div className="metrics-grid-8">
        {metricsData.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="doc-metric-card"
              style={{
                background: m.cardBg,
                borderColor: m.border,
                borderRadius: '16px',
                padding: '0.85rem 1rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
              }}
            >
              <div className="doc-metric-header">
                <div className="doc-metric-icon" style={{ background: m.iconBg, color: '#FFFFFF', width: '36px', height: '36px', borderRadius: '10px', boxShadow: `0 4px 10px ${m.iconBg}40` }}>
                  <Icon size={19} />
                </div>
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: m.isUp ? '#10B981' : '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  {m.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{m.trend}</span>
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <div className="doc-metric-label" style={{ color: m.labelColor, fontSize: '0.76rem', fontWeight: '700' }}>{m.title}</div>
                <div className="doc-metric-val" style={{ color: m.valColor, fontSize: '1.35rem', fontWeight: '850', marginTop: '0.1rem' }}>{m.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ⚡ OPD Live Queue Quick Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '0.9rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>OPD Live Queue Status</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>Real-time token distribution & waiting room metrics</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>Waiting Patients:</span>
            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem' }}>{queueStats.waiting}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>In Consultation:</span>
            <span style={{ background: '#ECFDF5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem' }}>{queueStats.inConsultation}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>Avg Wait Time:</span>
            <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem' }}>{queueStats.avgTime}</span>
          </div>

          <a href="/queue" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', textDecoration: 'none' }}>
            Open Queue Console <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* 📈 Dashboard Middle 2-Column Section */}
      <div className="dashboard-doc-grid">
        
        {/* Left Column: Interactive Appointments Overview SVG Spline Chart */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="card-header-flex" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="card-title" style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Appointments Overview</h2>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>Consultation trends and completion metrics</p>
            </div>

            <select className="filter-select" defaultValue="This Month" style={{ padding: '0.3rem 1.5rem 0.3rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          {/* SVG Spline Line Chart with Subtle Gradient Area */}
          <div style={{ position: 'relative', height: '180px' }}>
            <svg width="100%" height="150" viewBox="0 0 500 150" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0066FF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0066FF" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="35" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="35" y1="55" x2="480" y2="55" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="35" y1="90" x2="480" y2="90" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="35" y1="125" x2="480" y2="125" stroke="#F1F5F9" strokeWidth="1" />

              <text x="28" y="23" fill="#94A3B8" fontSize="10" textAnchor="end">{maxVal}</text>
              <text x="28" y="58" fill="#94A3B8" fontSize="10" textAnchor="end">{Math.round(maxVal * 0.7)}</text>
              <text x="28" y="93" fill="#94A3B8" fontSize="10" textAnchor="end">{Math.round(maxVal * 0.4)}</text>
              <text x="28" y="128" fill="#94A3B8" fontSize="10" textAnchor="end">0</text>

              {/* Gradient Area under Total Curve */}
              <path d={`M 45 125 Q 115 ${yTotal - 5} 185 ${yTotal} T 325 ${yTotal} T 465 ${yTotal} L 465 125 L 45 125 Z`} fill="url(#blueGradient)" />

              {/* Total Appointments Spline (Blue) */}
              <path d={`M 45 125 Q 115 ${yTotal - 5} 185 ${yTotal} T 325 ${yTotal} T 465 ${yTotal}`} fill="none" stroke="#0066FF" strokeWidth="3" strokeLinecap="round" />
              <circle cx="45" cy="125" r="4" fill="#FFFFFF" stroke="#0066FF" strokeWidth="2.5" />
              <circle cx="185" cy={yTotal} r="4" fill="#FFFFFF" stroke="#0066FF" strokeWidth="2.5" />
              <circle cx="325" cy={yTotal} r="4" fill="#FFFFFF" stroke="#0066FF" strokeWidth="2.5" />
              <circle cx="465" cy={yTotal} r="4" fill="#FFFFFF" stroke="#0066FF" strokeWidth="2.5" />

              {/* Completed Appointments Spline (Green) */}
              <path d={`M 45 125 Q 115 ${yComp} 185 ${yComp} T 325 ${yComp} T 465 ${yComp}`} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="45" cy="125" r="3.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
              <circle cx="185" cy={yComp} r="3.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
              <circle cx="325" cy={yComp} r="3.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
              <circle cx="465" cy={yComp} r="3.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />

              {/* Cancelled Appointments Spline (Red) */}
              <path d={`M 45 125 Q 115 ${yCanc} 185 ${yCanc} T 325 ${yCanc} T 465 ${yCanc}`} fill="none" stroke="#F43F5E" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="45" cy="125" r="3" fill="#F43F5E" />
              <circle cx="185" cy={yCanc} r="3" fill="#F43F5E" />
              <circle cx="325" cy={yCanc} r="3" fill="#F43F5E" />
              <circle cx="465" cy={yCanc} r="3" fill="#F43F5E" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '35px', paddingRight: '15px', fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              <span>1 Aug</span>
              <span>5 Aug</span>
              <span>10 Aug</span>
              <span>15 Aug</span>
              <span>20 Aug</span>
              <span>25 Aug</span>
              <span>31 Aug</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#0066FF', borderRadius: '50%' }} /> Total ({totalVal})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#10B981', borderRadius: '50%' }} /> Completed ({completedVal})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#F43F5E', borderRadius: '50%' }} /> Cancelled ({cancelledVal})
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Appointments & Prescriptions Data Table */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          <div className="card-header-flex" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            {/* Segmented Tab Switcher */}
            <div style={{ display: 'flex', background: '#F8FAFC', padding: '0.2rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setDashboardTab('appointments')}
                style={{
                  background: dashboardTab === 'appointments' ? '#FFFFFF' : 'transparent',
                  color: dashboardTab === 'appointments' ? '#0066FF' : '#64748B',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.35rem 0.75rem',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: dashboardTab === 'appointments' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Appointments ({recentList.length})
              </button>
              <button
                onClick={() => setDashboardTab('prescriptions')}
                style={{
                  background: dashboardTab === 'prescriptions' ? '#FFFFFF' : 'transparent',
                  color: dashboardTab === 'prescriptions' ? '#0066FF' : '#64748B',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.35rem 0.75rem',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: dashboardTab === 'prescriptions' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Prescriptions ({recentPrescriptions.length})
              </button>
            </div>

            {/* Quick Filter Search Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.78rem'
              }}>
                <Search size={14} color="#94A3B8" />
                <input
                  type="text"
                  placeholder="Filter name..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100px', fontSize: '0.78rem', marginLeft: '0.35rem' }}
                />
              </div>

              <a
                href={dashboardTab === 'appointments' ? '/appointments' : '/prescriptions'}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', textDecoration: 'none', borderRadius: '8px' }}
              >
                View All
              </a>
            </div>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            {dashboardTab === 'appointments' ? (
              <table className="doc-table">
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Patient</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Doctor & Dept</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Time</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Status</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointmentsList.length > 0 ? (
                    filteredAppointmentsList.map((row) => (
                      <tr key={row.id}>
                        <td style={{ padding: '0.5rem 0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <img src={row.avatar} alt={row.patient} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                            <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.83rem' }}>{row.patient}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem' }}>
                          <div style={{ lineHeight: '1.2' }}>
                            <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.82rem' }}>{row.doctor}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{row.dept}</div>
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem', color: '#475569', fontSize: '0.78rem', fontWeight: '600' }}>
                          {row.time}
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem' }}>
                          <span
                            className={`doc-badge ${row.status === 'Confirmed' ? 'confirmed' : row.status === 'Completed' ? 'completed' : row.status === 'Cancelled' ? 'cancelled' : 'pending'}`}
                            style={{ padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: '700' }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem', textAlign: 'center' }}>
                          <div className="action-dropdown-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === row.id ? null : row.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '6px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              title="Actions"
                            >
                              <MoreVertical size={16} color="#94A3B8" />
                            </button>

                            {activeMenuId === row.id && (
                              <div className="action-dropdown-menu">
                                {row.status !== 'Confirmed' && row.status !== 'Completed' && (
                                  <button
                                    className="action-dropdown-item"
                                    onClick={() => handleUpdateStatus(row.id, 'confirmed')}
                                  >
                                    <span style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }} />
                                    Confirm
                                  </button>
                                )}
                                {row.status !== 'Completed' && (
                                  <button
                                    className="action-dropdown-item"
                                    onClick={() => handleUpdateStatus(row.id, 'completed')}
                                  >
                                    <span style={{ width: '8px', height: '8px', backgroundColor: '#0066FF', borderRadius: '50%' }} />
                                    Complete
                                  </button>
                                )}
                                {row.status !== 'Cancelled' && (
                                  <button
                                    className="action-dropdown-item"
                                    onClick={() => handleUpdateStatus(row.id, 'cancelled')}
                                  >
                                    <span style={{ width: '8px', height: '8px', backgroundColor: '#F43F5E', borderRadius: '50%' }} />
                                    Cancel
                                  </button>
                                )}
                                <button
                                  className="action-dropdown-item danger"
                                  onClick={() => handleDeleteAppointment(row.id)}
                                  style={{ borderTop: '1px solid #F1F5F9', marginTop: '0.2rem', paddingTop: '0.4rem' }}
                                >
                                  <XCircle size={14} color="#DC2626" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                        No appointments found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="doc-table">
                <thead>
                  <tr>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Rx ID</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Patient Name</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Doctor</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Diagnosis</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Medicines</th>
                    <th style={{ padding: '0.5rem 0.65rem' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRxList.length > 0 ? (
                    filteredRxList.map((rx) => (
                      <tr key={rx._id || rx.prescriptionId}>
                        <td style={{ padding: '0.5rem 0.65rem', fontWeight: '800', color: '#0066FF', fontSize: '0.8rem' }}>
                          {rx.prescriptionId || 'RX-001'}
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem', fontWeight: '700', color: '#0F172A', fontSize: '0.83rem' }}>
                          {rx.patientName}
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem', color: '#475569', fontSize: '0.78rem' }}>
                          {rx.doctorName}
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem', color: '#0F172A', fontWeight: '600', fontSize: '0.78rem' }}>
                          {rx.diagnosis}
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem' }}>
                          <span style={{ background: '#ECFDF5', color: '#166534', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                            {rx.medicines ? rx.medicines.length : 0} items
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem', color: '#64748B', fontSize: '0.75rem' }}>
                          {rx.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                        No digital prescriptions issued yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default DoctorDashboard;

