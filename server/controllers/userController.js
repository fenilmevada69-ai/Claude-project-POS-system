const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin/Manager
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Admin/Manager
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Managers can only create cashiers
    if (req.user.role === 'manager' && role !== 'cashier') {
      return res.status(403).json({ success: false, message: 'Managers can only create cashier accounts' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin/Manager
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Role restrictions for managers
    if (req.user.role === 'manager') {
      if (user.role !== 'cashier' || (role && role !== 'cashier')) {
        return res.status(403).json({ success: false, message: 'Managers can only edit cashier accounts' });
      }
    }

    user = await User.findByIdAndUpdate(req.params.id, { name, email, role, isActive }, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Admin only
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PATCH /api/users/:id/reset-password
// @access  Admin only
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};
