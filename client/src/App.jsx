import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import { Scale, ShieldCheck, ArrowRight } from 'lucide-react';
import './styles/index.css';

const MainContent = () => {
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (loading) {
    return (
      <div className="mobile-app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <Scale size={36} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '0.9rem' }}>Loading FairShare...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-app-shell">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      <main style={{ padding: '16px' }}>
        {user ? (
          <Dashboard />
        ) : (
          /* Clean Mobile Landing */
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '4px 12px', borderRadius: '20px', color: '#4F46E5', fontSize: '0.78rem', fontWeight: '600', marginBottom: '18px' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" /> MongoDB & Debt Simplifier
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1.25, marginBottom: '14px', color: '#0F172A' }}>
              Simple Expense Sharing in Rupees (₹)
            </h1>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Track personal expenses privately and split group bills easily with automated minimum cash-flow debt simplification.
            </p>

            <button className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }} onClick={() => setIsAuthOpen(true)}>
              Get Started / Sign In <ArrowRight size={18} />
            </button>
          </div>
        )}
      </main>

      {/* Auth Login/Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
