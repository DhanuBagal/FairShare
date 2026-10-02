import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Zap, Lock, Mail, User } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErr, setValidationErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, authError } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErr('');

    if (!email || !email.includes('@')) {
      setValidationErr('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setValidationErr('Password must be at least 6 characters long');
      return;
    }

    if (isRegister && !name.trim()) {
      setValidationErr('Please enter your full name');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoUser = async () => {
    setEmail('alex@example.com');
    setPassword('password123');
    setIsSubmitting(true);
    try {
      await login('alex@example.com', 'password123');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem' }}>{isRegister ? 'Create FairShare Account' : 'Sign In to FairShare'}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            className={`tab-btn ${!isRegister ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.9rem', padding: '8px' }}
            onClick={() => { setIsRegister(false); setValidationErr(''); }}
          >
            <LogIn size={16} /> Login
          </button>
          <button
            type="button"
            className={`tab-btn ${isRegister ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.9rem', padding: '8px' }}
            onClick={() => { setIsRegister(true); setValidationErr(''); }}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {(validationErr || authError) && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#FDA4AF', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
            ⚠️ {validationErr || authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '12px' }}
          >
            {isSubmitting ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
          <hr style={{ borderColor: 'var(--border-subtle)', borderStyle: 'solid' }} />
          <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#111726', padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            OR FAST DEMO ACCESS
          </span>
        </div>

        <button
          type="button"
          className="btn-emerald"
          onClick={fillDemoUser}
          disabled={isSubmitting}
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          <Zap size={18} /> One-Click Login as Demo User (Alex Johnson)
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
