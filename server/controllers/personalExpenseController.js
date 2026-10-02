import Expense from '../models/Expense.js';
import { calculateSplit } from '../utils/moneyHelper.js';

// @desc    Get all personal expenses of authenticated user
// @route   GET /api/expenses/personal
export const getPersonalExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      paidBy: req.user.id,
      groupId: null
    }).sort({ date: -1 });

    const totalPersonalSpent = expenses.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalSpent: Math.round(totalPersonalSpent * 100) / 100,
      expenses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create personal expense
// @route   POST /api/expenses/personal
export const createPersonalExpense = async (req, res) => {
  try {
    const { title, totalAmount, category, date, notes } = req.body;

    if (!title || !totalAmount) {
      return res.status(400).json({ success: false, error: 'Title and total amount are required' });
    }

    const participants = calculateSplit(
      totalAmount,
      'equal',
      [{ user: req.user.id }],
      req.user.id
    );

    const expense = await Expense.create({
      title,
      totalAmount: Number(totalAmount),
      category: category || 'General',
      paidBy: req.user.id,
      groupId: null,
      splitType: 'equal',
      participants,
      date: date || Date.now(),
      notes: notes || ''
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update personal expense
// @route   PUT /api/expenses/personal/:id
export const updatePersonalExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    // Verify ownership and that it is a personal expense
    if (expense.paidBy.toString() !== req.user.id || expense.groupId !== null) {
      return res.status(403).json({ success: false, error: 'Not authorized to edit this personal expense' });
    }

    const { title, totalAmount, category, date, notes } = req.body;

    if (totalAmount) {
      expense.participants = calculateSplit(
        totalAmount,
        'equal',
        [{ user: req.user.id }],
        req.user.id
      );
      expense.totalAmount = Number(totalAmount);
    }

    if (title) expense.title = title;
    if (category) expense.category = category;
    if (date) expense.date = date;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    res.status(200).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete personal expense
// @route   DELETE /api/expenses/personal/:id
export const deletePersonalExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    if (expense.paidBy.toString() !== req.user.id || expense.groupId !== null) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
