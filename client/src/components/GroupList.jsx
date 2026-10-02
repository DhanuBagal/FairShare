import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CreateGroupModal from './CreateGroupModal';
import { Users, Plus, ChevronRight, Folder, ShieldCheck } from 'lucide-react';

const GroupList = ({ onSelectGroup, onOpenAddExpense }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.getMyGroups();
      if (res.success) {
        setGroups(res.groups);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="var(--accent-primary)" /> My Expense Groups
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Shared groups with friends, roommates, and travel partners with real-time min-cash-flow debt resolution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} /> Create New Group
          </button>
          <button className="btn-primary" onClick={() => onOpenAddExpense(null)}>
            <Plus size={18} /> Log Shared Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading expense groups...</div>
      ) : error ? (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#FDA4AF', padding: '16px', borderRadius: '12px' }}>⚠️ {error}</div>
      ) : groups.length === 0 ? (
        <div className="glass-card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Folder size={48} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>You aren't in any groups yet</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>Create a group for trips, rent, or events to start splitting bills easily.</p>
          <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {groups.map(group => (
            <div
              key={group._id}
              className="glass-card"
              style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              onClick={() => onSelectGroup(group._id)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {group.category}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {group.name}
                    </h3>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>

                {group.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {group.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: '12px', borderTop: '1px solid var(--border-subtle)', marginTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {group.members.slice(0, 4).map(m => (
                    <div key={m._id} title={m.name} className={`avatar-circle ${m.avatar || 'avatar-blue'}`} style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {group.members.length > 4 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{group.members.length - 4}</span>
                  )}
                </div>

                <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                  View Balances & Debts →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={fetchGroups}
      />
    </div>
  );
};

export default GroupList;
