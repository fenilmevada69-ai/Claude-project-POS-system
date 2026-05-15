const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder, refundOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/').get(getOrders).post(createOrder);
router.route('/:id').get(getOrder);
router.patch('/:id/refund', authorize('admin', 'manager'), refundOrder);

module.exports = router;
