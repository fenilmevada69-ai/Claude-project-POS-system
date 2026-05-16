const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Create order
// @route   POST /api/orders
// @access  Protected
exports.createOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod, customer: customerData, note, discountAmount } = req.body;

    // Validate stock and calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      const itemSubtotal = product.price * item.quantity;
      const itemTax = (itemSubtotal * product.taxRate) / 100;
      subtotal += itemSubtotal;
      taxAmount += itemTax;

      processedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: product.price,
        taxRate: product.taxRate,
        discount: item.discount || 0,
        subtotal: itemSubtotal,
      });

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    const discount = discountAmount || 0;
    const total = subtotal + taxAmount - discount;

    const order = await Order.create({
      items: processedItems,
      subtotal,
      taxAmount,
      discountAmount: discount,
      total,
      paymentMethod,
      paymentStatus: 'completed',
      status: 'completed',
      cashier: req.user._id,
      customer: customerData || {},
      note,
    });

    // Update Customer loyalty points and stats
    if (customerData && customerData.phone) {
      const pointsEarned = Math.floor(total / 100);
      await Customer.findOneAndUpdate(
        { phone: customerData.phone },
        { 
          $inc: { 
            loyaltyPoints: pointsEarned,
            totalSpent: total,
            ordersCount: 1
          },
          $set: { lastVisit: new Date() }
        }
      );
    }

    const populated = await order.populate('cashier', 'name email');
    res.status(201).json({ success: true, order: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Protected
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentMethod, startDate, endDate, cashier } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (cashier) query.cashier = cashier;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('cashier', 'name email')
      .populate('items.product', 'name sku image')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: orders.length, total, pages: Math.ceil(total / limit), orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Protected
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cashier', 'name email')
      .populate('items.product', 'name sku image category');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund/cancel order
// @route   PATCH /api/orders/:id/refund
// @access  Admin / Manager
exports.refundOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status === 'refunded') return res.status(400).json({ success: false, message: 'Order already refunded' });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = 'refunded';
    order.paymentStatus = 'refunded';
    order.refundReason = reason || '';
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('cashier', 'name email')
      .populate('items.product', 'name sku image');

    res.json({ success: true, order: populatedOrder, message: 'Order refunded successfully' });
  } catch (error) {
    next(error);
  }
};
