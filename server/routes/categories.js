const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCategories);

module.exports = router;
