const Category = require('../models/Category');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Protected
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};
