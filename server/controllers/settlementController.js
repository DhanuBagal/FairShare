import Settlement from '../models/Settlement.js';
import Group from '../models/Group.js';

// @desc    Record a debt settlement between two group members
// @route   POST /api/groups/:id/settle
export const createSettlement = async (req, res) => {
  try {
    const { payeeId, amount, notes } = req.body;
    const groupId = req.params.id;

    if (!payeeId || !amount) {
      return res.status(400).json({ success: false, error: 'Payee user ID and settlement amount are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const payerId = req.user.id;

    if (payerId === payeeId) {
      return res.status(400).json({ success: false, error: 'Payer and payee cannot be the same user' });
    }

    const settlement = await Settlement.create({
      payer: payerId,
      payee: payeeId,
      amount: Number(amount),
      groupId,
      notes: notes || 'Settling up balance',
      date: Date.now()
    });

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('payer', 'name email avatar')
      .populate('payee', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Settlement logged successfully',
      settlement: populatedSettlement
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get settlement history for a group
// @route   GET /api/groups/:id/settle
export const getGroupSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({ groupId: req.params.id })
      .populate('payer', 'name email avatar')
      .populate('payee', 'name email avatar')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: settlements.length, settlements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
