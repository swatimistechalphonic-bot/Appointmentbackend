import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { settingApi } from '../services/api';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Users,
  Building2,
  Clock,
  MessageSquare,
  CreditCard,
  Star,
  BarChart3,
  Settings,
  User,
  LogOut,
  ShieldAlert,
  HeartPulse,
  ClipboardList,
  FolderHeart,
  FileSpreadsheet,
  Video,
  Stethoscope,
  Activity,
  FileText,
  Bell,
  ShieldCheck,
  Bed,
  UserPlus,
  Syringe,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const { user, logout } = useAuth();
  const [logoError, setLogoError] = useState(false);
  const [appSettings, setAppSettings] = useState({
    appName: localStorage.getItem('docadmin_app_name') || 'DocAdmin',
    appSubtitle: localStorage.getItem('docadmin_app_subtitle') || 'Doctor Appointment System',
    logoUrl: localStorage.getItem('docadmin_logo_url') || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80'
  });

  useEffect(() => {
    fetchAppSettings();

    const handleSettingsEvent = (e) => {
      setLogoError(false);
      if (e?.detail) {
        setAppSettings((prev) => ({
          ...prev,
          appName: e.detail.appName || prev.appName,
          appSubtitle: e.detail.appSubtitle || prev.appSubtitle,
          logoUrl: e.detail.logoUrl || prev.logoUrl
        }));
      } else {
        fetchAppSettings();
      }
    };

    window.addEventListener('app_settings_updated', handleSettingsEvent);
    return () => {
      window.removeEventListener('app_settings_updated', handleSettingsEvent);
    };
  }, [location.pathname]);

  const fetchAppSettings = async () => {
    try {
      const res = await settingApi.getSettings();
      if (res.data?.success && res.data.settings) {
        setAppSettings(res.data.settings);
        if (res.data.settings.logoUrl) {
          localStorage.setItem('docadmin_logo_url', res.data.settings.logoUrl);
        }
      }
    } catch (err) {
      console.error('Fetch Settings Error:', err);
    }
  };

  const permissions = {
    superadmin: ['*', 'logout'],
    admin: ['dashboard', 'appointments', 'doctors', 'patients', 'schedules', 'queuemanagement', 'medicalrecords', 'prescriptions', 'messages', 'telemedicine', 'departments', 'services', 'paymentsbilling', 'labdiagnostics', 'documents', 'reviews', 'reportsanalytics', 'staffroles', 'auditlogs', 'settings', 'adminprofile', 'bedward', 'referrals', 'vaccinations', 'dischargesummaries', 'logout'],
    doctor: ['dashboard', 'appointments', 'patients', 'medicalrecords', 'prescriptions', 'messages', 'schedules', 'documents', 'staffroles', 'auditlogs', 'settings', 'adminprofile', 'bedward', 'referrals', 'vaccinations', 'dischargesummaries', 'logout'],
    receptionist: ['dashboard', 'appointments', 'patients', 'doctors', 'schedules', 'paymentsbilling', 'documents', 'staffroles', 'auditlogs', 'settings', 'adminprofile', 'bedward', 'referrals', 'vaccinations', 'dischargesummaries', 'logout'],
    nurse: ['dashboard', 'appointments', 'patients', 'medicalrecords', 'prescriptions', 'messages', 'telemedicine', 'labdiagnostics', 'documents', 'staffroles', 'auditlogs', 'settings', 'adminprofile', 'bedward', 'referrals', 'vaccinations', 'dischargesummaries', 'logout'],
    labstaff: ['dashboard', 'patients', 'messages', 'labdiagnostics', 'documents', 'staffroles', 'auditlogs', 'settings', 'adminprofile', 'bedward', 'referrals', 'vaccinations', 'dischargesummaries', 'logout'],
    accountant: ['dashboard', 'messages', 'paymentsbilling', 'reportsanalytics', 'documents', 'staffroles', 'auditlogs', 'settings', 'adminprofile', 'bedward', 'referrals', 'vaccinations', 'dischargesummaries', 'logout'],
    user: ['dashboard', 'appointments', 'doctors', 'messages', 'reviews', 'documents', 'staffroles', 'auditlogs', 'settings', 'adminprofile', 'bedward', 'referrals', 'vaccinations', 'dischargesummaries', 'logout'],
    patient: ['dashboard', 'appointments', 'doctors', 'messages', 'reviews', 'documents', 'staffroles', 'auditlogs', 'settings', 'adminprofile', 'bedward', 'referrals', 'vaccinations', 'dischargesummaries', 'logout']
  };

  const roleKey = user?.role ? user.role.toLowerCase().replace(/\s+/g, '') : 'admin';

  const canAccess = (itemName) => {
    const allowed = permissions[roleKey] || permissions['admin'];
    const key = itemName.toLowerCase().replace('&', '').replace(/\s+/g, '');
    return allowed.includes('*') || allowed.includes(key);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Doctors', path: '/doctors', icon: UserCheck },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Schedules', path: '/schedules', icon: Clock },
    { name: 'Queue Management', path: '/queue', icon: ClipboardList },
    { name: 'Medical Records', path: '/records', icon: FolderHeart },
    { name: 'Prescriptions', path: '/prescriptions', icon: FileSpreadsheet },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Telemedicine', path: '/telemedicine', icon: Video },
    { name: 'Departments', path: '/departments', icon: Building2 },
    { name: 'Services', path: '/services', icon: Stethoscope },
    { name: 'Payments & Billing', path: '/payments', icon: CreditCard },
    { name: 'Lab & Diagnostics', path: '/lab', icon: Activity },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Bed & Ward', path: '/beds', icon: Bed },
    { name: 'Referrals', path: '/referrals', icon: UserPlus },
    { name: 'Vaccinations', path: '/vaccinations', icon: Syringe },
    { name: 'Discharge Summaries', path: '/discharge-summaries', icon: FileCheck2 },
    { name: 'Reviews', path: '/reviews', icon: Star },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Staff & Roles', path: '/staff', icon: ShieldAlert },
    { name: 'Audit Logs', path: '/logs', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Admin Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="doctris-sidebar">
      {/* Brand Logo matching dynamic settings */}
      <Link to="/" className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ overflow: 'hidden', padding: 0 }}>
          {appSettings.logoUrl && !logoError ? (
            <img
              src={appSettings.logoUrl}
              alt={appSettings.appName}
              style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '10px' }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <HeartPulse size={26} strokeWidth={2.5} />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.1' }}>
            {appSettings.appName || 'DocAdmin'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '500' }}>
            {appSettings.appSubtitle || 'Doctor Appointment System'}
          </span>
        </div>
      </Link>

      {/* Public Website Button */}
      <div style={{ padding: '0 1rem 0.75rem 1rem' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '0.5rem',
            background: 'rgba(0, 102, 255, 0.15)',
            border: '1px solid rgba(0, 102, 255, 0.4)',
            color: '#60A5FA',
            borderRadius: '10px',
            padding: '0.55rem',
            fontSize: '0.82rem',
            fontWeight: '700',
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🌐 View Public Website</span>
        </Link>
      </div>

      {/* Navigation Links matching screenshot */}
      <div className="sidebar-menu" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
        {menuItems
          .filter((item) => canAccess(item.name))
          .map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.path || (item.path === '/' && activePath === '');

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
              >
                <div className="menu-item-left">
                  <Icon size={19} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}

        <div className="sidebar-divider" />

        <div onClick={logout} className="menu-item" style={{ color: '#F87171' }}>
          <div className="menu-item-left">
            <LogOut size={19} />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
