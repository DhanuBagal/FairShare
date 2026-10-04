import PurchaseItem from '../models/PurchaseItem.js';
import Group from '../models/Group.js';

// @desc    Get all purchase list items for authenticated user (Personal + Groups)
// @route   GET /api/purchases
export const getUserPurchases = async (req, res) => {
  try {
    // Find groups where user is a member
    const userGroups = await Group.find({ members: req.user.id }).select('_id');
    const groupIds = userGroups.map(g => g._id);

    // Fetch items added by user OR belonging to user's groups
    const items = await PurchaseItem.find({
      $or: [
        { addedBy: req.user.id },
        { groupId: { $in: groupIds } }
      ]
    })
      .populate('addedBy', 'name email avatar')
      .populate('purchasedBy', 'name email avatar')
      .populate('groupId', 'name category')
      .sort({ purchased: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, purchases: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add standalone or group purchase item
// @route   POST /api/purchases
export const addPurchaseItem = async (req, res) => {
  try {
    const { title, estimatedPrice, groupId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Item title is required' });
    }

    const item = await PurchaseItem.create({
      title: title.trim(),
      estimatedPrice: Number(estimatedPrice || 0),
      groupId: groupId || null,
      addedBy: req.user.id
    });

    const populatedItem = await PurchaseItem.findById(item._id)
      .populate('addedBy', 'name email avatar')
      .populate('purchasedBy', 'name email avatar')
      .populate('groupId', 'name category');

    res.status(201).json({ success: true, item: populatedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle purchased status (checkbox)
// @route   PATCH /api/purchases/:itemId/toggle
export const togglePurchaseItem = async (req, res) => {
  try {
    const item = await PurchaseItem.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Purchase item not found' });
    }

    item.purchased = !item.purchased;
    item.purchasedBy = item.purchased ? req.user.id : null;

    await item.save();

    const populatedItem = await PurchaseItem.findById(item._id)
      .populate('addedBy', 'name email avatar')
      .populate('purchasedBy', 'name email avatar')
      .populate('groupId', 'name category');

    res.status(200).json({ success: true, item: populatedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete purchase item
// @route   DELETE /api/purchases/:itemId
export const deletePurchaseItem = async (req, res) => {
  try {
    const item = await PurchaseItem.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Purchase item not found' });
    }

    await item.deleteOne();

    res.status(200).json({ success: true, message: 'Purchase item removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
