const express = require('express');
const router = express.Router();
const {
  startShift,
  endShift,
  getCurrentShift,
  getShifts,
  getShift
} = require('../controllers/shiftController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/start', startShift);
router.post('/end', endShift);
router.get('/current', getCurrentShift);
router.get('/', authorize('admin', 'manager'), getShifts);
router.get('/:id', getShift);

module.exports = router;
