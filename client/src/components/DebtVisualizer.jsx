import React from 'react';
import { ArrowRight, CheckCircle2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const DebtVisualizer = ({ netBalances = [], simplifiedDebts = [], totalSpending = 0, currentUserId, onSettleClick }) => {
  // Find current user's net balance
  const myNetObj = netBalances.find(b => b.user._id === currentUserId);
  const myNet = myNetObj ? myNetObj.netBalance : 0;

  // Filter debts relevant to the logged in user
  const iOweDebts = simplifiedDebts.filter(d => currentUserId && d.from._id === currentUserId);
  const owesMeDebts = simplifiedDebts.filter(d => currentUserId && d.to._id === currentUserId);
  const otherDebts = simplifiedDebts.filter(d => currentUserId && d.from._id !== currentUserId && d.to._id !== currentUserId);

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* 1. Overall Balance Summary Card */}
      <div className="glass-card" style={{ padding: '14px 16px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Group Balance
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '2px' }}>
              {myNet > 0 ? (
                <span style={{ color: 'var(--accent-emerald)' }}>+₹{myNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (You get back)</span>
              ) : myNet < 0 ? (
                <span style={{ color: 'var(--accent-rose)' }}>-₹{Math.abs(myNet).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (You owe)</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>₹0.00 (All Settled)</span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Spending</span>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
              ₹{totalSpending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Direct Actionable Settlements */}
      {/* A. People You Owe (Red) */}
      {iOweDebts.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.82rem', color: 'var(--accent-rose)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ArrowUpRight size={15} /> You Owe ({iOweDebts.length})
          </h4>
          {iOweDebts.map((debt, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '12px 14px',
                marginBottom: '6px',
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
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
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#881337' }}>{debt.to.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9F1239' }}>You owe</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#E11D48' }}>
                  ₹{debt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <button
                  className="btn-emerald"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
                  onClick={() => onSettleClick(debt.to, debt.amount)}
                >
                  Settle Up
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* B. People Who Owe You (Green) */}
      {owesMeDebts.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ArrowDownLeft size={15} /> People Owe You ({owesMeDebts.length})
          </h4>
          {owesMeDebts.map((debt, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '12px 14px',
                marginBottom: '6px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
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
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#065F46' }}>{debt.from.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#047857' }}>owes you</div>
                </div>
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#059669' }}>
                +₹{debt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* C. Other Group Member Debts */}
      {otherDebts.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Other Members ({otherDebts.length})
          </h4>
          {otherDebts.map((debt, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 12px',
                marginBottom: '6px',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{debt.from.name}</span>
                <ArrowRight size={12} color="var(--text-muted)" />
                <span>{debt.to.name}</span>
              </div>
              <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                ₹{debt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      )}

      {simplifiedDebts.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '16px 10px', color: 'var(--accent-emerald)', background: '#ECFDF5' }}>
          <CheckCircle2 size={24} style={{ marginBottom: '4px' }} />
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Everyone is Settled Up!</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No pending debts in this group.</div>
        </div>
      )}
    </div>
  );
};

export default DebtVisualizer;
