const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Protected
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20, sort = '-createdAt', lowStock } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }];
    if (lowStock === 'true') query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name color icon')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: products.length, total, pages: Math.ceil(total / limit), products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Protected
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name color icon');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin / Manager
exports.createProduct = async (req, res, next) => {
  try {
    // Strip empty category string to avoid ObjectId cast error
    if (!req.body.category || req.body.category === '') {
      delete req.body.category;
    }
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin / Manager
exports.updateProduct = async (req, res, next) => {
  try {
    // Strip empty category string to avoid ObjectId cast error
    if (!req.body.category || req.body.category === '') {
      delete req.body.category;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete (soft) product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust stock
// @route   PATCH /api/products/:id/stock
// @access  Admin / Manager
exports.adjustStock = async (req, res, next) => {
  try {
    const { adjustment, reason } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.stock = Math.max(0, product.stock + Number(adjustment));
    await product.save();

    res.json({ success: true, product, message: `Stock adjusted by ${adjustment}` });
  } catch (error) {
    next(error);
  }
};
