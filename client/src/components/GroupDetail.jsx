import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DebtVisualizer from './DebtVisualizer';
import SettleModal from './SettleModal';
import { ArrowLeft, Plus, CheckCircle2, UserPlus, Receipt, History, CheckSquare, Square, ShoppingBag } from 'lucide-react';

const GroupDetail = ({ groupId, onBack, currentUserId, refreshTrigger, onOpenAddExpense }) => {
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'settlements'

  // Settle modal state
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [settlePayee, setSettlePayee] = useState(null);
  const [settleAmount, setSettleAmount] = useState(0);

  // Add Member state
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberErr, setAddMemberErr] = useState('');

  const fetchGroupDetail = async (isSilent = false) => {
    try {
      if (!isSilent && !groupData) {
        setLoading(true);
      }
      const res = await api.getGroupById(groupId);
      if (res.success) {
        setGroupData(res);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetail(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId && refreshTrigger > 0) {
      fetchGroupDetail(true);
    }
  }, [refreshTrigger]);

  const handleSettleClick = (payee = null, amount = 0) => {
    setSettlePayee(payee);
    setSettleAmount(amount);
    setIsSettleOpen(true);
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setAddMemberErr('');
    try {
      await api.addGroupMember(groupId, addMemberEmail);
      setAddMemberEmail('');
      setShowAddMember(false);
      fetchGroupDetail(true);
    } catch (err) {
      setAddMemberErr(err.message);
    }
  };

  if (loading && !groupData) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading group details...</div>;
  }

  if (error || !groupData) {
    return (
      <div>
        <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Groups
        </button>
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#FDA4AF', padding: '14px', borderRadius: '12px' }}>
          ⚠️ {error || 'Group details not found'}
        </div>
      </div>
    );
  }

  const { group, netBalances, simplifiedDebts, totalGroupSpending, expenses, settlements } = groupData;

  return (
    <div>
      {/* Top Back Navigation */}
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '14px', minHeight: '34px', padding: '4px 10px', fontSize: '0.8rem' }}>
        <ArrowLeft size={14} /> Back to Groups
      </button>

      {/* Clean Group Header */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '14px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
          {group.category}
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '4px' }}>{group.name}</h2>
        {group.description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px' }}>{group.description}</p>
        )}

        {/* Members & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {group.members.map(m => (
              <div key={m._id} title={`${m.name} (${m.email})`} className={`avatar-circle ${m.avatar || 'avatar-blue'}`} style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>
                {m.name.charAt(0).toUpperCase()}
              </div>
            ))}
            <button
              className="btn-secondary"
              style={{ padding: '2px 8px', fontSize: '0.72rem', minHeight: '26px', borderRadius: '12px' }}
              onClick={() => setShowAddMember(!showAddMember)}
            >
              <UserPlus size={11} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-emerald" style={{ padding: '6px 12px', fontSize: '0.82rem', minHeight: '34px' }} onClick={() => handleSettleClick(null, 0)}>
              <CheckCircle2 size={15} /> Settle Up
            </button>
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.82rem', minHeight: '34px' }} onClick={() => onOpenAddExpense('group', group._id)}>
              <Plus size={15} /> Add Expense
            </button>
          </div>
        </div>

        {showAddMember && (
          <form onSubmit={handleAddMemberSubmit} style={{ display: 'flex', gap: '6px', marginTop: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
            <input
              type="email"
              className="form-input"
              style={{ padding: '4px 8px', fontSize: '0.82rem', minHeight: '32px', flex: 1 }}
              placeholder="User email"
              value={addMemberEmail}
              onChange={(e) => setAddMemberEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.78rem', minHeight: '32px' }}>Add</button>
          </form>
        )}
        {addMemberErr && <div style={{ color: '#FDA4AF', fontSize: '0.72rem', marginTop: '4px' }}>{addMemberErr}</div>}
      </div>

      {/* Debt Balance Summary Graph */}
      <DebtVisualizer
        netBalances={netBalances}
        simplifiedDebts={simplifiedDebts}
        totalSpending={totalGroupSpending}
        currentUserId={currentUserId}
        onSettleClick={handleSettleClick}
      />

      {/* Sub Navigation Segment (Expenses | Settlement Trace) */}
      <div className="tabs-container" style={{ marginBottom: '14px' }}>
        <button
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <Receipt size={14} /> Group Expenses ({expenses.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'settlements' ? 'active' : ''}`}
          onClick={() => setActiveTab('settlements')}
        >
          <History size={14} /> Settlement History ({settlements.length})
        </button>
      </div>

      {/* Tab 1: Group Expenses Feed */}
      {activeTab === 'expenses' && (
        <div>
          {expenses.length === 0 ? (
            <div className="glass-card" style={{ padding: '18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No expenses recorded in this group yet.
            </div>
          ) : (
            expenses.map(exp => {
              const paidByName = exp.paidBy ? exp.paidBy.name : 'Unknown';
              const isPaidByMe = currentUserId && exp.paidBy?._id === currentUserId;
              const linkedList = exp.purchaseListId;

              return (
                <div key={exp._id} className="glass-card" style={{ padding: '12px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{exp.title}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Paid by <strong style={{ color: isPaidByMe ? 'var(--accent-primary)' : 'var(--text-main)' }}>{isPaidByMe ? 'You' : paidByName}</strong> • {new Date(exp.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '700' }}>
                        ₹{exp.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Anyone in the group can view the purchase list if added as expense in a group */}
                  {linkedList && (
                    <div style={{ marginTop: '10px', padding: '10px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShoppingBag size={14} /> Linked Checklist: {linkedList.name || exp.title} (Locked)
                      </div>
                      {linkedList.items && linkedList.items.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {linkedList.items.map(item => (
                            <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', color: item.completed ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                                {item.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                              </span>
                              <span style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                                {item.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No checklist items found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Settlement Audit Trace */}
      {activeTab === 'settlements' && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Complete audit trace of settlements and repayments in this group:
          </div>

          {settlements.length === 0 ? (
            <div className="glass-card" style={{ padding: '18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No settlements logged yet.
            </div>
          ) : (
            settlements.map(s => (
              <div key={s._id} className="glass-card" style={{ padding: '12px', marginBottom: '8px', borderLeft: '3px solid var(--accent-emerald)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>
                      <span style={{ color: 'var(--accent-rose)' }}>{s.payer?.name || 'User'}</span> paid <span style={{ color: 'var(--accent-emerald)' }}>{s.payee?.name || 'User'}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📅 {new Date(s.date).toLocaleString('en-IN')} {s.notes && `• Memo: "${s.notes}"`}
                    </div>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                    ₹{s.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Settle Modal */}
      <SettleModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        group={group}
        simplifiedDebts={simplifiedDebts}
        currentUserId={currentUserId}
        onSettlementAdded={() => fetchGroupDetail(true)}
      />
    </div>
  );
};

export default GroupDetail;
