import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Phone, KeyRound, Plus, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [tab, setTab] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [testOtpNotice, setTestOtpNotice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setTestOtpNotice('');
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setOtpSent(true);
      if (res.otp) {
        setTestOtpNotice(`Demo OTP Code: ${res.otp}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 140px)',
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.75rem',
            background: '#EEF2FF',
            borderRadius: '12px',
            marginBottom: '0.75rem',
            color: '#2F65F6'
          }}>
            <Plus size={32} strokeWidth={3} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem', color: '#1E293B' }}>Welcome to Doctris</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Sign in to manage appointments & patient records</p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.25rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
          <button
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: tab === 'password' ? '#FFFFFF' : 'transparent',
              color: tab === 'password' ? '#2F65F6' : '#64748B',
              boxShadow: tab === 'password' ? 'var(--shadow-xs)' : 'none'
            }}
            onClick={() => { setTab('password'); setError(''); }}
          >
            Password Login
          </button>
          <button
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: tab === 'otp' ? '#FFFFFF' : 'transparent',
              color: tab === 'otp' ? '#2F65F6' : '#64748B',
              boxShadow: tab === 'otp' ? 'var(--shadow-xs)' : 'none'
            }}
            onClick={() => { setTab('otp'); setError(''); }}
          >
            Mobile OTP Login
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {testOtpNotice && (
          <div className="alert alert-success">
            <span>{testOtpNotice}</span>
          </div>
        )}

        {tab === 'password' ? (
          <form onSubmit={handlePasswordLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Registered Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                  <Phone size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label>Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP & Login'}
                  <KeyRound size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.75rem' }}
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2F65F6', fontWeight: '700', textDecoration: 'none' }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
