import User from './models/User.js';
import Group from './models/Group.js';
import Expense from './models/Expense.js';
import Settlement from './models/Settlement.js';
import PurchaseList from './models/PurchaseList.js';
import { calculateSplit } from './utils/moneyHelper.js';

const seedData = async () => {
  const existingUsersCount = await User.countDocuments();
  if (existingUsersCount > 0) {
    console.log('🌱 Database already contains data. Skipping initial auto-seed.');
    return { skipped: true };
  }

  console.log('🌱 Seeding demo data for FairShare (in ₹ Rupees)...');

  // Create Demo Users
  const alex = await User.create({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'password123',
    avatar: 'avatar-blue'
  });

  const sarah = await User.create({
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    password: 'password123',
    avatar: 'avatar-purple'
  });

  const mike = await User.create({
    name: 'Mike Ross',
    email: 'mike@example.com',
    password: 'password123',
    avatar: 'avatar-emerald'
  });

  const rachel = await User.create({
    name: 'Rachel Zane',
    email: 'rachel@example.com',
    password: 'password123',
    avatar: 'avatar-amber'
  });

  // Personal Expenses for Alex (in ₹ Rupees)
  await Expense.create({
    title: 'Weekly Grocery Shopping',
    totalAmount: 4500.00,
    category: 'Food & Drink',
    paidBy: alex._id,
    groupId: null,
    splitType: 'equal',
    participants: [{ user: alex._id, amount: 4500.00, percentage: 100 }],
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Organic vegetables & household supplies'
  });

  // Demo Group 1: Goa Beach Trip 🏖️ (in ₹ Rupees)
  const beachTrip = await Group.create({
    name: 'Goa Weekend Trip 🏖️',
    description: 'Beach resort, seafood dinners, water sports, and scooty rentals',
    category: 'Trip & Vacation',
    creator: alex._id,
    members: [alex._id, sarah._id, mike._id, rachel._id]
  });

  // Expense 1: Villa Rental paid by Alex
  const villaSplit = calculateSplit(12000, 'equal', [
    { user: alex._id }, { user: sarah._id }, { user: mike._id }, { user: rachel._id }
  ], alex._id);

  await Expense.create({
    title: 'Beachside Villa Rental',
    totalAmount: 12000.00,
    category: 'Rent & Utilities',
    paidBy: alex._id,
    groupId: beachTrip._id,
    splitType: 'equal',
    participants: villaSplit,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    notes: '3 nights stay with pool'
  });

  // Settlement: Sarah paid Alex ₹1,000 towards debts
  await Settlement.create({
    payer: sarah._id,
    payee: alex._id,
    amount: 1000.00,
    groupId: beachTrip._id,
    notes: 'Partial GPay transfer'
  });

  // Seed Named Purchase Lists (no estimated prices, title only checklist!)
  await PurchaseList.create({
    name: 'Goa Beach Party Snacks & Drinks 🏖️',
    creator: alex._id,
    groupId: beachTrip._id,
    items: [
      { title: 'Mineral Water Crate (24-pack)', completed: true, completedBy: alex._id },
      { title: 'Sunscreen Lotion SPF 50', completed: false },
      { title: 'Beach Towels & Waterproof Bag', completed: false }
    ]
  });

  await PurchaseList.create({
    name: 'Weekend Grocery Checklist 🛒',
    creator: alex._id,
    groupId: null, // Personal standalone purchase list
    items: [
      { title: 'Oat Milk & Almond Butter', completed: false },
      { title: 'Fresh Organic Apples & Bananas', completed: true, completedBy: alex._id },
      { title: 'Whole Wheat Bread', completed: false }
    ]
  });

  console.log('✅ Demo data successfully seeded with expenses, settlements & named purchase lists!');
  return {
    demoUser: { email: 'alex@example.com', password: 'password123' },
    usersCreated: 4,
    groupsCreated: 1
  };
};

export default seedData;
