const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/').get(getProducts).post(authorize('admin', 'manager'), createProduct);
router.route('/:id').get(getProduct).put(authorize('admin', 'manager'), updateProduct).delete(authorize('admin'), deleteProduct);
router.patch('/:id/stock', authorize('admin', 'manager'), adjustStock);

module.exports = router;
