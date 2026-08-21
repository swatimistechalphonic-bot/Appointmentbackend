import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.875rem',
      background: 'rgba(11, 15, 23, 0.9)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        <span>Crafted with</span>
        <Heart size={16} fill="#EC4899" color="#EC4899" />
        <span>for CareSync Appointment Booking System &copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
};

export default Footer;
