import React, { useState } from 'react';
import { api } from '../services/api';
import { CheckCircle2, ArrowUpRight, ArrowDownLeft, PartyPopper } from 'lucide-react';

const SettleModal = ({ isOpen, onClose, group, simplifiedDebts = [], currentUserId, onSettlementAdded }) => {
  const [activeSubTab, setActiveSubTab] = useState('pay'); // 'pay' | 'receive'
  const [notes, setNotes] = useState('Settled via GPay / UPI');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !group) return null;

  // Filter debts where current user is the payer (You need to pay)
  const myDebtsToPay = simplifiedDebts.filter(d => currentUserId && d.from._id === currentUserId);

  // Filter debts where current user is the payee (Others need to pay you)
  const debtsToReceive = simplifiedDebts.filter(d => currentUserId && d.to._id === currentUserId);

  const handlePayClick = async (debt) => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await api.createSettlement(group._id, {
        payeeId: debt.to._id,
        amount: debt.amount,
        notes
      });
      onSettlementAdded();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={20} color="var(--accent-emerald)" /> Group Settlement Details
          </h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Sub-tabs: You Need to Pay vs Others Pay You */}
        <div className="tabs-container" style={{ marginBottom: '14px' }}>
          <button
            className={`tab-btn ${activeSubTab === 'pay' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('pay')}
          >
            <ArrowUpRight size={15} color="var(--accent-rose)" /> You Need to Pay ({myDebtsToPay.length})
          </button>
          <button
            className={`tab-btn ${activeSubTab === 'receive' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('receive')}
          >
            <ArrowDownLeft size={15} color="var(--accent-emerald)" /> Owed to You ({debtsToReceive.length})
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#FDA4AF', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.82rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tab 1: Payments You Need to Make */}
        {activeSubTab === 'pay' && (
          <div>
            {myDebtsToPay.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', background: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                <PartyPopper size={32} color="var(--accent-emerald)" style={{ marginBottom: '6px' }} />
                <h3 style={{ fontSize: '1rem', color: '#065F46', fontWeight: '700', marginBottom: '4px' }}>
                  You owe ₹0 in this group!
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#047857' }}>
                  You have no pending payments to make.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myDebtsToPay.map((debt, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFF1F2',
                      border: '1px solid #FECDD3',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`avatar-circle ${debt.to.avatar || 'avatar-purple'}`}>
                        {debt.to.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#881337' }}>
                          Pay {debt.to.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#9F1239' }}>
                          {debt.to.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#E11D48' }}>
                        ₹{debt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>

                      <button
                        className="btn-emerald"
                        disabled={isSubmitting}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
                        onClick={() => handlePayClick(debt)}
                      >
                        {isSubmitting ? 'Recording...' : 'Settle'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Payments Others Need to Make to You */}
        {activeSubTab === 'receive' && (
          <div>
            {debtsToReceive.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                  No members owe you money
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  You are not currently owed any balance in this group.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {debtsToReceive.map((debt, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`avatar-circle ${debt.from.avatar || 'avatar-amber'}`}>
                        {debt.from.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#065F46' }}>
                          {debt.from.name} owes you
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#047857' }}>
                          {debt.from.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#059669' }}>
                      +₹{debt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettleModal;
