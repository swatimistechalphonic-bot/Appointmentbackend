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
  AlertCircle
} from 'lucide-react';
import { queueApi } from '../services/api';

const defaultAppointments = [
  { id: 'APP-501', patient: 'Aarav Gupta', doctor: 'Dr. Rahul Sharma', time: '12:30 PM', status: 'Confirmed' },
  { id: 'APP-502', patient: 'Neha Malhotra', doctor: 'Dr. Amit Verma', time: '01:00 PM', status: 'Confirmed' },
  { id: 'APP-503', patient: 'Vikram Singh', doctor: 'Dr. Pooja Sharma', time: '02:00 PM', status: 'Confirmed' }
];

const defaultQueue = [
  { token: 'T-01', patient: 'Simran Kaur', doctor: 'Dr. Pooja Sharma', status: 'Completed', checkInTime: '10:15 AM' },
  { token: 'T-02', patient: 'Rahul Sharma', doctor: 'Dr. Amit Verma', status: 'In Consultation', checkInTime: '10:45 AM' },
  { token: 'T-03', patient: 'Priya Patel', doctor: 'Dr. Neha Singh', status: 'Waiting', checkInTime: '11:00 AM' },
  { token: 'T-04', patient: 'Karan Mehta', doctor: 'Dr. Rahul Sharma', status: 'Waiting', checkInTime: '11:15 AM' }
];

const QueueManagementPage = () => {
  const [appointments, setAppointments] = useState(defaultAppointments);
  const [queue, setQueue] = useState(defaultQueue);
  const [tokenCounter, setTokenCounter] = useState(5);
  const [currentCall, setCurrentCall] = useState(defaultQueue[1]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQueue: 4,
    inConsultation: 1,
    waiting: 2,
    completed: 1
  });
  const refreshIntervalRef = useRef(null);

  // Calculate Metrics with state fallback
  const totalQueue = stats.totalQueue !== undefined ? stats.totalQueue : queue.length;
  const inConsultationCount = stats.inConsultation !== undefined ? stats.inConsultation : queue.filter(q => q.status === 'In Consultation').length;
  const waitingCount = stats.waiting !== undefined ? stats.waiting : queue.filter(q => q.status === 'Waiting').length;
  const completedCount = stats.completed !== undefined ? stats.completed : queue.filter(q => q.status === 'Completed').length;

  const fetchQueueData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch stats, waiting board, and check-in appointments in parallel
      const [statsRes, boardRes, checkInRes, currentRes] = await Promise.allSettled([
        queueApi.getTodayStats({ date: today }),
        queueApi.getWaitingBoard({ date: today }),
        queueApi.getTodayCheckInList({ date: today }),
        queueApi.getCurrentConsultation({ date: today })
      ]);

      // Handle stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
        setStats(statsRes.value.data.data);
      }

      // Handle waiting board
      if (boardRes.status === 'fulfilled' && boardRes.value?.data?.data?.length > 0) {
        const liveQueue = boardRes.value.data.data.map(item => ({
          _id: item._id,
          token: item.token,
          patient: item.patient || item.patientName,
          doctor: item.doctor || item.doctorName,
          status: item.status,
          checkInTime: item.checkInTime || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        }));
        setQueue(liveQueue);
        setTokenCounter(liveQueue.length + 1);
      }

      // Handle active consultation
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
      } else if (boardRes.status === 'fulfilled' && boardRes.value?.data?.data?.length > 0) {
        const activeInBoard = boardRes.value.data.data.find(q => q.status === 'In Consultation');
        if (activeInBoard) {
          setCurrentCall({
            _id: activeInBoard._id,
            token: activeInBoard.token,
            patient: activeInBoard.patient || activeInBoard.patientName,
            doctor: activeInBoard.doctor || activeInBoard.doctorName,
            status: activeInBoard.status,
            checkInTime: activeInBoard.checkInTime
          });
        }
      }

      // Handle check-in appointments list
      if (checkInRes.status === 'fulfilled' && checkInRes.value?.data?.data?.length > 0) {
        const pendingCheckIns = checkInRes.value.data.data
          .filter(a => !a.isCheckedIn)
          .map(a => ({
            id: a.id || a.appointmentId,
            patient: a.patient,
            doctor: a.doctor,
            time: a.time || '—',
            status: a.status || 'Confirmed'
          }));
        if (pendingCheckIns.length > 0) {
          setAppointments(pendingCheckIns);
        }
      }
    } catch (err) {
      console.error('Queue fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    refreshIntervalRef.current = setInterval(fetchQueueData, 15000);
    return () => clearInterval(refreshIntervalRef.current);
  }, []);

  // Receptionist utility: Check-in patient and generate token
  const handleCheckIn = async (app) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const isCustomApp = app.id && !String(app.id).startsWith('APP-');

      let responseToken = null;
      let newQueueEntry = null;

      if (isCustomApp) {
        const res = await queueApi.checkIn({
          appointmentId: app.id,
          date: today
        });
        if (res.data?.data) {
          newQueueEntry = res.data.data;
          responseToken = res.data.data.token;
        }
      } else {
        // Mock / Walk-in check-in fallback
        const res = await queueApi.checkIn({
          patientName: app.patient,
          doctorName: app.doctor,
          timeSlot: app.time,
          date: today
        });
        if (res.data?.data) {
          newQueueEntry = res.data.data;
          responseToken = res.data.data.token;
        }
      }

      const formattedToken = responseToken || ('T-' + String(tokenCounter).padStart(2, '0'));
      
      const newQueueItem = newQueueEntry ? {
        _id: newQueueEntry._id,
        token: newQueueEntry.token,
        patient: newQueueEntry.patientName || app.patient,
        doctor: newQueueEntry.doctorName || app.doctor,
        status: newQueueEntry.status || 'Waiting',
        checkInTime: newQueueEntry.checkInTime || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      } : {
        token: formattedToken,
        patient: app.patient,
        doctor: app.doctor,
        status: 'Waiting',
        checkInTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };

      setQueue(prev => [...prev, newQueueItem]);
      setTokenCounter(prev => prev + 1);
      setAppointments(prev => prev.filter(item => item.id !== app.id));
      setStats(prev => ({
        ...prev,
        totalQueue: (prev.totalQueue || 0) + 1,
        waiting: (prev.waiting || 0) + 1
      }));

      // Audio notification
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(0.15);
      } catch (e) {}
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  // Doctor calling console: Call next patient
  const handleCallNext = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await queueApi.callNext({ date: today });
      
      if (res.data?.data) {
        const called = res.data.data;
        const mappedCalled = {
          _id: called._id,
          token: called.token,
          patient: called.patientName || called.patient,
          doctor: called.doctorName || called.doctor,
          status: 'In Consultation',
          checkInTime: called.checkInTime
        };

        setQueue(prev =>
          prev.map(q => {
            if (currentCall && (q._id === currentCall._id || q.token === currentCall.token)) {
              return { ...q, status: 'Completed' };
            }
            if (q._id === called._id || q.token === called.token) {
              return { ...q, status: 'In Consultation' };
            }
            return q;
          })
        );
        setCurrentCall(mappedCalled);
        fetchQueueData();
        return;
      }
    } catch (apiErr) {
      // Local fallback if API reports 404 / no waiting
      const nextPatient = queue.find(q => q.status === 'Waiting');
      if (!nextPatient) {
        alert("No patients currently waiting in the queue!");
        return;
      }

      if (currentCall) {
        setQueue(prev =>
          prev.map(q => q.token === currentCall.token ? { ...q, status: 'Completed' } : q)
        );
      }

      setQueue(prev =>
        prev.map(q => q.token === nextPatient.token ? { ...q, status: 'In Consultation' } : q)
      );
      setCurrentCall({ ...nextPatient, status: 'In Consultation' });
    }
  };

  const handleStartConsultation = async () => {
    if (!currentCall) return;
    try {
      if (currentCall._id || currentCall.token) {
        await queueApi.startConsultation(currentCall._id || currentCall.token);
      }
    } catch (e) {
      console.error('Start consultation error:', e);
    }
    setQueue(prev =>
      prev.map(q => (q._id === currentCall._id || q.token === currentCall.token) ? { ...q, status: 'In Consultation' } : q)
    );
    setCurrentCall(prev => ({ ...prev, status: 'In Consultation' }));
    fetchQueueData();
  };

  const handleCompleteConsultation = async () => {
    if (!currentCall) return;
    try {
      if (currentCall._id || currentCall.token) {
        await queueApi.completeConsultation(currentCall._id || currentCall.token);
      }
    } catch (e) {
      console.error('Complete consultation error:', e);
    }
    setQueue(prev =>
      prev.map(q => (q._id === currentCall._id || q.token === currentCall.token) ? { ...q, status: 'Completed' } : q)
    );
    setCurrentCall(null);
    fetchQueueData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
            Live Queue Management & Token Console
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>Check-in arriving patients, generate daily queue tokens, and coordinate clinic waiting status boards</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={fetchQueueData}
            disabled={loading}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Tv size={16} color="#10B981" />
            <span>Waiting Room TV Board Active</span>
          </div>
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
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E3A8A', marginTop: '0.1rem' }}>{totalQueue} Patients</div>
          </div>
        </div>

        {/* Card 2: In Consultation */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#8B5CF6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#4C1D95', fontWeight: '700' }}>IN CONSULTATION</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#4C1D95', marginTop: '0.1rem' }}>{inConsultationCount} Active</div>
          </div>
        </div>

        {/* Card 3: Waiting */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '700' }}>WAITING PATIENTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#78350F', marginTop: '0.1rem' }}>{waitingCount} Pending</div>
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '16px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#064E3B', fontWeight: '700' }}>COMPLETED TODAY</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginTop: '0.1rem' }}>{completedCount} Done</div>
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

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
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
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.85rem' }}>
            Receptionist Check-In Desk
          </h3>
          <p style={{ fontSize: '0.76rem', color: '#64748B', marginBottom: '1.15rem' }}>Arriving patients scheduled for today. Click check-in to auto-generate queue token:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                All appointments checked in or no active appointments scheduled.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Daily Live Queue Board table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.85rem' }}>
          Clinic Waiting Room Monitor Board
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ padding: '0.75rem' }}>Token ID</th>
                <th style={{ padding: '0.75rem' }}>Patient Name</th>
                <th style={{ padding: '0.75rem' }}>Assigned Doctor</th>
                <th style={{ padding: '0.75rem' }}>Check-In Time</th>
                <th style={{ padding: '0.75rem' }}>Live Status</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q) => (
                <tr key={q.token} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.85rem', fontWeight: '900', color: '#0066FF' }}>{q.token}</td>
                  <td style={{ padding: '0.85rem', fontWeight: '800', color: '#0F172A' }}>{q.patient}</td>
                  <td style={{ padding: '0.85rem', color: '#475569', fontWeight: '600' }}>{q.doctor}</td>
                  <td style={{ padding: '0.85rem', color: '#64748B' }}>{q.checkInTime}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={`doc-badge ${
                      q.status === 'Completed' ? 'confirmed' :
                      q.status === 'In Consultation' ? 'pending' : 'cancelled'
                    }`} style={{ fontSize: '0.74rem' }}>
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default QueueManagementPage;
