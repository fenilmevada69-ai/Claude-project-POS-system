const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet', 'split'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
      default: 'completed',
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customer: {
      name: { type: String, default: 'Walk-in Customer' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    note: { type: String, default: '' },
    refundReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate order number before save
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
