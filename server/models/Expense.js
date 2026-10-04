import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an expense title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please provide total amount'],
    min: [0.01, 'Amount must be greater than zero']
  },
  category: {
    type: String,
    enum: ['Food & Drink', 'Rent & Utilities', 'Entertainment', 'Travel', 'Shopping', 'General'],
    default: 'General'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null // Optional: null means personal expense
  },
  purchaseListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseList',
    default: null // Optional: linked purchase shopping list
  },
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'percentage'],
    default: 'equal'
  },
  participants: [participantSchema],
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
