import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Scale, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

const Navbar = ({ onOpenAuth }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="mobile-header">
      <div className="nav-brand">
        <div className="brand-logo-icon">
          <Scale size={20} color="#FFF" />
        </div>
        <div>
          <h1 className="brand-title">FairShare</h1>
        </div>
      </div>

      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`avatar-circle ${user.avatar || 'avatar-blue'}`} style={{ width: '32px', height: '32px' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button className="btn-secondary" onClick={logout} style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '32px' }} title="Sign Out">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth} style={{ padding: '6px 12px', fontSize: '0.82rem', minHeight: '36px' }}>
            <UserIcon size={14} /> Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
