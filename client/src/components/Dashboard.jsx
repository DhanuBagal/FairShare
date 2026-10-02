import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PersonalExpenses from './PersonalExpenses';
import GroupList from './GroupList';
import GroupDetail from './GroupDetail';
import AddExpenseModal from './AddExpenseModal';
import MobileBottomNav from './MobileBottomNav';
import { api } from '../services/api';
import { Users, User } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('groups'); // 'personal' | 'groups'
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([]);

  // Data refresh trigger counter to instantly sync lists after adding expenses
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add Expense modal state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [addExpenseLockedScope, setAddExpenseLockedScope] = useState(null); // 'personal' | 'group' | null
  const [addExpenseDefaultGroupId, setAddExpenseDefaultGroupId] = useState('');

  const fetchUserGroups = async () => {
    try {
      const res = await api.getMyGroups();
      if (res.success) {
        setGroups(res.groups);
      }
    } catch (err) {
      console.warn('Dashboard fetch groups note:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    }
  }, [user, refreshTrigger]);

  const handleOpenAddExpense = (scope = null, groupId = null) => {
    if (selectedGroupId && !groupId) {
      groupId = selectedGroupId;
      scope = 'group';
    } else if (activeTab === 'personal' && !scope) {
      scope = 'personal';
    }

    setAddExpenseLockedScope(scope);
    setAddExpenseDefaultGroupId(groupId || '');
    setIsAddExpenseOpen(true);
  };

  // Called whenever any expense (Personal or Group) is added
  const handleExpenseAdded = () => {
    fetchUserGroups();
    setRefreshTrigger(prev => prev + 1); // Trigger immediate refresh across active views!
  };

  return (
    <div>
      {/* Top Mobile Tabs Segment */}
      {!selectedGroupId && (
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <Users size={15} /> Shared Groups
          </button>

          <button
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <User size={15} /> Solo Expenses
          </button>
        </div>
      )}

      {/* Main Screen Content */}
      {selectedGroupId ? (
        <GroupDetail
          groupId={selectedGroupId}
          onBack={() => setSelectedGroupId(null)}
          currentUserId={user?._id}
          refreshTrigger={refreshTrigger}
          onOpenAddExpense={(scope, gid) => handleOpenAddExpense(scope, gid)}
        />
      ) : activeTab === 'groups' ? (
        <GroupList
          onSelectGroup={(id) => setSelectedGroupId(id)}
          onOpenAddExpense={(scope, gid) => handleOpenAddExpense(scope, gid)}
        />
      ) : (
        <PersonalExpenses
          refreshTrigger={refreshTrigger}
          onOpenAddModal={(scope, gid) => handleOpenAddExpense(scope, gid)}
        />
      )}

      {/* Global Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groups={groups}
        defaultGroupId={addExpenseDefaultGroupId}
        lockedScope={addExpenseLockedScope}
        currentUserId={user?._id}
        onExpenseAdded={handleExpenseAdded}
      />

      {/* Native Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedGroupId(null);
          setActiveTab(tab);
        }}
        onOpenAddExpense={() => handleOpenAddExpense(activeTab === 'personal' ? 'personal' : (selectedGroupId ? 'group' : null), selectedGroupId)}
      />
    </div>
  );
};

export default Dashboard;
