const express = require('express');
const router = express.Router();
const { getSummary, getRevenue, getTopProducts, getPaymentMethods } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin', 'manager'));

router.get('/summary', getSummary);
router.get('/revenue', getRevenue);
router.get('/top-products', getTopProducts);
router.get('/payment-methods', getPaymentMethods);

module.exports = router;
