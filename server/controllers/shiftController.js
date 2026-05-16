const Shift = require('../models/Shift');
const Order = require('../models/Order');

// @desc    Start new shift
// @route   POST /api/shifts/start
// @access  Protected
exports.startShift = async (req, res, next) => {
  try {
    // Check if there's already an active shift for this user
    const activeShift = await Shift.findOne({ 
      cashier: req.user.id, 
      status: 'active' 
    });

    if (activeShift) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active shift' 
      });
    }

    const shift = await Shift.create({
      cashier: req.user.id,
      openingCash: req.body.openingCash || 0,
      terminal: req.body.terminal || 'POS-01',
      startTime: new Date()
    });

    res.status(201).json({ success: true, shift });
  } catch (error) {
    next(error);
  }
};

// @desc    End current shift
// @route   POST /api/shifts/end
// @access  Protected
exports.endShift = async (req, res, next) => {
  try {
    const shift = await Shift.findOne({ 
      cashier: req.user.id, 
      status: 'active' 
    });

    if (!shift) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active shift found' 
      });
    }

    // Calculate totals from orders during shift
    const orders = await Order.find({
      cashier: req.user.id,
      createdAt: { $gte: shift.startTime },
      status: 'completed'
    });

    let totalSales = 0;
    let totalCash = 0;
    let totalCard = 0;
    let totalUPI = 0;
    let totalWallet = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    orders.forEach(order => {
      totalSales += order.totalAmount;
      totalDiscount += (order.discount || 0);
      totalTax += (order.tax || 0);

      if (order.paymentMethod === 'cash') totalCash += order.totalAmount;
      else if (order.paymentMethod === 'card') totalCard += order.totalAmount;
      else if (order.paymentMethod === 'upi') totalUPI += order.totalAmount;
      else if (order.paymentMethod === 'wallet') totalWallet += order.totalAmount;
    });

    shift.endTime = new Date();
    shift.status = 'closed';
    shift.closingCash = req.body.closingCash;
    shift.notes = req.body.notes;
    shift.totalSales = totalSales;
    shift.totalOrders = orders.length;
    shift.totalCash = totalCash;
    shift.totalCard = totalCard;
    shift.totalUPI = totalUPI;
    shift.totalWallet = totalWallet;
    shift.totalDiscount = totalDiscount;
    shift.totalTax = totalTax;
    shift.orders = orders.map(o => o._id);

    await shift.save();

    res.json({ success: true, shift });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current active shift
// @route   GET /api/shifts/current
// @access  Protected
exports.getCurrentShift = async (req, res, next) => {
  try {
    const shift = await Shift.findOne({ 
      cashier: req.user.id, 
      status: 'active' 
    }).populate('cashier', 'name');
    
    res.json({ success: true, shift });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Admin / Manager
exports.getShifts = async (req, res, next) => {
  try {
    const { cashier, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (cashier) query.cashier = cashier;
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const total = await Shift.countDocuments(query);
    const shifts = await Shift.find(query)
      .populate('cashier', 'name')
      .sort('-startTime')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ 
      success: true, 
      count: shifts.length, 
      total, 
      pages: Math.ceil(total / limit), 
      shifts 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shift report
// @route   GET /api/shifts/:id
// @access  Protected
exports.getShift = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('cashier', 'name')
      .populate({
        path: 'orders',
        select: 'orderNumber totalAmount paymentMethod createdAt'
      });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    res.json({ success: true, shift });
  } catch (error) {
    next(error);
  }
};
