const express = require('express');
const router = express.Router();
const { raiseDispute, getDisputes, updateDisputeStatus } = require('../controllers/disputeController');
const { protect, adminOrPolice } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, raiseDispute)
  .get(protect, getDisputes);

router.route('/:id')
  .put(protect, adminOrPolice, updateDisputeStatus);

module.exports = router;
