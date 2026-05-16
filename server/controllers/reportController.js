const Order = require('../models/Order');
const Product = require('../models/Product');
const { Parser } = require('json2csv');

// @desc    Get sales summary (dashboard KPIs)
// @route   GET /api/reports/summary
// @access  Protected
exports.getSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todayOrders, yesterdayOrders, totalProducts, lowStockItems] = await Promise.all([
      Order.find({ createdAt: { $gte: today }, status: 'completed' }),
      Order.find({ createdAt: { $gte: yesterday, $lt: today }, status: 'completed' }),
      Product.countDocuments({ isActive: true }),
      Product.find({ isActive: true, $expr: { $lte: ['$stock', '$lowStockThreshold'] } }).select('name stock sku image lowStockThreshold').lean(),
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueGrowth = yesterdayRevenue === 0 ? 100 : (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1);

    res.json({
      success: true,
      summary: {
        todayRevenue,
        todayOrders: todayOrders.length,
        revenueGrowth: Number(revenueGrowth),
        totalProducts,
        lowStockCount: lowStockItems.length,
        lowStockItems,
        avgOrderValue: todayOrders.length ? (todayRevenue / todayOrders.length).toFixed(2) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue chart data
// @route   GET /api/reports/revenue
// @access  Protected
exports.getRevenue = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrder: { $avg: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top products
// @route   GET /api/reports/top-products
// @access  Protected
exports.getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10, period = '7d' } = req.query;
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: Number(limit) },
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment method breakdown
// @route   GET /api/reports/payment-methods
// @access  Protected
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const days = period === '30d' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const breakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
    ]);

    res.json({ success: true, data: breakdown });
  } catch (error) {
    next(error);
  }
};
// @desc    Export sales to CSV
// @route   GET /api/reports/export/sales
// @access  Admin / Manager
exports.exportSalesCSV = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: 'completed' };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('cashier', 'name')
      .sort('-createdAt');

    const fields = [
      { label: 'Order #', value: 'orderNumber' },
      { label: 'Date', value: (row) => new Date(row.createdAt).toLocaleString() },
      { label: 'Customer', value: 'customer.name' },
      { label: 'Cashier', value: 'cashier.name' },
      { label: 'Subtotal', value: 'subtotal' },
      { label: 'Tax', value: 'taxAmount' },
      { label: 'Discount', value: 'discountAmount' },
      { label: 'Total', value: 'total' },
      { label: 'Payment', value: 'paymentMethod' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(orders);

    res.header('Content-Type', 'text/csv');
    res.attachment(`sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};
