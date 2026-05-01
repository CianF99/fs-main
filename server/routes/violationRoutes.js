const express = require('express');
const router = express.Router();
const {
  getViolations,
  getViolationById,
  createViolation,
  updateViolation,
  deleteViolation
} = require('../controllers/violationController');
const { protect, adminOrPolice } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getViolations)
  .post(protect, adminOrPolice, createViolation);

router.route('/:id')
  .get(protect, getViolationById)
  .put(protect, adminOrPolice, updateViolation)
  .delete(protect, adminOrPolice, deleteViolation);

module.exports = router;
