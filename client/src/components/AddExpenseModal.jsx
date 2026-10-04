import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlusCircle, Users, User, AlertCircle, CreditCard } from 'lucide-react';

const AddExpenseModal = ({
  isOpen,
  onClose,
  groups = [],
  defaultGroupId = '',
  lockedScope = null, // 'personal' | 'group' | null
  currentUserId = '',
  prefilledTitle = '',
  purchaseListId = '',
  onExpenseAdded
}) => {
  const isPersonalLocked = lockedScope === 'personal';
  const isGroupLocked = lockedScope === 'group' || !!defaultGroupId;

  const [expenseType, setExpenseType] = useState(isPersonalLocked ? 'personal' : 'group');
  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId || '');
  const [title, setTitle] = useState(prefilledTitle || '');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUserId || '');
  const [category, setCategory] = useState('General');
  const [splitType, setSplitType] = useState('equal');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedGroupObj, setSelectedGroupObj] = useState(null);
  const [participantSplits, setParticipantSplits] = useState({});

  useEffect(() => {
    if (isOpen && prefilledTitle) {
      setTitle(prefilledTitle);
    }
  }, [isOpen, prefilledTitle]);

  useEffect(() => {
    if (isPersonalLocked) {
      setExpenseType('personal');
    } else if (isGroupLocked) {
      setExpenseType('group');
      if (defaultGroupId) {
        setSelectedGroupId(defaultGroupId);
      }
    }
  }, [lockedScope, defaultGroupId, isPersonalLocked, isGroupLocked]);

  // Resolve group object from groups array whenever selectedGroupId or defaultGroupId changes
  useEffect(() => {
    const targetId = selectedGroupId || defaultGroupId;
    if (targetId && groups.length > 0) {
      const g = groups.find(item => item._id.toString() === targetId.toString());
      if (g) {
        setSelectedGroupObj(g);
        if (g.members) {
          const initial = {};
          g.members.forEach(m => {
            initial[m._id] = '';
          });
          setParticipantSplits(initial);
        }
      }
    }
  }, [selectedGroupId, defaultGroupId, groups]);

  // Ensure default paidBy is set to logged in user
  useEffect(() => {
    if (currentUserId) {
      setPaidBy(currentUserId);
    }
  }, [currentUserId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter an expense title');
      return;
    }

    const numAmount = parseFloat(totalAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid Rupee amount');
      return;
    }

    setIsSubmitting(true);

    try {
      if (expenseType === 'personal') {
        await api.createPersonalExpense({
          title,
          totalAmount: numAmount,
          category,
          notes,
          purchaseListId: purchaseListId || null
        });
      } else {
        const targetGroupId = selectedGroupId || defaultGroupId;
        if (!targetGroupId) {
          throw new Error('Please select a group for this expense');
        }

        let participantsInput = [];
        if (selectedGroupObj && selectedGroupObj.members) {
          if (splitType === 'equal') {
            participantsInput = selectedGroupObj.members.map(m => ({ user: m._id }));
          } else if (splitType === 'exact') {
            participantsInput = selectedGroupObj.members.map(m => ({
              user: m._id,
              amount: parseFloat(participantSplits[m._id] || 0)
            }));
          } else if (splitType === 'percentage') {
            participantsInput = selectedGroupObj.members.map(m => ({
              user: m._id,
              percentage: parseFloat(participantSplits[m._id] || 0)
            }));
          }
        }

        await api.addGroupExpense(targetGroupId, {
          title,
          totalAmount: numAmount,
          category,
          paidBy: paidBy || currentUserId, // Send selected paidBy user ID
          splitType,
          participantsInput,
          notes,
          purchaseListId: purchaseListId || null
        });
      }

      onExpenseAdded();
      onClose();
      setTitle('');
      setTotalAmount('');
      setNotes('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMembersList = selectedGroupObj?.members || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={20} color="var(--accent-primary)" />
            {isPersonalLocked ? 'Add Solo Expense' : (selectedGroupObj ? `Add Expense (${selectedGroupObj.name})` : 'Add Expense')}
          </h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#FDA4AF', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Scope Selector (ONLY if un-locked) */}
          {!isPersonalLocked && !isGroupLocked && (
            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`tab-btn ${expenseType === 'group' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '8px' }}
                  onClick={() => setExpenseType('group')}
                >
                  <Users size={15} /> Group Shared
                </button>
                <button
                  type="button"
                  className={`tab-btn ${expenseType === 'personal' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '8px' }}
                  onClick={() => setExpenseType('personal')}
                >
                  <User size={15} /> Personal Solo
                </button>
              </div>
            </div>
          )}

          {/* Group Selector (ONLY if un-locked) */}
          {expenseType === 'group' && !defaultGroupId && (
            <div className="form-group">
              <label className="form-label">Select Group</label>
              <select
                className="form-select"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                required
              >
                <option value="">-- Choose group --</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Expense Description */}
          <div className="form-group">
            <label className="form-label">Expense Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dinner, Grocery, Rent bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Total Amount (₹) */}
          <div className="form-group">
            <label className="form-label">Total Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              placeholder="₹0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
          </div>

          {/* PAID BY Dropdown Selector (Explicit User Requirement) */}
          {expenseType === 'group' && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CreditCard size={14} color="var(--accent-primary)" /> Paid By (Who paid for this?)
              </label>
              <select
                className="form-select"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                required
              >
                {currentMembersList.length > 0 ? (
                  currentMembersList.map(member => (
                    <option key={member._id} value={member._id}>
                      {member._id === currentUserId ? `You (${member.name})` : member.name}
                    </option>
                  ))
                ) : (
                  <option value={currentUserId}>You</option>
                )}
              </select>
            </div>
          )}

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">General 📦</option>
              <option value="Food & Drink">Food & Drink 🍔</option>
              <option value="Rent & Utilities">Rent & Utilities ⚡</option>
              <option value="Entertainment">Entertainment 🎟️</option>
              <option value="Travel">Travel ✈️</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {isSubmitting ? 'Saving...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
