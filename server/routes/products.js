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
const upload = require('../middleware/upload');

router.use(protect);

router.post('/upload-image', authorize('admin', 'manager'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }
  res.json({ 
    success: true, 
    imageUrl: `/uploads/products/${req.file.filename}` 
  });
});

router.route('/').get(getProducts).post(authorize('admin', 'manager'), createProduct);
router.route('/:id').get(getProduct).put(authorize('admin', 'manager'), updateProduct).delete(authorize('admin'), deleteProduct);
router.patch('/:id/stock', authorize('admin', 'manager'), adjustStock);

module.exports = router;
