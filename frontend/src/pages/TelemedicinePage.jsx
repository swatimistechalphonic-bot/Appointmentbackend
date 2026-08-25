import React, { useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  User,
  Clock,
  Send,
  ClipboardList,
  CheckCircle2,
  Tv,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const TelemedicinePage = () => {
  const [activeRoom, setActiveRoom] = useState(null); // Currently active video call room details
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Real-time call chat mock
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Patient (Swati Verma)', message: 'Doctor, can you please review my CBC report?', time: '11:02 AM' },
    { sender: 'Dr. Rahul Sharma', message: 'Yes Swati, I have opened it. Your Hemoglobin looks a bit low.', time: '11:03 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Consultation notes typed inside the call
  const [consultNotes, setConsultNotes] = useState('');

  // Initial Scheduled Consultations list
  const [meetings, setMeetings] = useState([
    { id: 'TELE-501', patient: 'Swati Verma', age: 26, gender: 'Female', doctor: 'Dr. Rahul Sharma', time: 'Today, 11:00 AM', status: 'Live' },
    { id: 'TELE-502', patient: 'Karan Mehta', age: 45, gender: 'Male', doctor: 'Dr. Vivek Malhotra', time: 'Today, 03:30 PM', status: 'Scheduled' },
    { id: 'TELE-503', patient: 'Priya Patel', age: 28, gender: 'Female', doctor: 'Dr. Neha Singh', time: 'Tomorrow, 10:00 AM', status: 'Scheduled' }
  ]);

  const handleJoinCall = (room) => {
    setActiveRoom(room);
    setMeetings(prev =>
      prev.map(m => m.id === room.id ? { ...m, status: 'Live' } : m)
    );
  };

  const handleEndCall = () => {
    if (!activeRoom) return;
    const closedRoomId = activeRoom.id;
    setMeetings(prev =>
      prev.map(m => m.id === closedRoomId ? { ...m, status: 'Completed' } : m)
    );
    setActiveRoom(null);
    setConsultNotes('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput) return;
    const newMsg = {
      sender: 'Dr. Rahul Sharma',
      message: chatInput,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, newMsg]);
    setChatInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {!activeRoom ? (
        // List of Telemedicine appointments
        <>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.2rem' }}>
              Telemedicine & Video Consultation
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.86rem' }}>Launch encrypted remote clinical consults, share screens, and update Electronic Health Records in real-time</p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.15rem' }}>
              Today's Scheduled Video Appointments
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {meetings.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.15rem', background: '#FFFFFF', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#EFF6FF', color: '#0066FF', display: 'flex', alignItems: 'center', justify: 'center' }}>
                      <Video size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>{m.patient}</h4>
                      <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                        Doctor: <strong>{m.doctor}</strong> | Scheduled: <strong style={{ color: '#0066FF' }}>{m.time}</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`doc-badge ${
                      m.status === 'Completed' ? 'confirmed' :
                      m.status === 'Live' ? 'pending' : 'cancelled'
                    }`} style={{ fontSize: '0.74rem' }}>
                      {m.status === 'Live' ? 'LIVE NOW' : m.status}
                    </span>

                    {m.status !== 'Completed' && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: m.status === 'Live' ? '#EF4444' : '#0066FF', boxShadow: 'none' }}
                        onClick={() => handleJoinCall(m)}
                      >
                        <Video size={14} /> {m.status === 'Live' ? 'Join Live Room' : 'Start Consultation'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Active Telemedicine Video Call Screen
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                Consultation: {activeRoom.patient} ({activeRoom.gender}, {activeRoom.age} yrs)
              </h2>
              <p style={{ color: '#10B981', fontSize: '0.78rem', margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                Encrypted Connection (AES-256) | Live Stream Active
              </p>
            </div>
            
            <button className="btn btn-secondary btn-sm" style={{ color: '#DC2626', borderColor: '#FCA5A5' }} onClick={handleEndCall}>
              <PhoneOff size={14} /> End Call Session
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '1.25rem', alignItems: 'start' }}>
            
            {/* Left Area: Video feeds container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '100%', height: '420px', background: '#0F172A', borderRadius: '20px', overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                
                {/* Main Video: Patient Feed */}
                {!isCameraOff ? (
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80"
                    alt="Patient Stream"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.9rem' }}>
                    Patient camera disabled
                  </div>
                )}

                {/* Floating Doctor Feed (PIP) */}
                <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem', width: '130px', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', background: '#1E293B' }}>
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"
                    alt="Doctor Stream"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Controls overlay bar */}
                <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '0.65rem 1.5rem', borderRadius: '30px', display: 'flex', gap: '1rem', border: '1px solid #334155' }}>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={{ background: isMuted ? '#EF4444' : 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0.45rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>

                  <button
                    onClick={() => setIsCameraOff(!isCameraOff)}
                    style={{ background: isCameraOff ? '#EF4444' : 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0.45rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
                  >
                    {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
                  </button>

                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    style={{ background: isScreenSharing ? '#10B981' : 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0.45rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
                  >
                    <Monitor size={20} />
                  </button>
                </div>
              </div>

              {/* Doctor clinical notes entry pad */}
              <div className="card" style={{ padding: '1.15rem' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ClipboardList size={16} color="#0066FF" /> Clinical Consultation Notes (EHR Sync)
                </h3>
                <textarea
                  placeholder="Record symptoms, diagnosis, and prescription details during the call..."
                  className="input-field"
                  rows={3}
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  style={{ resize: 'none', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            {/* Right Area: Chat & details tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Call details */}
              <div className="card" style={{ padding: '1.15rem', fontSize: '0.8rem' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.65rem' }}>Consultation Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', color: '#475569' }}>
                  <div>Patient Name: <strong style={{ color: '#0F172A' }}>{activeRoom.patient}</strong></div>
                  <div>Consulting Doctor: <strong style={{ color: '#0F172A' }}>{activeRoom.doctor}</strong></div>
                  <div>Scheduled Time: <strong style={{ color: '#0066FF' }}>{activeRoom.time}</strong></div>
                </div>
              </div>

              {/* Chat room */}
              <div className="card" style={{ padding: '1.15rem', height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.85rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.45rem' }}>Consultation Chat</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '230px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', alignSelf: msg.sender.includes('Doctor') || msg.sender.includes('Rahul') ? 'flex-end' : 'flex-start' }}>
                        <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '700' }}>{msg.sender}</span>
                        <div style={{
                          background: msg.sender.includes('Doctor') || msg.sender.includes('Rahul') ? '#0066FF' : '#F1F5F9',
                          color: msg.sender.includes('Doctor') || msg.sender.includes('Rahul') ? '#FFFFFF' : '#0F172A',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          maxWidth: '200px',
                          wordBreak: 'break-word'
                        }}>
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.45rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.65rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Type message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.65rem', flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}>
                    <Send size={14} />
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default TelemedicinePage;
