import User from './models/User.js';
import Group from './models/Group.js';
import Expense from './models/Expense.js';
import Settlement from './models/Settlement.js';
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

  await Expense.create({
    title: 'Electricity & Gas Bill',
    totalAmount: 2200.00,
    category: 'Rent & Utilities',
    paidBy: alex._id,
    groupId: null,
    splitType: 'equal',
    participants: [{ user: alex._id, amount: 2200.00, percentage: 100 }],
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: 'Monthly utility bill'
  });

  // Demo Group 1: Goa Beach Trip 🏖️ (in ₹ Rupees)
  const beachTrip = await Group.create({
    name: 'Goa Weekend Trip 🏖️',
    description: 'Beach resort, seafood dinners, water sports, and scooty rentals',
    category: 'Trip & Vacation',
    creator: alex._id,
    members: [alex._id, sarah._id, mike._id, rachel._id]
  });

  // Expense 1: Villa Rental paid by Alex (₹12,000 equal 4 ways = ₹3,000 each)
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

  // Expense 2: Dinner paid by Sarah (₹3,600 equal 4 ways = ₹900 each)
  const dinnerSplit = calculateSplit(3600, 'equal', [
    { user: alex._id }, { user: sarah._id }, { user: mike._id }, { user: rachel._id }
  ], sarah._id);

  await Expense.create({
    title: 'Seafood Grill & Drinks',
    totalAmount: 3600.00,
    category: 'Food & Drink',
    paidBy: sarah._id,
    groupId: beachTrip._id,
    splitType: 'equal',
    participants: dinnerSplit,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: 'Dinner at Britto Beach Shack'
  });

  // Expense 3: Water sports paid by Mike (₹4,800 exact split)
  const boatSplit = calculateSplit(4800, 'exact', [
    { user: alex._id, amount: 1600 },
    { user: sarah._id, amount: 1600 },
    { user: mike._id, amount: 1600 }
  ], mike._id);

  await Expense.create({
    title: 'Parasailing & Jet Ski',
    totalAmount: 4800.00,
    category: 'Entertainment',
    paidBy: mike._id,
    groupId: beachTrip._id,
    splitType: 'exact',
    participants: boatSplit,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: 'Calangute beach water sports'
  });

  // Settlement: Sarah paid Alex ₹1,000 towards debts
  await Settlement.create({
    payer: sarah._id,
    payee: alex._id,
    amount: 1000.00,
    groupId: beachTrip._id,
    notes: 'Partial GPay transfer'
  });

  // Demo Group 2: Apartment 4B
  const apartment = await Group.create({
    name: 'Apartment 4B Roomies 🏢',
    description: 'Shared household expenses, WiFi, maid charges',
    category: 'Home & Apartment',
    creator: alex._id,
    members: [alex._id, sarah._id]
  });

  const wifiSplit = calculateSplit(1499, 'equal', [
    { user: alex._id }, { user: sarah._id }
  ], alex._id);

  await Expense.create({
    title: 'JioFiber Unlimited WiFi',
    totalAmount: 1499.00,
    category: 'Rent & Utilities',
    paidBy: alex._id,
    groupId: apartment._id,
    splitType: 'equal',
    participants: wifiSplit,
    date: new Date(),
    notes: 'Monthly 300 Mbps broadband'
  });

  console.log('✅ Demo data successfully seeded in ₹ Rupees!');
  return {
    demoUser: { email: 'alex@example.com', password: 'password123' },
    usersCreated: 4,
    groupsCreated: 2
  };
};

export default seedData;
