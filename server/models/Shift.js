const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    terminal: {
      type: String,
      default: 'POS-01',
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    openingCash: {
      type: Number,
      default: 0,
    },
    closingCash: {
      type: Number,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalCash: {
      type: Number,
      default: 0,
    },
    totalCard: {
      type: Number,
      default: 0,
    },
    totalUPI: {
      type: Number,
      default: 0,
    },
    totalWallet: {
      type: Number,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
    },
    expenses: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shift', shiftSchema);
