const Customer = require('../models/Customer');
const Order = require('../models/Order');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Protect
exports.getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, customers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Protect
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get order history
    const orders = await Order.find({ customerPhone: customer.phone }).sort({ createdAt: -1 }).limit(10);

    res.json({ success: true, customer, orderHistory: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Protect
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    const existing = await Customer.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Customer with this phone already exists' });
    }

    const customer = await Customer.create({ name, phone, email, address });
    res.status(201).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Protect
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Admin/Manager
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deactivated' });
  } catch (error) {
    next(error);
  }
};
