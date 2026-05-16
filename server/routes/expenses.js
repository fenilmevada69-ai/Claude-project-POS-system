const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/', getExpenses);
router.post('/', createExpense);
router.get('/summary', getExpenseSummary);
router.route('/:id').put(updateExpense).delete(authorize('admin'), deleteExpense);

module.exports = router;
