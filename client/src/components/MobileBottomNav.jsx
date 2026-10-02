import React from 'react';
import { Users, User, PlusCircle, Scale, Activity } from 'lucide-react';

const MobileBottomNav = ({ activeTab, onTabChange, onOpenAddExpense }) => {
  return (
    <div className="mobile-bottom-nav">
      <button
        className={`mobile-nav-item ${activeTab === 'groups' ? 'active' : ''}`}
        onClick={() => onTabChange('groups')}
      >
        <Users size={20} />
        <span>Groups</span>
      </button>

      <button
        className="mobile-nav-fab"
        onClick={() => onOpenAddExpense(null)}
        title="Add Expense"
      >
        <PlusCircle size={26} color="#FFF" />
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
        onClick={() => onTabChange('personal')}
      >
        <User size={20} />
        <span>Personal</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;
