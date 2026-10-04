import React from 'react';
import { Users, User, PlusCircle, ShoppingCart } from 'lucide-react';

const MobileBottomNav = ({ activeTab, onTabChange, onOpenAddExpense }) => {
  return (
    <div className="mobile-bottom-nav">
      <button
        className={`mobile-nav-item ${activeTab === 'groups' ? 'active' : ''}`}
        onClick={() => onTabChange('groups')}
      >
        <Users size={18} />
        <span>Groups</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
        onClick={() => onTabChange('personal')}
      >
        <User size={18} />
        <span>Solo</span>
      </button>

      <button
        className="mobile-nav-fab"
        onClick={() => onOpenAddExpense(null)}
        title="Add Expense"
      >
        <PlusCircle size={24} color="#FFF" />
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'purchases' ? 'active' : ''}`}
        onClick={() => onTabChange('purchases')}
      >
        <ShoppingCart size={18} />
        <span>Shopping</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;
