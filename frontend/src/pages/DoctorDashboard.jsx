import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../services/api';
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
  PlusCircle
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
    totalRevenue: '₹1,24,560'
  });

  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await appointmentApi.getDashboardStats();
      const appRes = await appointmentApi.getAllAppointments();

      const liveApps = appRes.data?.appointments || [];
      setAppointments(liveApps);

      if (statsRes.data?.success && statsRes.data.stats) {
        setStats(statsRes.data.stats);
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
          totalDoctors: 1,
          totalPatients: new Set(liveApps.map(a => a.user?.id || a.user?._id || a.user?.name || a.user)).size || 1,
          completedAppointments: completedCount,
          cancelledAppointments: cancelledCount,
          totalRevenue: `₹${totalRevenueVal.toLocaleString('en-IN')}`
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    }
  };

  const metricsData = [
    { title: 'Total Appointments', value: stats.totalAppointments, trend: '12.5%', isUp: true, icon: Calendar, cardBg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '#BFDBFE', iconBg: '#0066FF', valColor: '#1E40AF', labelColor: '#3B82F6' },
    { title: "Today's Appointments", value: stats.todayAppointments, trend: '8.4%', isUp: true, icon: Clock, cardBg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '#A7F3D0', iconBg: '#10B981', valColor: '#065F46', labelColor: '#059669' },
    { title: 'Pending Appointments', value: stats.pendingAppointments, trend: '3.2%', isUp: false, icon: Hourglass, cardBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', border: '#FDE68A', iconBg: '#F59E0B', valColor: '#92400E', labelColor: '#D97706' },
    { title: 'Total Doctors', value: stats.totalDoctors, trend: '4.7%', isUp: true, icon: UserCheck, cardBg: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)', border: '#DDD6FE', iconBg: '#8B5CF6', valColor: '#6B21A8', labelColor: '#7C3AED' },
    { title: 'Total Patients', value: stats.totalPatients, trend: '10.3%', isUp: true, icon: Users, cardBg: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)', border: '#FECDD3', iconBg: '#F43F5E', valColor: '#9F1239', labelColor: '#E11D48' },
    { title: 'Completed Appointments', value: stats.completedAppointments, trend: '15.6%', isUp: true, icon: CheckCircle2, cardBg: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', border: '#BAE6FD', iconBg: '#06B6D4', valColor: '#075985', labelColor: '#0284C7' },
    { title: 'Cancelled Appointments', value: stats.cancelledAppointments, trend: '2.1%', isUp: false, icon: XCircle, cardBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', border: '#FECACA', iconBg: '#EF4444', valColor: '#991B1B', labelColor: '#DC2626' },
    { title: 'Total Revenue', value: stats.totalRevenue, trend: '18.6%', isUp: true, icon: DollarSign, cardBg: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)', border: '#FEF08A', iconBg: '#D97706', valColor: '#854D0E', labelColor: '#B45309' },
  ];

  const screenshotPatients = [
    { id: 1, patient: 'Rahul Sharma', doctor: 'Dr. Amit Verma', dept: 'Cardiologist', time: '21 Aug 10:00 AM', status: 'Confirmed', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { id: 2, patient: 'Priya Patel', doctor: 'Dr. Neha Singh', dept: 'Dermatologist', time: '21 Aug 11:30 AM', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { id: 3, patient: 'Karan Mehta', doctor: 'Dr. Rahul Gupta', dept: 'Orthopedic', time: '21 Aug 12:00 PM', status: 'Confirmed', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    { id: 4, patient: 'Simran Kaur', doctor: 'Dr. Pooja Sharma', dept: 'Gynecologist', time: '21 Aug 02:00 PM', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { id: 5, patient: 'Arjun Singh', doctor: 'Dr. Vivek Malhotra', dept: 'Neurologist', time: '21 Aug 04:30 PM', status: 'Cancelled', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80' },
  ];

  const recentList = appointments.length > 0 ? appointments.slice(0, 5).map((app, idx) => ({
    id: app._id,
    patient: app.user?.name || 'Patient',
    doctor: app.doctorName || 'Dr. Specialist',
    dept: app.specialization || 'General',
    time: `${app.date || 'Today'} ${app.timeSlot || ''}`,
    status: app.status === 'confirmed' ? 'Confirmed' : app.status === 'cancelled' ? 'Cancelled' : 'Pending',
    avatar: `https://images.unsplash.com/photo-${1500000000000 + idx}?w=100&auto=format&fit=crop&q=80`
  })) : screenshotPatients;

  const totalVal = Number(stats.totalAppointments) || appointments.length || 0;
  const completedVal = Number(stats.completedAppointments) || appointments.filter(a => a.status === 'completed').length || 0;
  const cancelledVal = Number(stats.cancelledAppointments) || appointments.filter(a => a.status === 'cancelled').length || 0;

  const maxVal = Math.max(totalVal, completedVal, cancelledVal, 4);

  const getYCoord = (val) => {
    const ratio = Math.min(val / maxVal, 1);
    return 120 - Math.round(ratio * 95);
  };

  const yTotal = getYCoord(totalVal);
  const yComp = getYCoord(completedVal);
  const yCanc = getYCoord(cancelledVal);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '0.75rem' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.1rem' }}>
            Welcome back, {user?.name || 'Swati Verma'} 👋
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.82rem' }}>
            Here's what happening with your system today.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '0.4rem 0.85rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Calendar size={15} color="#0066FF" />
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm" style={{ padding: '0.45rem 0.85rem' }}>
            <PlusCircle size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {/* 8 COMPACT Metric Cards Grid */}
      <div className="metrics-grid-8">
        {metricsData.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="doc-metric-card" style={{ background: m.cardBg, borderColor: m.border }}>
              <div className="doc-metric-header">
                <div className="doc-metric-icon" style={{ background: m.iconBg, color: '#FFFFFF' }}>
                  <Icon size={18} />
                </div>
                <div className={`doc-trend-tag ${m.isUp ? 'up' : 'down'}`} style={{ background: '#FFFFFF', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  {m.isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  <span style={{ fontSize: '0.7rem' }}>{m.trend}</span>
                </div>
              </div>

              <div>
                <div className="doc-metric-label" style={{ color: m.labelColor }}>{m.title}</div>
                <div className="doc-metric-val" style={{ color: m.valColor }}>{m.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle 2 Column Grid */}
      <div className="dashboard-doc-grid" style={{ flex: 1 }}>
        {/* Appointments Overview Multi-line Chart */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="card-header-flex" style={{ marginBottom: '0.5rem' }}>
            <h2 className="card-title" style={{ fontSize: '1rem' }}>Appointments Overview</h2>
            <select className="filter-select" defaultValue="This Month" style={{ padding: '0.25rem 1.5rem 0.25rem 0.6rem', fontSize: '0.78rem' }}>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
            </select>
          </div>

          {/* Spline Line Chart SVG */}
          <div style={{ position: 'relative', height: '170px' }}>
            <svg width="100%" height="140" viewBox="0 0 500 140" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <line x1="35" y1="15" x2="480" y2="15" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="35" y1="50" x2="480" y2="50" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="35" y1="85" x2="480" y2="85" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="35" y1="120" x2="480" y2="120" stroke="#F1F5F9" strokeWidth="1" />

              <text x="28" y="18" fill="#94A3B8" fontSize="10" textAnchor="end">{maxVal}</text>
              <text x="28" y="53" fill="#94A3B8" fontSize="10" textAnchor="end">{Math.round(maxVal * 0.75)}</text>
              <text x="28" y="88" fill="#94A3B8" fontSize="10" textAnchor="end">{Math.round(maxVal * 0.5)}</text>
              <text x="28" y="123" fill="#94A3B8" fontSize="10" textAnchor="end">{Math.round(maxVal * 0.25)}</text>

              {/* Total Appointments Spline (Blue) */}
              <path d={`M 45 120 Q 115 ${yTotal - 5} 185 ${yTotal} T 325 ${yTotal} T 465 ${yTotal}`} fill="none" stroke="#0066FF" strokeWidth="2.5" />
              <circle cx="45" cy="120" r="3.5" fill="#0066FF" />
              <circle cx="185" cy={yTotal} r="3.5" fill="#0066FF" />
              <circle cx="325" cy={yTotal} r="3.5" fill="#0066FF" />
              <circle cx="465" cy={yTotal} r="3.5" fill="#0066FF" />

              {/* Completed Appointments Spline (Green) */}
              <path d={`M 45 122 Q 115 ${yComp} 185 ${yComp} T 325 ${yComp} T 465 ${yComp}`} fill="none" stroke="#10B981" strokeWidth="2" />
              <circle cx="45" cy="122" r="3" fill="#10B981" />
              <circle cx="185" cy={yComp} r="3" fill="#10B981" />
              <circle cx="325" cy={yComp} r="3" fill="#10B981" />
              <circle cx="465" cy={yComp} r="3" fill="#10B981" />

              {/* Cancelled Appointments Spline (Red) */}
              <path d={`M 45 124 Q 115 ${yCanc} 185 ${yCanc} T 325 ${yCanc} T 465 ${yCanc}`} fill="none" stroke="#F43F5E" strokeWidth="2" />
              <circle cx="45" cy="124" r="3" fill="#F43F5E" />
              <circle cx="185" cy={yCanc} r="3" fill="#F43F5E" />
              <circle cx="325" cy={yCanc} r="3" fill="#F43F5E" />
              <circle cx="465" cy={yCanc} r="3" fill="#F43F5E" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '30px', paddingRight: '10px', fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.1rem' }}>
              <span>1 Aug</span>
              <span>5 Aug</span>
              <span>10 Aug</span>
              <span>15 Aug</span>
              <span>20 Aug</span>
              <span>25 Aug</span>
              <span>31 Aug</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', paddingLeft: '1.5rem', fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#0066FF', borderRadius: '50%' }} /> Total
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }} /> Completed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#F43F5E', borderRadius: '50%' }} /> Cancelled
            </span>
          </div>
        </div>

        {/* Recent Appointments Table Card */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="card-header-flex" style={{ marginBottom: '0.5rem' }}>
            <h2 className="card-title" style={{ fontSize: '1rem' }}>Recent Appointments</h2>
            <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>View All</button>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ padding: '0.4rem 0.6rem' }}>Patient</th>
                  <th style={{ padding: '0.4rem 0.6rem' }}>Doctor</th>
                  <th style={{ padding: '0.4rem 0.6rem' }}>Date & Time</th>
                  <th style={{ padding: '0.4rem 0.6rem' }}>Status</th>
                  <th style={{ padding: '0.4rem 0.6rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {recentList.map((row) => (
                  <tr key={row.id}>
                    <td style={{ padding: '0.45rem 0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={row.avatar} alt={row.patient} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.82rem' }}>{row.patient}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.45rem 0.6rem' }}>
                      <div style={{ lineHeight: '1.2' }}>
                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.82rem' }}>{row.doctor}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{row.dept}</div>
                      </div>
                    </td>
                    <td style={{ padding: '0.45rem 0.6rem', color: '#475569', fontSize: '0.78rem', fontWeight: '500' }}>
                      {row.time}
                    </td>
                    <td style={{ padding: '0.45rem 0.6rem' }}>
                      <span className={`doc-badge ${row.status === 'Confirmed' ? 'confirmed' : row.status === 'Cancelled' ? 'cancelled' : 'pending'}`} style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.45rem 0.6rem' }}>
                      <MoreVertical size={14} color="#94A3B8" style={{ cursor: 'pointer' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default DoctorDashboard;
