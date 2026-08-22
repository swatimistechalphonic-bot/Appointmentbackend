import React, { useState, useEffect } from 'react';
import { reportApi } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  UserCheck,
  CheckCircle2,
  Hourglass,
  XCircle,
  Activity,
  Award,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 5 API Data States
  const [summary, setSummary] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [demographics, setDemographics] = useState({ genderDistribution: [], bloodGroupDistribution: [] });

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, revenueRes, statusRes, doctorRes, demoRes] = await Promise.all([
        reportApi.getAnalytics(),
        reportApi.getRevenueTrends(),
        reportApi.getAppointmentStatusReport(),
        reportApi.getDoctorPerformanceReport(),
        reportApi.getPatientDemographicsReport()
      ]);

      if (analyticsRes.data?.success) setSummary(analyticsRes.data.reportSummary);
      if (revenueRes.data?.success) setRevenueTrends(revenueRes.data.revenueTrends || []);
      if (statusRes.data?.success) setStatusBreakdown(statusRes.data.statusBreakdown || []);
      if (doctorRes.data?.success) setDoctorPerformance(doctorRes.data.doctorPerformance || []);
      if (demoRes.data?.success) setDemographics(demoRes.data.demographics || { genderDistribution: [], bloodGroupDistribution: [] });
    } catch (err) {
      console.error('Fetch Reports Error:', err);
      setError('Failed to load clinical analytics reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)', borderLeft: '5px solid #0066FF' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Reports & Clinical Analytics Dashboard 📊
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
            Real-time medical reports, revenue performance, and patient demographics
          </p>
        </div>

        <button onClick={fetchAllReports} className="btn btn-secondary btn-sm" title="Refresh Reports">
          <RefreshCw size={15} /> Refresh Reports
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          Loading real-time report analytics...
        </div>
      ) : (
        <>
          {/* Section 1: 4 Key Metric Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {/* Total Bookings */}
            <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '1px solid #BFDBFE', borderRadius: '16px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#3B82F6' }}>TOTAL BOOKINGS</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0066FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E40AF' }}>
                {summary?.totalAppointments || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                Completion Rate: <strong style={{ color: '#10B981' }}>{summary?.completionRate || '0%'}</strong>
              </div>
            </div>

            {/* Total Revenue */}
            <div style={{ background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)', border: '1px solid #FEF08A', borderRadius: '16px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#B45309' }}>TOTAL REVENUE</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#D97706', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#854D0E' }}>
                {summary?.totalRevenue || '₹0'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                Active Earnings from visits
              </div>
            </div>

            {/* Total Patients */}
            <div style={{ background: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)', border: '1px solid #FECDD3', borderRadius: '16px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#E11D48' }}>TOTAL PATIENTS</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F43F5E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#9F1239' }}>
                {summary?.totalPatients || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                Registered clinical records
              </div>
            </div>

            {/* Specialist Doctors */}
            <div style={{ background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)', border: '1px solid #DDD6FE', borderRadius: '16px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#7C3AED' }}>SPECIALIST DOCTORS</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#6B21A8' }}>
                {summary?.totalDoctors || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                Active medical staff
              </div>
            </div>
          </div>

          {/* Section 2: 2 Column Grid for Revenue Trends & Appointment Status Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Revenue Trends Card */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#0066FF" />
                Daily Revenue Earnings Report
              </h3>

              {revenueTrends.length === 0 ? (
                <div style={{ color: '#64748B', fontSize: '0.88rem', padding: '1rem 0' }}>No revenue trend data recorded.</div>
              ) : (
                <table className="doc-table" style={{ fontSize: '0.84rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Date</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Consultations</th>
                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueTrends.map((item) => (
                      <tr key={item._id}>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: '700', color: '#0F172A' }}>{item._id}</td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>{item.consultationsCount} Visits</td>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: '800', color: '#10B981', textAlign: 'right' }}>
                          ₹{item.revenue.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Appointment Status Breakdown */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="#0066FF" />
                Appointment Status Distribution
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {statusBreakdown.map((st) => {
                  const statusName = st._id;
                  const count = st.count;
                  const total = summary?.totalAppointments || 1;
                  const pct = ((count / total) * 100).toFixed(0);

                  const bg = statusName === 'completed' ? '#DCFCE7' : statusName === 'pending' ? '#FEF3C7' : '#FEE2E2';
                  const textColor = statusName === 'completed' ? '#166534' : statusName === 'pending' ? '#92400E' : '#991B1B';

                  return (
                    <div key={statusName} style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: '700', color: textColor, fontSize: '0.88rem' }}>
                          {statusName} Bookings
                        </span>
                        <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.88rem' }}>
                          {count} ({pct}%)
                        </span>
                      </div>

                      <div style={{ height: '7px', width: '100%', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: statusName === 'completed' ? '#10B981' : statusName === 'pending' ? '#F59E0B' : '#EF4444', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Doctor Performance Table */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="#0066FF" />
              Doctor Performance & Consultations Report
            </h3>

            {doctorPerformance.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: '0.88rem', padding: '1rem 0' }}>No doctor performance data available.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>Doctor Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Total Consultations</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Completed Visits</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorPerformance.map((doc, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#0F172A' }}>{doc._id || 'Dr. Specialist'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>{doc.totalConsultations} Consultations</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem' }}>
                            {doc.completedVisits} Completed
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0066FF', textAlign: 'right' }}>
                          ₹{doc.totalRevenueGenerated.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 4: Patient Demographics */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={18} color="#0066FF" />
              Patient Demographics Distribution
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Gender Distribution */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#64748B', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  GENDER DISTRIBUTION
                </div>
                {demographics.genderDistribution.map((g) => (
                  <div key={g._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.85rem' }}>{g._id} Patients</span>
                    <span style={{ fontWeight: '800', color: '#0066FF' }}>{g.count}</span>
                  </div>
                ))}
              </div>

              {/* Blood Group Distribution */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ color: '#64748B', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  BLOOD GROUP DISTRIBUTION
                </div>
                {demographics.bloodGroupDistribution.map((bg) => (
                  <div key={bg._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '0.85rem' }}>Group {bg._id}</span>
                    <span style={{ fontWeight: '800', color: '#DC2626', background: '#FEE2E2', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                      {bg.count} Patient
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
