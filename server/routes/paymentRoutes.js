const express = require('express');
const router = express.Router();
const { processPayment, getPayments } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, processPayment);
router.get('/', protect, adminOnly, getPayments);

module.exports = router;
