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
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const { logout } = useAuth();
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

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Doctors', path: '/doctors', icon: UserCheck },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Departments', path: '/departments', icon: Building2 },
    { name: 'Schedules', path: '/schedules', icon: Clock },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Reviews', path: '/reviews', icon: Star },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
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

      {/* Navigation Links matching screenshot */}
      <div className="sidebar-menu">
        {menuItems.map((item) => {
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
