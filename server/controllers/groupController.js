import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import User from '../models/User.js';
import { calculateGroupBalances } from '../utils/debtSimplifier.js';
import { calculateSplit } from '../utils/moneyHelper.js';

// @desc    Create a new expense group
// @route   POST /api/groups
export const createGroup = async (req, res) => {
  try {
    const { name, description, category, memberEmails } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Group name is required' });
    }

    const memberIds = [req.user.id];

    // Optional: resolve additional member emails to User ObjectIds
    if (Array.isArray(memberEmails) && memberEmails.length > 0) {
      const foundUsers = await User.find({
        email: { $in: memberEmails.map(e => e.toLowerCase().trim()) }
      }).select('_id');

      foundUsers.forEach(u => {
        if (!memberIds.includes(u._id.toString())) {
          memberIds.push(u._id.toString());
        }
      });
    }

    const group = await Group.create({
      name,
      description: description || '',
      category: category || 'Other',
      creator: req.user.id,
      members: memberIds
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(201).json({ success: true, group: populatedGroup });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all groups where the authenticated user is a member
// @route   GET /api/groups
export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: groups.length, groups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single group details + expenses + settlements + debt simplification
// @route   GET /api/groups/:id
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Verify user is a member
    const isMember = group.members.some(m => m._id.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ success: false, error: 'Access denied. You are not a member of this group.' });
    }

    const expenses = await Expense.find({ groupId: group._id })
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ date: -1 });

    const settlements = await Settlement.find({ groupId: group._id })
      .populate('payer', 'name email avatar')
      .populate('payee', 'name email avatar')
      .sort({ date: -1 });

    // Run Core Debt Simplification Engine
    const { netBalances, simplifiedDebts, totalGroupSpending } = calculateGroupBalances(
      group.members,
      expenses,
      settlements
    );

    res.status(200).json({
      success: true,
      group,
      totalGroupSpending,
      netBalances,
      simplifiedDebts,
      expenses,
      settlements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add member to existing group
// @route   POST /api/groups/:id/members
export const addGroupMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required to add member' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Verify requesting user is in group
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to add members to this group' });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() }).select('_id name email avatar');
    if (!userToAdd) {
      return res.status(404).json({ success: false, error: `No user found with email ${email}` });
    }

    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json({ success: false, error: 'User is already a member of this group' });
    }

    group.members.push(userToAdd._id);
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(200).json({ success: true, group: updatedGroup, addedUser: userToAdd });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a group expense
// @route   POST /api/groups/:id/expenses
export const addGroupExpense = async (req, res) => {
  try {
    const { title, totalAmount, category, paidBy, splitType, participantsInput, date, notes } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to post to this group' });
    }

    const actualPaidBy = paidBy || req.user.id;
    const type = splitType || 'equal';

    // Default participants to all group members if not provided
    let rawParticipants = participantsInput;
    if (!rawParticipants || rawParticipants.length === 0) {
      rawParticipants = group.members.map(m => ({ user: m.toString() }));
    }

    // Process & calculate exact penny split precision + remainder assignment
    const formattedParticipants = calculateSplit(
      totalAmount,
      type,
      rawParticipants,
      actualPaidBy
    );

    const expense = await Expense.create({
      title,
      totalAmount: Number(totalAmount),
      category: category || 'General',
      paidBy: actualPaidBy,
      groupId: group._id,
      splitType: type,
      participants: formattedParticipants,
      date: date || Date.now(),
      notes: notes || ''
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    res.status(201).json({ success: true, expense: populatedExpense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
