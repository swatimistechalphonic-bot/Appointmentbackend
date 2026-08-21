import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, Bell, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="doctris-header">
      {/* Left side: Toggle + Title */}
      <div className="header-left">
        <Menu size={22} color="#64748B" style={{ cursor: 'pointer' }} />
        <h1 className="header-title">Dashboard</h1>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="header-actions">
        {/* Search Input */}
        <div className="header-search">
          <Search size={16} color="#94A3B8" />
          <input type="text" placeholder="Search here..." />
        </div>

        {/* Bell Badge */}
        <button className="icon-badge-btn" title="Notifications">
          <Bell size={20} />
          <span className="icon-badge">5</span>
        </button>

        {/* Admin Profile */}
        <div className="user-avatar-btn" onClick={logout} title="Click to Logout">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Admin Avatar"
            className="avatar-img"
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>
              {user?.name || 'Admin'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}>
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
