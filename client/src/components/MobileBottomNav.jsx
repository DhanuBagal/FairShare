import React from 'react';
import { Users, User, ShoppingCart, Plus } from 'lucide-react';

const MobileBottomNav = ({ activeTab, onTabChange, onOpenAddExpense }) => {
  return (
    <div className="mobile-bottom-nav">
      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'groups' ? 'active' : ''}`}
        onClick={() => onTabChange('groups')}
      >
        <Users size={19} />
        <span>Groups</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
        onClick={() => onTabChange('personal')}
      >
        <User size={19} />
        <span>Solo</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'purchases' ? 'active' : ''}`}
        onClick={() => onTabChange('purchases')}
      >
        <ShoppingCart size={19} />
        <span>Shopping</span>
      </button>

      <button
        type="button"
        className="mobile-nav-add-btn"
        onClick={() => onOpenAddExpense(null)}
        title="Add Expense"
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;
