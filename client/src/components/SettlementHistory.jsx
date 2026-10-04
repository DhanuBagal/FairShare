import React, { useEffect, useState } from 'react';
import { ArrowRight, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const SettlementHistory = ({ groupId, currentUserId, refreshTrigger }) => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSettlements = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.getGroupSettlements(groupId);
      if (res.success) setSettlements(res.settlements || []);
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (groupId) fetchSettlements(false); }, [groupId]);
  useEffect(() => { if (groupId && refreshTrigger > 0) fetchSettlements(true); }, [refreshTrigger]);

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isIPaid = (s) => s.payer?._id === currentUserId;
  const isIPaidTo = (s) => s.payee?._id === currentUserId;

  if (loading) return (
    <div style={{ padding: '18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
      Loading settlement history...
    </div>
  );

  return (
    <div style={{ marginTop: '16px' }}>
      <h3 style={{ fontSize: '0.98rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <CheckCircle2 size={16} color="var(--accent-emerald)" />
        Settlement History ({settlements.length})
      </h3>

      {settlements.length === 0 ? (
        <div className="glass-card" style={{ padding: '18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          No settlements recorded yet. Use "Settle Up" to track payments.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {settlements.map((s) => {
            const iPaid = isIPaid(s);
            const iPaidTo = isIPaidTo(s);
            const payerName = iPaid ? 'You' : s.payer?.name || 'Unknown';
            const payeeName = iPaidTo ? 'You' : s.payee?.name || 'Unknown';

            const bgColor = iPaid
              ? 'rgba(239, 246, 255, 1)'
              : iPaidTo
              ? '#ECFDF5'
              : 'var(--bg-card)';
            const borderColor = iPaid
              ? '#BFDBFE'
              : iPaidTo
              ? '#A7F3D0'
              : 'var(--border-subtle)';

            return (
              <div
                key={s._id}
                className="glass-card"
                style={{
                  padding: '11px 14px',
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                }}
              >
                {/* Who paid whom row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: 0 }}>
                    {/* Payer avatar */}
                    <div
                      className={`avatar-circle ${s.payer?.avatar || 'avatar-blue'}`}
                      style={{ width: '26px', height: '26px', fontSize: '0.7rem', flexShrink: 0 }}
                      title={s.payer?.name}
                    >
                      {(s.payer?.name || '?').charAt(0).toUpperCase()}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: '700', color: iPaid ? '#1D4ED8' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {payerName}
                        <ArrowRight size={12} style={{ margin: '0 4px', verticalAlign: 'middle', opacity: 0.6 }} />
                        {payeeName}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} />
                        {formatDate(s.date)}
                        {s.notes && s.notes !== 'Settling up balance' && (
                          <span style={{ marginLeft: '4px' }}>• {s.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '800',
                    color: iPaid ? '#1D4ED8' : iPaidTo ? '#059669' : 'var(--text-main)',
                    flexShrink: 0
                  }}>
                    {iPaidTo ? '+' : ''}₹{s.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SettlementHistory;
