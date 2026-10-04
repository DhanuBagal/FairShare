import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide item title'],
    trim: true,
    maxlength: [100, 'Item title cannot exceed 100 characters']
  },
  estimatedPrice: {
    type: Number,
    min: 0,
    default: 0
  },
  purchased: {
    type: Boolean,
    default: false
  },
  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null // Optional: null means personal purchase item
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PurchaseItem = mongoose.model('PurchaseItem', purchaseItemSchema);
export default PurchaseItem;
