import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

const purchaseListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a list name'],
    trim: true,
    maxlength: [80, 'List name cannot exceed 80 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null // Optional: null means standalone list
  },
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    default: null // Set when list is converted/added to a group expense
  },
  items: [itemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PurchaseList = mongoose.model('PurchaseList', purchaseListSchema);
export default PurchaseList;
