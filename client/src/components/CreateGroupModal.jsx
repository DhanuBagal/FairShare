import React, { useState } from 'react';
import { api } from '../services/api';
import { Users, Plus, Mail } from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trip & Vacation');
  const [memberEmailInput, setMemberEmailInput] = useState('');
  const [memberEmails, setMemberEmails] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddEmail = () => {
    if (!memberEmailInput || !memberEmailInput.includes('@')) {
      setErrorMsg('Please enter a valid email to add member');
      return;
    }
    if (memberEmails.includes(memberEmailInput.toLowerCase().trim())) {
      setErrorMsg('Member email already added');
      return;
    }
    setMemberEmails([...memberEmails, memberEmailInput.toLowerCase().trim()]);
    setMemberEmailInput('');
    setErrorMsg('');
  };

  const handleRemoveEmail = (email) => {
    setMemberEmails(memberEmails.filter(e => e !== email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Group name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createGroup({
        name,
        description,
        category,
        memberEmails
      });
      onGroupCreated();
      onClose();
      setName('');
      setDescription('');
      setMemberEmails([]);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} color="var(--accent-primary)" /> Create Expense Group
          </h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#FDA4AF', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Group Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Summer Vacation, Roommates 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Trip & Vacation">Trip & Vacation 🏖️</option>
              <option value="Home & Apartment">Home & Apartment 🏢</option>
              <option value="Event & Party">Event & Party 🎉</option>
              <option value="Project">Project 💻</option>
              <option value="Other">Other 📦</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Details</label>
            <input
              type="text"
              className="form-input"
              placeholder="Brief description of shared expenses"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Add Initial Member Emails</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="friend@example.com"
                value={memberEmailInput}
                onChange={(e) => setMemberEmailInput(e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddEmail}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {memberEmails.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {memberEmails.map(email => (
                  <span key={email} style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} /> {email}
                    <button type="button" onClick={() => handleRemoveEmail(email)} style={{ background: 'none', color: '#FDA4AF' }}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '12px' }}
          >
            {isSubmitting ? 'Creating Group...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
