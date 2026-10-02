import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Trash2, Plus, Tag } from 'lucide-react';

const PersonalExpenses = ({ refreshTrigger, onOpenAddModal }) => {
  const [expenses, setExpenses] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPersonalData = async (isSilent = false) => {
    try {
      if (!isSilent && expenses.length === 0) {
        setLoading(true);
      }
      const res = await api.getPersonalExpenses();
      if (res.success) {
        setExpenses(res.expenses);
        setTotalSpent(res.totalSpent);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalData(false);
  }, []);

  // Listen to refreshTrigger to instantly update personal list after adding an expense
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchPersonalData(true);
    }
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this personal expense?')) return;
    try {
      await api.deletePersonalExpense(id);
      fetchPersonalData(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Top Banner & Stats */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={18} color="var(--accent-primary)" /> Personal Solo Expenses
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Private expense log (groceries, personal bills)
            </p>
          </div>
          <button className="btn-primary" onClick={() => onOpenAddModal('personal', null)} style={{ padding: '6px 12px', fontSize: '0.82rem', minHeight: '34px' }}>
            <Plus size={15} /> Log Expense
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Personal Spending</span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {loading && expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading expenses...</div>
      ) : error ? (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#FDA4AF', padding: '12px', borderRadius: '12px' }}>⚠️ {error}</div>
      ) : expenses.length === 0 ? (
        <div className="glass-card" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShoppingBag size={36} color="var(--text-dim)" style={{ marginBottom: '8px' }} />
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>No personal expenses yet</h3>
          <p style={{ fontSize: '0.78rem', marginBottom: '14px' }}>Keep track of your individual daily spending here.</p>
          <button className="btn-primary" onClick={() => onOpenAddModal('personal', null)}>
            <Plus size={15} /> Log First Personal Expense
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {expenses.map(expense => (
            <div key={expense._id} className="glass-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Tag size={16} color="var(--accent-primary)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '2px' }}>{expense.title}</h4>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>🏷️ {expense.category}</span>
                    <span>📅 {new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  ₹{expense.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => handleDelete(expense._id)}
                  style={{ background: 'none', color: 'var(--text-dim)', padding: '4px' }}
                  title="Delete expense"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalExpenses;
