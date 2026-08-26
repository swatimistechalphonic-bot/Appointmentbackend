import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  Play,
  Check,
  User,
  Users,
  Clock,
  CheckCircle2,
  Tv,
  BellRing,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  SkipForward,
  RotateCcw,
  XCircle,
  X,
  Volume2,
  UserPlus
} from 'lucide-react';
import { queueApi, authApi } from '../services/api';

const QueueManagementPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [isTvModalOpen, setIsTvModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    patientName: '',
    patientPhone: '',
    doctorName: '',
    doctorId: '',
    timeSlot: 'Now'
  });
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({
    totalQueue: 0,
    inConsultation: 0,
    waiting: 0,
    completed: 0,
    skipped: 0,
    cancelled: 0
  });
  const refreshIntervalRef = useRef(null);

  // Helper to get local date YYYY-MM-DD
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const showNotification = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
  };

  // Play chime for queue tokens
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  };

  // Fetch doctors list for filtering
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await authApi.getDoctors();
        if (res.data?.doctors?.length > 0) {
          setDoctors(res.data.doctors);
        }
      } catch (e) {}
    };
    fetchDoctors();
  }, []);

  // Fetch all queue data from backend APIs
  const fetchQueueData = async () => {
    try {
      const today = getTodayDateString();
      const params = { date: today };
      if (selectedDoctor) params.doctorId = selectedDoctor;

      // 1. GET /api/queue/today
      // 2. GET /api/queue/today/board
      // 3. GET /api/queue/check-in/today
      // 4. GET /api/queue/current
      const [statsRes, boardRes, checkInRes, currentRes] = await Promise.allSettled([
        queueApi.getTodayStats(params),
        queueApi.getWaitingBoard(params),
        queueApi.getTodayCheckInList(params),
        queueApi.getCurrentConsultation(params)
      ]);

      // Handle stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
        setStats(statsRes.value.data.data);
      }

      // Handle live waiting board
      if (boardRes.status === 'fulfilled' && Array.isArray(boardRes.value?.data?.data)) {
        const boardData = boardRes.value.data.data.map(item => ({
          _id: item._id,
          token: item.token,
          tokenNumber: item.tokenNumber,
          patient: item.patient || item.patientName,
          doctor: item.doctor || item.doctorName,
          status: item.status,
          checkInTime: item.checkInTime || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          priority: item.priority || 'Normal'
        }));
        setQueue(boardData);
      }

      // Handle current consultation
      if (currentRes.status === 'fulfilled' && currentRes.value?.data?.data) {
        const active = currentRes.value.data.data;
        setCurrentCall({
          _id: active._id,
          token: active.token,
          patient: active.patientName || active.patient,
          doctor: active.doctorName || active.doctor,
          status: active.status,
          checkInTime: active.checkInTime
        });
      } else {
        setCurrentCall(null);
      }

      // Handle check-in appointments list
      if (checkInRes.status === 'fulfilled' && Array.isArray(checkInRes.value?.data?.data)) {
        const pendingCheckIns = checkInRes.value.data.data
          .filter(a => !a.isCheckedIn)
          .map(a => ({
            id: a.id || a.appointmentId,
            patient: a.patient,
            patientPhone: a.patientPhone,
            doctor: a.doctor,
            doctorId: a.doctorId,
            time: a.time || '—',
            status: a.status || 'Confirmed'
          }));
        setAppointments(pendingCheckIns);
      }
    } catch (err) {
      console.error('Queue fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    refreshIntervalRef.current = setInterval(fetchQueueData, 8000);
    return () => clearInterval(refreshIntervalRef.current);
  }, [selectedDoctor]);

  // Receptionist: Check-in patient (POST /api/queue/check-in)
  const handleCheckIn = async (app) => {
    try {
      const today = getTodayDateString();
      const payload = {
        appointmentId: app.id,
        patientName: app.patient,
        patientPhone: app.patientPhone || '',
        doctorId: app.doctorId || undefined,
        doctorName: app.doctor || '',
        timeSlot: app.time || '',
        date: today
      };

      const res = await queueApi.checkIn(payload);
      if (res.data?.data) {
        playChime();
        showNotification(`Checked in ${app.patient} with Token ${res.data.data.token}`, 'success');
        fetchQueueData();
      }
    } catch (err) {
      console.error('Check-in error:', err);
      showNotification('Failed to check in patient. Please try again.', 'error');
    }
  };

  // Walk-in Quick Check-In (POST /api/queue/check-in)
  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInForm.patientName.trim()) {
      alert('Please enter patient name');
      return;
    }

    try {
      const today = getTodayDateString();
      const res = await queueApi.checkIn({
        patientName: walkInForm.patientName,
        patientPhone: walkInForm.patientPhone,
        doctorId: walkInForm.doctorId || undefined,
        doctorName: walkInForm.doctorName || 'General Physician',
        timeSlot: walkInForm.timeSlot || 'Walk-in',
        date: today
      });

      if (res.data?.data) {
        playChime();
        showNotification(`Walk-in Token ${res.data.data.token} generated for ${walkInForm.patientName}`, 'success');
        setWalkInForm({ patientName: '', patientPhone: '', doctorName: '', doctorId: '', timeSlot: 'Now' });
        setIsWalkInModalOpen(false);
        fetchQueueData();
      }
    } catch (err) {
      console.error('Walk-in check-in error:', err);
      showNotification('Failed to generate walk-in token', 'error');
    }
  };

  // Doctor calling console: Call next patient (POST /api/queue/call-next)
  const handleCallNext = async () => {
    try {
      const today = getTodayDateString();
      const res = await queueApi.callNext({
        date: today,
        doctorId: selectedDoctor || undefined
      });
      
      if (res.data?.data) {
        const called = res.data.data;
        setCurrentCall({
          _id: called._id,
          token: called.token,
          patient: called.patientName || called.patient,
          doctor: called.doctorName || called.doctor,
          status: 'In Consultation',
          checkInTime: called.checkInTime
        });
        playChime();
        showNotification(`Calling Token ${called.token}: ${called.patientName}`, 'success');
        fetchQueueData();
      }
    } catch (apiErr) {
      const message = apiErr.response?.data?.message || 'No patients currently waiting in the queue!';
      showNotification(message, 'warning');
    }
  };

  // Doctor calling console: Start consultation (POST /api/queue/:id/start)
  const handleStartConsultation = async () => {
    if (!currentCall) return;
    try {
      const targetId = currentCall._id || currentCall.token;
      await queueApi.startConsultation(targetId);
      setCurrentCall(prev => ({ ...prev, status: 'In Consultation' }));
      showNotification(`Consultation started for Token ${currentCall.token}`, 'success');
      fetchQueueData();
    } catch (e) {
      console.error('Start consultation error:', e);
      showNotification('Failed to start consultation', 'error');
    }
  };

  // Doctor calling console: Complete consultation (POST /api/queue/:id/complete)
  const handleCompleteConsultation = async () => {
    if (!currentCall) return;
    try {
      const targetId = currentCall._id || currentCall.token;
      await queueApi.completeConsultation(targetId);
      showNotification(`Consultation completed for Token ${currentCall.token}`, 'success');
      setCurrentCall(null);
      fetchQueueData();
    } catch (e) {
      console.error('Complete consultation error:', e);
      showNotification('Failed to complete consultation', 'error');
    }
  };

  // Table Action: Skip patient (POST /api/queue/:id/skip)
  const handleSkipPatient = async (item) => {
    try {
      const targetId = item._id || item.token;
      await queueApi.skipPatient(targetId);
      showNotification(`Token ${item.token} skipped`, 'warning');
      if (currentCall && (currentCall._id === item._id || currentCall.token === item.token)) {
        setCurrentCall(null);
      }
      fetchQueueData();
    } catch (e) {
      console.error('Skip patient error:', e);
    }
  };

  // Table Action: Recall patient (POST /api/queue/:id/recall)
  const handleRecallPatient = async (item) => {
    try {
      const targetId = item._id || item.token;
      await queueApi.recallPatient(targetId);
      showNotification(`Token ${item.token} recalled back to waiting queue`, 'success');
      fetchQueueData();
    } catch (e) {
      console.error('Recall patient error:', e);
    }
  };

  // Table Action: Cancel queue token (POST /api/queue/:id/cancel)
  const handleCancelQueue = async (item) => {
    if (!window.confirm(`Are you sure you want to cancel Token ${item.token}?`)) return;
    try {
      const targetId = item._id || item.token;
      await queueApi.cancelQueue(targetId);
      showNotification(`Token ${item.token} cancelled`, 'warning');
      if (currentCall && (currentCall._id === item._id || currentCall.token === item.token)) {
        setCurrentCall(null);
      }
      fetchQueueData();
    } catch (e) {
      console.error('Cancel queue error:', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification Banner */}
      {actionMessage.text && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          background: actionMessage.type === 'success' ? '#ECFDF5' : actionMessage.type === 'warning' ? '#FEF3C7' : '#FEE2E2',
          border: `1px solid ${actionMessage.type === 'success' ? '#10B981' : actionMessage.type === 'warning' ? '#F59E0B' : '#EF4444'}`,
          color: actionMessage.type === 'success' ? '#065F46' : actionMessage.type === 'warning' ? '#92400E' : '#991B1B',
          fontWeight: '700',
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Live Queue Management & Token Console
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>Check-in arriving patients, generate daily queue tokens, and coordinate clinic waiting status boards</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {doctors.length > 0 && (
            <select
              className="form-control"
              style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem', borderColor: '#CBD5E1', maxWidth: '180px' }}
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">All Doctors Queue</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>Dr. {d.name}</option>
              ))}
            </select>
          )}

          <button
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={fetchQueueData}
            disabled={loading}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          
          <button
            onClick={() => setIsTvModalOpen(true)}
            style={{ background: '#0F172A', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.45rem', border: 'none', cursor: 'pointer' }}
          >
            <Tv size={16} color="#10B981" />
            <span>Waiting Room TV Board Active</span>
          </button>
        </div>
      </div>

      {/* 2. Queue Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Queue */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: '700' }}>TOTAL QUEUE SIZE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{stats.totalQueue} Patients</div>
          </div>
        </div>

        {/* Card 2: In Consultation */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>IN CONSULTATION</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{stats.inConsultation} Active</div>
          </div>
        </div>

        {/* Card 3: Waiting */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>WAITING PATIENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{stats.waiting} Pending</div>
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>COMPLETED TODAY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{stats.completed} Done</div>
          </div>
        </div>

      </div>

      {/* 3. Middle Calling Control Console & Check-in Desk */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        
        {/* Doctor calling console */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '2px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <BellRing size={18} color="#FF6600" /> Active Consultation Calling Console
            </h3>
          </div>

          {currentCall ? (
            <div style={{ background: '#F8FAFC', border: '1px solid #0066FF', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.45rem 1.25rem', background: '#EFF6FF', color: '#0066FF', borderRadius: '20px', fontSize: '1.3rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                TOKEN: {currentCall.token}
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{currentCall.patient}</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Assigned: <strong>{currentCall.doctor}</strong></p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#4F46E5', borderColor: '#C7D2FE', background: '#EEF2FF', padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                  onClick={handleStartConsultation}
                  disabled={currentCall.status === 'In Consultation'}
                >
                  <Play size={14} /> Start Consultation
                </button>

                <button
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                  onClick={handleCompleteConsultation}
                >
                  <Check size={14} /> Complete Consultation
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '16px', color: '#64748B', fontSize: '0.86rem' }}>
              No active patient inside consultation. Call the next waiting patient below.
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', width: '100%', fontSize: '0.88rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={handleCallNext}
          >
            Call Next Patient (Waiting Queue) <ArrowRight size={16} />
          </button>
        </div>

        {/* Receptionist check-in panel */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Receptionist Check-In Desk
            </h3>
            <button
              className="btn btn-outline-primary btn-sm"
              style={{ fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.6rem' }}
              onClick={() => setIsWalkInModalOpen(true)}
            >
              <UserPlus size={13} /> + Walk-In Token
            </button>
          </div>
          <p style={{ fontSize: '0.76rem', color: '#64748B', marginBottom: '1.15rem' }}>Arriving patients scheduled for today. Click check-in to auto-generate queue token:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '280px', overflowY: 'auto' }}>
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.75rem', background: '#FFFFFF' }}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '0.86rem', display: 'block' }}>{app.patient}</strong>
                    <span style={{ fontSize: '0.76rem', color: '#64748B' }}>Doc: {app.doctor} | Time: {app.time}</span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}
                    onClick={() => handleCheckIn(app)}
                  >
                    Check-In
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: '12px', color: '#94A3B8', fontSize: '0.78rem' }}>
                All appointments checked in or no active appointments scheduled. Use <strong>+ Walk-In Token</strong> to generate tokens.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Daily Live Queue Board table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Clinic Waiting Room Monitor Board
          </h3>
          <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '600' }}>
            {queue.length} Active Records Today
          </span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ padding: '0.75rem' }}>Token ID</th>
                <th style={{ padding: '0.75rem' }}>Patient Name</th>
                <th style={{ padding: '0.75rem' }}>Assigned Doctor</th>
                <th style={{ padding: '0.75rem' }}>Check-In Time</th>
                <th style={{ padding: '0.75rem' }}>Live Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.length > 0 ? (
                queue.map((q) => (
                  <tr key={q._id || q.token} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.85rem', fontWeight: '900', color: '#0066FF' }}>{q.token}</td>
                    <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{q.patient}</td>
                    <td style={{ padding: '0.85rem', color: '#475569', fontWeight: '600' }}>{q.doctor}</td>
                    <td style={{ padding: '0.85rem', color: '#64748B' }}>{q.checkInTime}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className={`doc-badge ${
                        q.status === 'Completed' ? 'confirmed' :
                        q.status === 'In Consultation' ? 'pending' :
                        q.status === 'Skipped' ? 'warning' : 'cancelled'
                      }`} style={{
                        fontSize: '0.74rem',
                        background: q.status === 'Waiting' ? '#FEF3C7' : q.status === 'Skipped' ? '#FFFBEB' : undefined,
                        color: q.status === 'Waiting' ? '#B45309' : q.status === 'Skipped' ? '#D97706' : undefined
                      }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        {q.status === 'Waiting' && (
                          <>
                            <button
                              title="Skip Patient"
                              className="btn btn-outline-warning btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                              onClick={() => handleSkipPatient(q)}
                            >
                              <SkipForward size={13} /> Skip
                            </button>
                            <button
                              title="Cancel Token"
                              className="btn btn-outline-danger btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                              onClick={() => handleCancelQueue(q)}
                            >
                              <XCircle size={13} /> Cancel
                            </button>
                          </>
                        )}

                        {q.status === 'Skipped' && (
                          <button
                            title="Recall Patient"
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                            onClick={() => handleRecallPatient(q)}
                          >
                            <RotateCcw size={13} /> Recall
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    No patients checked in today yet. Check in scheduled appointments or issue a walk-in token above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Walk-In Patient Modal */}
      {isWalkInModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '1.5rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>Generate Walk-In Token</h3>
              <button onClick={() => setIsWalkInModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>Patient Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  required
                  value={walkInForm.patientName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, patientName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. +91 9876543210"
                  value={walkInForm.patientPhone}
                  onChange={(e) => setWalkInForm({ ...walkInForm, patientPhone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '0.35rem' }}>Assigned Doctor</label>
                <select
                  className="form-control"
                  value={walkInForm.doctorId}
                  onChange={(e) => {
                    const doc = doctors.find(d => d._id === e.target.value);
                    setWalkInForm({
                      ...walkInForm,
                      doctorId: e.target.value,
                      doctorName: doc ? `Dr. ${doc.name}` : ''
                    });
                  }}
                >
                  <option value="">General OPD / First Available</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization || 'OPD'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setIsWalkInModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: '800' }}
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Waiting Room TV Display Board Modal */}
      {isTvModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.96)',
          zIndex: 99999,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Tv size={28} color="#10B981" />
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>CLINIC WAITING ROOM LIVE STATUS</h2>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>Tokens calling in progress - Please proceed when your token is announced</p>
              </div>
            </div>
            <button
              onClick={() => setIsTvModalOpen(false)}
              style={{ background: '#334155', border: 'none', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <X size={18} /> Close TV Board
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', flex: 1 }}>
            {/* Active Consultation Spotlight */}
            <div style={{ background: '#1E293B', borderRadius: '20px', padding: '2rem', border: '2px solid #3B82F6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '1rem', color: '#93C5FD', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>NOW CONSULTING</span>
              {currentCall ? (
                <>
                  <div style={{ fontSize: '4.5rem', fontWeight: '950', color: '#60A5FA', margin: '1rem 0' }}>
                    {currentCall.token}
                  </div>
                  <h3 style={{ fontSize: '2rem', fontWeight: '850', color: '#FFFFFF', margin: 0 }}>{currentCall.patient}</h3>
                  <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', color: '#CBD5E1' }}>
                    Doctor: <strong style={{ color: '#38BDF8' }}>{currentCall.doctor}</strong>
                  </div>
                </>
              ) : (
                <div style={{ color: '#94A3B8', fontSize: '1.25rem', marginTop: '1.5rem' }}>Next token being called...</div>
              )}
            </div>

            {/* Waiting Tokens Grid */}
            <div style={{ background: '#1E293B', borderRadius: '20px', padding: '1.5rem', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FCD34D', marginBottom: '1rem' }}>NEXT IN QUEUE</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {queue.filter(q => q.status === 'Waiting').map(item => (
                  <div key={item.token} style={{ background: '#0F172A', borderRadius: '12px', padding: '1rem', border: '1px solid #334155', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#F59E0B' }}>{item.token}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F8FAFC', marginTop: '0.25rem' }}>{item.patient}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{item.doctor}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QueueManagementPage;
