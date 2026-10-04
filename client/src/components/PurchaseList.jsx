import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingCart, Plus, CheckSquare, Square, Trash2, FolderPlus, ArrowRight } from 'lucide-react';

const PurchaseList = ({ groups = [], onConvertListToExpense }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // New List Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListGroupId, setNewListGroupId] = useState('');
  const [createErr, setCreateErr] = useState('');

  // Item Input State per List (listId => text)
  const [itemInputs, setItemInputs] = useState({});

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await api.getUserLists();
      if (res && res.success && Array.isArray(res.lists)) {
        setLists(res.lists);
      } else {
        setLists([]);
      }
    } catch (err) {
      console.warn('Fetch lists note:', err.message);
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setCreateErr('');
    try {
      await api.createList({
        name: newListName.trim(),
        groupId: newListGroupId || null
      });
      setNewListName('');
      setNewListGroupId('');
      setShowCreateModal(false);
      fetchLists();
    } catch (err) {
      setCreateErr(err.message);
    }
  };

  const handleAddItem = async (listId, e) => {
    e.preventDefault();
    const title = itemInputs[listId] || '';
    if (!title.trim()) return;

    try {
      await api.addItemToList(listId, title.trim());
      setItemInputs({ ...itemInputs, [listId]: '' });
      fetchLists();
    } catch (err) {
      console.warn('Add item error:', err.message);
    }
  };

  const handleToggleItem = async (listId, itemId) => {
    try {
      await api.toggleItemInList(listId, itemId);
      fetchLists();
    } catch (err) {
      console.warn('Toggle item error:', err.message);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Delete this entire purchase list?')) return;
    try {
      await api.deleteList(listId);
      fetchLists();
    } catch (err) {
      console.warn('Delete list error:', err.message);
    }
  };

  const handleDeleteItem = async (listId, itemId) => {
    try {
      await api.deleteItemFromList(listId, itemId);
      fetchLists();
    } catch (err) {
      console.warn('Delete item error:', err.message);
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} color="var(--accent-primary)" /> Shopping Lists
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Create multiple checklists & convert any list to a group expense
            </p>
          </div>

          <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ padding: '6px 12px', fontSize: '0.82rem', minHeight: '36px' }}>
            <FolderPlus size={16} /> New List
          </button>
        </div>
      </div>

      {/* Modal to Create New Named List */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Create New Purchase List</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {createErr && <div style={{ color: '#E11D48', fontSize: '0.8rem', marginBottom: '10px' }}>{createErr}</div>}

            <form onSubmit={handleCreateList}>
              <div className="form-group">
                <label className="form-label">List Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Goa Snacks, Party Groceries, House Items"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link to Group (Optional)</label>
                <select
                  className="form-select"
                  value={newListGroupId}
                  onChange={(e) => setNewListGroupId(e.target.value)}
                >
                  <option value="">Personal List (No Group)</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>Group: {g.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Create List
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Render Multiple Purchase Lists */}
      {(() => {
        const safeLists = Array.isArray(lists) ? lists : [];
        if (loading && safeLists.length === 0) {
          return <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading purchase lists...</div>;
        }
        if (safeLists.length === 0) {
          return (
            <div className="glass-card" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShoppingCart size={36} color="var(--text-dim)" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>No purchase lists created yet</h3>
              <p style={{ fontSize: '0.78rem', marginBottom: '14px' }}>Create lists for groceries, trip items, or party shopping!</p>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                <FolderPlus size={15} /> Create First List
              </button>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {safeLists.map(list => {
              const completedCount = (list.items || []).filter(i => i.completed).length;
              const groupName = list.groupId ? list.groupId.name : 'Personal';
              const isLocked = !!list.expenseId;

              return (
                <div key={list._id} className="glass-card" style={{ padding: '16px', opacity: isLocked ? 0.9 : 1 }}>
                  {/* List Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: list.groupId ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        🏷️ {groupName}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {list.name}
                        {isLocked && (
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#475569', background: '#E2E8F0', padding: '2px 8px', borderRadius: '6px' }}>
                            🔒 Logged as Expense
                          </span>
                        )}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-emerald)', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                        {completedCount}/{list.items.length} Checked
                      </span>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => handleDeleteList(list._id)}
                          style={{ background: 'none', color: 'var(--text-dim)', padding: '2px' }}
                          title="Delete list"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Checklist Items */}
                  {list.items.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                      No items in this list yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      {list.items.map(item => (
                        <div
                          key={item._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: item.completed ? '#F8FAFC' : '#F1F5F9',
                            borderRadius: '8px',
                            opacity: item.completed ? 0.7 : 1
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (isLocked) {
                                  alert('This list has been converted to an expense and is locked.');
                                  return;
                                }
                                handleToggleItem(list._id, item._id);
                              }}
                              disabled={isLocked}
                              style={{
                                background: 'none',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                color: item.completed ? 'var(--accent-emerald)' : 'var(--text-muted)',
                                cursor: isLocked ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {item.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>

                            <span style={{
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              textDecoration: item.completed ? 'line-through' : 'none',
                              color: item.completed ? 'var(--text-muted)' : 'var(--text-main)',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden'
                            }}>
                              {item.title}
                            </span>
                          </div>

                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(list._id, item._id)}
                              style={{ background: 'none', color: 'var(--text-dim)', padding: '2px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Item Input (ONLY if NOT locked) */}
                  {isLocked ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px', background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                      🔒 This list has been logged as an expense and is locked.
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleAddItem(list._id, e)} style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, minHeight: '34px', padding: '4px 10px', fontSize: '0.82rem' }}
                        placeholder="Add item (e.g. Milk, Water bottles)..."
                        value={itemInputs[list._id] || ''}
                        onChange={(e) => setItemInputs({ ...itemInputs, [list._id]: e.target.value })}
                      />
                      <button type="submit" className="btn-secondary" style={{ minHeight: '34px', padding: '4px 10px', fontSize: '0.78rem' }}>
                        <Plus size={13} /> Add
                      </button>
                    </form>
                  )}

                  {/* Action: Convert Entire List to Group/Personal Expense */}
                  {isLocked ? (
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled
                      style={{ width: '100%', minHeight: '36px', padding: '6px', fontSize: '0.8rem', opacity: 0.75, cursor: 'not-allowed', justifyContent: 'center' }}
                    >
                      ✓ Logged as Expense (Locked)
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ width: '100%', minHeight: '36px', padding: '6px', fontSize: '0.8rem', gap: '6px' }}
                      onClick={() => {
                        if (onConvertListToExpense) {
                          onConvertListToExpense(
                            list.groupId ? 'group' : 'personal',
                            list.groupId?._id || list.groupId || null,
                            list.name,
                            list._id
                          );
                        }
                      }}
                    >
                      <Plus size={14} /> Add List as Expense (Pre-fills "{list.name}") <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              );
            })}
        </div>
        );
      })()}
    </div>
  );
};

export default PurchaseList;
