import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Users,
  Building2,
  Clock,
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

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Doctors', path: '/doctors', icon: UserCheck },
    { name: 'Patients', path: '/patients', icon: Users },
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
      {/* Brand Logo matching screenshot */}
      <Link to="/" className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <HeartPulse size={26} strokeWidth={2.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.1' }}>
            DocAdmin
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '500' }}>
            Doctor Appointment System
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
