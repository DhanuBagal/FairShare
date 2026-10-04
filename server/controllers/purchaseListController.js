import PurchaseList from '../models/PurchaseList.js';
import Group from '../models/Group.js';

// @desc    Get all purchase lists for authenticated user (Personal + Groups)
// @route   GET /api/purchases
export const getUserLists = async (req, res) => {
  try {
    const userGroups = await Group.find({ members: req.user.id }).select('_id');
    const groupIds = userGroups.map(g => g._id);

    const lists = await PurchaseList.find({
      $or: [
        { creator: req.user.id },
        { groupId: { $in: groupIds } }
      ]
    })
      .populate('creator', 'name email avatar')
      .populate('groupId', 'name category')
      .populate('items.completedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: lists.length, lists });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new named purchase list
// @route   POST /api/purchases
export const createList = async (req, res) => {
  try {
    const { name, groupId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'List name is required' });
    }

    const newList = await PurchaseList.create({
      name: name.trim(),
      creator: req.user.id,
      groupId: groupId || null,
      items: []
    });

    const populatedList = await PurchaseList.findById(newList._id)
      .populate('creator', 'name email avatar')
      .populate('groupId', 'name category');

    res.status(201).json({ success: true, list: populatedList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add item to a purchase list (title only, no price)
// @route   POST /api/purchases/:listId/items
export const addItemToList = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Item title is required' });
    }

    const list = await PurchaseList.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Purchase list not found' });
    }

    list.items.push({
      title: title.trim(),
      completed: false
    });

    await list.save();

    const populatedList = await PurchaseList.findById(list._id)
      .populate('creator', 'name email avatar')
      .populate('groupId', 'name category')
      .populate('items.completedBy', 'name email avatar');

    res.status(200).json({ success: true, list: populatedList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle item completed status (checkbox)
// @route   PATCH /api/purchases/:listId/items/:itemId/toggle
export const toggleItemInList = async (req, res) => {
  try {
    const list = await PurchaseList.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Purchase list not found' });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found in list' });
    }

    item.completed = !item.completed;
    item.completedBy = item.completed ? req.user.id : null;

    await list.save();

    const populatedList = await PurchaseList.findById(list._id)
      .populate('creator', 'name email avatar')
      .populate('groupId', 'name category')
      .populate('items.completedBy', 'name email avatar');

    res.status(200).json({ success: true, list: populatedList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete entire purchase list
// @route   DELETE /api/purchases/:listId
export const deleteList = async (req, res) => {
  try {
    const list = await PurchaseList.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Purchase list not found' });
    }

    await list.deleteOne();
    res.status(200).json({ success: true, message: 'Purchase list deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete item from a list
// @route   DELETE /api/purchases/:listId/items/:itemId
export const deleteItemFromList = async (req, res) => {
  try {
    const list = await PurchaseList.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Purchase list not found' });
    }

    list.items.pull(req.params.itemId);
    await list.save();

    const populatedList = await PurchaseList.findById(list._id)
      .populate('creator', 'name email avatar')
      .populate('groupId', 'name category')
      .populate('items.completedBy', 'name email avatar');

    res.status(200).json({ success: true, list: populatedList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
