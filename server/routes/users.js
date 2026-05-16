const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, resetPassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/', authorize('admin', 'manager'), getUsers);
router.post('/', authorize('admin', 'manager'), createUser);
router.put('/:id', authorize('admin', 'manager'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.patch('/:id/reset-password', authorize('admin'), resetPassword);

module.exports = router;
